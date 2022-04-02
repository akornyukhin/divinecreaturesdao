// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./libraries/uniswap/LowGasSafeMath.sol";

import "./interfaces/IEgis.sol";
import "./interfaces/IBondDepository.sol";
import "./interfaces/IERC20WithDecimals.sol";
import "./interfaces/IBondCalculator.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IDiscountMaster.sol";

contract BondDepository is IBondDepository, Ownable, ERC165 {
    using ERC165Checker for address;
    using LowGasSafeMath for *;
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20WithDecimals;
    using SafeERC20 for IEgis;

    /* ======== EVENTS ======== */

    event BondCreated( uint deposit, uint indexed payout, uint indexed expires, uint indexed priceInUSD );
    event BondRedeemed( address indexed recipient, uint payout, uint remaining );
    event BondPriceChanged( uint indexed priceInUSD, uint indexed internalPrice, uint indexed debtRatio );
    event ControlVariableAdjustment( uint initialBCV, uint newBCV, uint adjustment, bool addition );
    event InitTerms( Terms terms);
    event LogSetTerms(PARAMETER param, uint value);
    event LogSetAdjustment( Adjust adjust);
    event LogSetStaking( address indexed stakingContract, bool isHelper);
    event LogRecoverLostToken( address indexed tokenToRecover, uint amount);

    /* ======== STATE VARIABLES ======== */

    IEgis public immutable Egis; // token given as payment for bond
    IERC20WithDecimals public immutable principle; // token used to create bond
    ITreasury public immutable treasury; // mints Egis when receives principle
    address public immutable DAO; // receives profit share from bond

    bool public immutable isLiquidityBond; // LP and Reserve bonds are treated slightly different
    IBondCalculator public immutable bondCalculator; // calculates value of LP tokens
    IDiscountMaster public discountMaster; // calculates discount to the bond price

    IStaking public staking; // to auto-stake payout
    bool public useHelper;

    Terms public terms; // stores terms for new bonds
    Adjust public adjustment; // stores adjustment to BCV data

    mapping( address => Bond ) public bondInfo; // stores bond information for depositors

    uint public totalDebt; // total value of outstanding bonds; used for pricing
    uint32 public lastDecay; // reference time for debt decay

    /* ======== STRUCTS ======== */

    // Info for creating new bonds
    struct Terms {
        uint controlVariable; // scaling variable for price
        uint minimumPrice; // vs principle value
        uint maxPayout; // in thousandths of a %. i.e. 500 = 0.5%
        uint fee; // as % of bond payout, in hundreths. ( 500 = 5% = 0.05 for every 1 paid)
        uint maxDebt; // 9 decimal debt ratio, max % total supply created as debt
        uint32 vestingTerm; // in seconds
    }

    // Info for bond holder
    struct Bond {
        uint payout; // Egis remaining to be paid
        uint pricePaid; // In DAI, for front end viewing
        uint32 lastTime; // Last interaction
        uint32 vesting; // Seconds left to vest
        uint32 exists; // Check if address already deposited
    }

    // Info for incremental adjustments to control variable 
    struct Adjust {
        bool add; // addition or subtraction
        uint rate; // increment
        uint target; // BCV when adjustment finished
        uint32 buffer; // minimum length (in seconds) between adjustments
        uint32 lastTime; // time when last adjustment made
    }

    /* ======== INITIALIZATION ======== */

    constructor ( 
        address egis_,
        address principle_, // MIM
        address treasury_, 
        address DAO_, 
        address bondCalculator_
    ) {
        require( egis_ != address(0), "E0" );
        require( egis_.supportsERC165(), "E165" );
        require( egis_.supportsInterface(type(IEgis).interfaceId), "EI" );
        Egis = IEgis(egis_);
        require( principle_ != address(0), "P0" );
        principle = IERC20WithDecimals(principle_);
        require( treasury_ != address(0), "T0" );
        require( treasury_.supportsERC165(), "T165" );
        require( treasury_.supportsInterface(type(ITreasury).interfaceId), "TI" );
        treasury = ITreasury(treasury_);
        require( DAO_ != address(0) );
        DAO = DAO_;
        // bondCalculator should be address(0) if not LP bond
        require( bondCalculator_ == address(0) 
            || (bondCalculator_.supportsERC165() 
                && bondCalculator_.supportsInterface(type(IBondCalculator).interfaceId)), "B0" );
        bondCalculator = IBondCalculator(bondCalculator_);
        isLiquidityBond = ( bondCalculator_ != address(0) );
    }

    /**
     *  @notice initializes bond parameters
     *  @param _controlVariable uint
     *  @param _vestingTerm uint32
     *  @param _minimumPrice uint
     *  @param _maxPayout uint
     *  @param _fee uint
     *  @param _maxDebt uint
     */
    function initializeBondTerms( 
        uint _controlVariable, 
        uint _minimumPrice,
        uint _maxPayout,
        uint _fee,
        uint _maxDebt,
        uint32 _vestingTerm
    ) external onlyOwner {
        require( terms.controlVariable == 0, "Bonds must be initialized from 0" );
        require( _controlVariable >= 40, "Can lock adjustment" );
        require( _maxPayout <= 1000, "Payout cannot be above 1 percent" );
        require( _vestingTerm >= 1, "Vesting must be longer than 36 hours" );
        require( _fee <= 10000, "DAO fee cannot exceed payout" );
        terms = Terms ({
            controlVariable: _controlVariable,
            minimumPrice: _minimumPrice,
            maxPayout: _maxPayout,
            fee: _fee,
            maxDebt: _maxDebt,
            vestingTerm: _vestingTerm
        });
        lastDecay = uint32(block.timestamp);
        emit InitTerms(terms);
    }

    function setDiscountMaster( address discountMaster_ ) public onlyOwner {
        require( discountMaster_ != address(0), "DM0" );
        require( discountMaster_.supportsERC165(), "DM165" );
        require( discountMaster_.supportsInterface(type(IDiscountMaster).interfaceId), "DMI" );
        discountMaster = IDiscountMaster(discountMaster_);
    }
    
    /**
     *  @notice set parameters for new bonds
     *  @param _parameter PARAMETER
     *  @param _input uint
     */
    function setBondTerms ( PARAMETER _parameter, uint _input ) external onlyOwner {
        if ( _parameter == PARAMETER.VESTING ) { // 0
            require( _input >= 1, "Vesting must be longer than 36 hours" );
            terms.vestingTerm = uint32(_input);
        } else if ( _parameter == PARAMETER.PAYOUT ) { // 1
            require( _input <= 1000, "Payout cannot be above 1 percent" );
            terms.maxPayout = _input;
        } else if ( _parameter == PARAMETER.FEE ) { // 2
            require( _input <= 10000, "DAO fee cannot exceed payout" );
            terms.fee = _input;
        } else if ( _parameter == PARAMETER.DEBT ) { // 3
            terms.maxDebt = _input;
        } else if ( _parameter == PARAMETER.MINPRICE ) { // 4
            terms.minimumPrice = _input;
        }
        emit LogSetTerms(_parameter, _input);
    }

    /**
     *  @notice set control variable adjustment
     *  @param _addition bool
     *  @param _increment uint
     *  @param _target uint
     *  @param _buffer uint
     */
    function setAdjustment ( 
        bool _addition,
        uint _increment, 
        uint _target,
        uint32 _buffer 
    ) external onlyOwner {
        require( _increment <= terms.controlVariable * 25 / 1000 , "Increment too large" );
        require(_target >= 40, "Next Adjustment could be locked");
        adjustment = Adjust({
            add: _addition,
            rate: _increment,
            target: _target,
            buffer: _buffer,
            lastTime: uint32(block.timestamp)
        });
        emit LogSetAdjustment(adjustment);
    }

    /**
     *  @notice set contract for auto stake
     *  @param _staking address
     *  @param _helper bool
     */
    function setStaking( address _staking, bool _helper ) external onlyOwner {
        require( _staking != address(0), "IA" );
        if ( _helper ) {
            useHelper = true;
        } else {
            useHelper = false;
            staking = IStaking(_staking);
        }
        emit LogSetStaking(_staking, _helper);
    }

    /* ======== USER FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint
     *  @param _maxPrice uint
     *  @param _depositor address
     *  @return uint
     */
    function deposit(uint _amount, uint _maxPrice, address _depositor) external returns ( uint ) {
        require( _depositor != address(0), "Invalid address" );
        require( msg.sender == _depositor, "LFNA" );

        if ( bondInfo[_depositor].exists == 1) {
            _redeem(_depositor, false);
        }
        
        uint priceInUSD = bondPriceInUSD(msg.sender); // Stored in bond info
        uint nativePrice = _bondPrice(msg.sender);

        require( _maxPrice >= nativePrice, "Slippage limit: more than max price" ); // slippage protection

        uint value = treasury.valueOf( address(principle), _amount );
        uint payout = payoutFor( value, msg.sender ); // payout to bonder is computed
        require( (totalDebt + value) <= terms.maxDebt, "Max capacity reached" );
        require( payout >= 10000000, "Bond too small" ); // must be > 0.01 Egis ( underflow protection )
        require( payout <= maxPayout(), "Bond too large"); // size protection because there is no slippage

        // profits are calculated
        uint fee = payout * terms.fee / 10000;
        uint profit = value - payout - fee;

        uint balanceBefore = Egis.balanceOf(address(this));

        // principle is transferred in approved and deposited into the treasury, returning (_amount - profit) Egis
        principle.safeTransferFrom( msg.sender, address(this), _amount );
        principle.approve( address( treasury ), _amount );
        treasury.deposit( _amount, address(principle), profit );
        
        if ( fee != 0 ) { // fee is transferred to dao 
            Egis.safeTransfer( DAO, fee ); 
        }
        require(balanceBefore + payout == Egis.balanceOf(address(this)), "Not enough Egis to cover profit");
        // total debt is increased
        totalDebt = totalDebt + payout; 
                
        // depositor info is stored
        bondInfo[ _depositor ] = Bond({ 
            payout: bondInfo[ _depositor ].payout + payout,
            vesting: terms.vestingTerm,
            lastTime: uint32(block.timestamp),
            pricePaid: priceInUSD,
            exists: 1
        });

        // indexed events are emitted
        emit BondCreated( _amount, payout, (block.timestamp + terms.vestingTerm), priceInUSD );
        emit BondPriceChanged( bondPriceInUSD(msg.sender), _bondPrice(msg.sender), debtRatio() );

        _adjust(); // control variable is adjusted
        return payout; 
    }

    /** 
     *  @notice redeem bond for user
     *  @param _recipient address
     *  @param _stake bool
     *  @return uint
     */ 
    function redeem( address _recipient, bool _stake ) external returns ( uint ) {
        require(msg.sender == _recipient, "NA");     
        return _redeem(_recipient, _stake);
    }

    function _redeem( address _recipient, bool _stake ) internal returns ( uint ) {
        Bond memory info = bondInfo[ _recipient ];
        // (seconds since last interaction / vesting term remaining)
        uint percentVested = percentVestedFor( _recipient );
        
        if ( percentVested >= 10000 ) { // if fully vested
            _decayDebt(info.payout);
            delete bondInfo[ _recipient ]; // delete user info
            emit BondRedeemed( _recipient, info.payout, 0 ); // emit bond data
            return _stakeOrSend( _recipient, _stake, info.payout ); // pay user everything due

        } else { // if unfinished
            // calculate payout vested
            uint payout = info.payout * percentVested / 10000 ;
            _decayDebt(payout);
            // store updated deposit info
            bondInfo[ _recipient ] = Bond({
                payout: info.payout - payout,
                vesting: info.vesting - ( uint32( block.timestamp ) - info.lastTime ),
                lastTime: uint32(block.timestamp),
                pricePaid: info.pricePaid,
                exists: info.exists
            });

            emit BondRedeemed( _recipient, payout, bondInfo[ _recipient ].payout );
            return _stakeOrSend( _recipient, _stake, payout );
        }  
    }

    function adjust() external onlyOwner {
        return _adjust();
    }
    
    /* ======== INTERNAL HELPER FUNCTIONS ======== */

    /**
     *  @notice allow user to stake payout automatically
     *  @param _stake bool
     *  @param _amount uint
     *  @return uint
     */
    function _stakeOrSend( address _recipient, bool _stake, uint _amount ) internal returns ( uint ) {
        if ( !_stake ) { // if user does not want to stake
            Egis.transfer( _recipient, _amount ); // send payout
        } else { // if user wants to stake
                Egis.approve( address(staking), _amount );
                staking.stake( _amount, _recipient );
        }
        return _amount;
    }

    /**g
     *  @notice makes incremental adjustment to control variable
     */
    function _adjust() internal {
        uint timeCanAdjust = adjustment.lastTime + adjustment.buffer;
        if( adjustment.rate != 0 && block.timestamp >= timeCanAdjust ) {
            uint initial = terms.controlVariable;
            uint bcv = initial;
            if ( adjustment.add ) {
                bcv = bcv + adjustment.rate;
                if ( bcv >= adjustment.target ) {
                    adjustment.rate = 0;
                    bcv = adjustment.target;
                }
            } else {
                bcv = bcv - adjustment.rate;
                if ( bcv <= adjustment.target ) {
                    adjustment.rate = 0;
                    bcv = adjustment.target;
                }
            }
            terms.controlVariable = bcv;
            adjustment.lastTime = uint32(block.timestamp);
            emit ControlVariableAdjustment( initial, bcv, adjustment.rate, adjustment.add );
        }
    }

    /**
     *  @notice reduce total debt
     */
    function _decayDebt(uint value_) internal {
        totalDebt = totalDebt - value_;
        lastDecay = uint32(block.timestamp);
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout() public view returns ( uint ) {
        return Egis.totalSupply() * terms.maxPayout / 100000 ;
    }

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function payoutFor( uint _value, address buyer_) public view returns ( uint ) {
        return LowGasSafeMath.fraction( _value, bondPrice(buyer_) ).decode112with18() / 1e16 ;
    }

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint
     */
    function bondPrice(address buyer_) public view returns ( uint price_ ) {        
        uint discount = 0;

        price_ = (terms.controlVariable * debtRatio() + 1000000000) / 1e7;

        discount = discountMaster.discountRate(buyer_);
        price_ = (1000 - discount) * price_ / 1000;

        if ( price_ < terms.minimumPrice ) {
            price_ = terms.minimumPrice;
        }
    }

    /**
     *  @notice calculate current bond price and remove floor if above
     *  @return price_ uint
     */
    function _bondPrice(address buyer_) internal returns ( uint price_ ) {
        uint discount = 0;

        price_ = (terms.controlVariable * debtRatio() + 1000000000) / 1e7;

        discount = discountMaster.discountRate(buyer_);
        price_ = (1000 - discount) * price_ / 1000;

        if ( price_ < terms.minimumPrice ) {
            price_ = terms.minimumPrice;        
        } else if ( terms.minimumPrice != 0 ) {
            terms.minimumPrice = 0;
        }
    }

    /**
     *  @notice converts bond price to DAI value
     *  @return price_ uint
     */
    function bondPriceInUSD(address buyer_) public view returns ( uint price_ ) {
        if( isLiquidityBond ) {
            price_ = bondPrice(buyer_) * bondCalculator.markdown( address(principle) ) / 100 ;
        } else {
            price_ = bondPrice(buyer_) * 10 ** principle.decimals() / 100;
        }
    }


    /**
     *  @notice calculate current ratio of debt to Egis supply
     *  @return debtRatio_ uint
     */
    function debtRatio() public view returns ( uint debtRatio_ ) {   
        uint supply = Egis.totalSupply();
        debtRatio_ = LowGasSafeMath.fraction( 
            currentDebt() * 1e9, 
            supply
        ).decode112with18() / 1e18;
    }

    /**
     *  @notice debt ratio in same terms for reserve or liquidity bonds
     *  @return uint
     */
    function standardizedDebtRatio() external view returns ( uint ) {
        if ( isLiquidityBond ) {
            return debtRatio() * bondCalculator.markdown( address(principle) ) / 1e9;
        } else {
            return debtRatio();
        }
    }

    /**
     *  @notice calculate debt factoring in decay
     *  @return uint
     */
    function currentDebt() public view returns ( uint ) {
        return totalDebt;
    }

    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint
     */
    function percentVestedFor( address _depositor ) public view returns ( uint percentVested_ ) {
        Bond memory bond = bondInfo[ _depositor ];
        uint secondsSinceLast = uint32(block.timestamp) - bond.lastTime;
        uint vesting = bond.vesting;

        if ( vesting > 0 ) {
            percentVested_ = secondsSinceLast * 10000 / vesting;
        } else {
            percentVested_ = 0;
        }
    }

    /**
     *  @notice calculate amount of Egis available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint
     */
    function pendingPayoutFor( address _depositor ) external view returns ( uint pendingPayout_ ) {
        uint percentVested = percentVestedFor( _depositor );
        uint payout = bondInfo[ _depositor ].payout;

        if ( percentVested >= 10000 ) {
            pendingPayout_ = payout;
        } else {
            pendingPayout_ = payout * percentVested / 10000;
        }
    }

    /* ======= AUXILLIARY ======= */

    /**
     *  @notice allow anyone to send lost tokens (excluding principle or Egis) to the DAO
     *  @return bool
     */
    function recoverLostToken( IERC20 _token ) external returns ( bool ) {
        require( _token != Egis, "NAT" );
        require( _token != principle, "NAP" );
        uint balance = _token.balanceOf( address(this));
        _token.safeTransfer( DAO,  balance );
        emit LogRecoverLostToken(address(_token), balance);
        return true;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IBondDepository).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}