// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./interfaces/IaEgis.sol";
import "./interfaces/IBandMaster.sol";
import "./interfaces/IBandMover.sol";
import "./interfaces/IStaking.sol";

contract aEgis is ERC20, ERC165, Ownable, Pausable, ERC20Permit, IaEgis, IBandMover {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Counters for Counters.Counter;
    using ERC165Checker for address;
    
    modifier onlyStakingContract() {
        require( msg.sender == stakingContract, "OSC" );
        _;
    }

    modifier onlyBandMaster() {
        require( msg.sender == bandMaster, "OBM" );
        _;
    }

    uint256 private constant MAX_SUPPLY = ~uint128(0);  // (2^128) - 1

    address public stakingContract;
    address public bandMaster;
    address public initializer;

    struct Band {
        uint256 baseRate; // in ten-thousandths ( 5000 = 0.5% )
        uint256 circulatingSupply;
        uint256[] rates;
    }

    Band[] public bands; 
    EnumerableSet.AddressSet[] private _bandAddresses; 
    EnumerableSet.AddressSet private _addresses;

    struct Holder {
        uint256 entryBalance;
        uint256 entryIndex;
        uint256 band;
    }

    mapping ( address => Holder ) private holders;

    mapping ( address => mapping ( address => uint256 ) ) private _allowedValue;

    uint256 private _stakingContractSupply; 

    uint256 public rateBase;

    uint256 public constant multiplier = 1_000_000_000_000;

    event LogRebase( uint256 indexed epoch, uint256 rebase, uint256 index );
    event LogStakingContractUpdated( address stakingContract );
    event LogSetIndex( uint256 indexed index );
    event LogMoveBand( uint256 fromBand, uint256 toBand);
    event LogBondCirculatingSupply( uint256 balanceBefore, uint256 balanceAfter );
    event LogRateChanged(uint256 indexed index, uint256 band, uint256 newRate );

    struct Rebase {
        uint epoch;
        uint rebase; // 18 decimals
        uint totalStakedBefore;
        uint totalStakedAfter;
        uint amountRebased;
        uint index;
        uint32 timeOccured;
    }

    Rebase[] public rebases;

    Counters.Counter private _index;

    constructor() ERC20("aEgis", "AEGIS") ERC20Permit("aEgis") {
        initializer = msg.sender;
    }

    function initialize( address stakingContract_, uint256 rateBase_, uint256[] calldata rates_ ) 
        external returns ( bool ) {
        require( msg.sender == initializer, "NA" );
        require( stakingContract_ != address(0), "IA" );
        require( stakingContract_.supportsERC165(), "SI165" );
        require( stakingContract_.supportsInterface(type(IStaking).interfaceId), "SI" );

        stakingContract = stakingContract_;
        rateBase = rateBase_;
        
        for (uint i = 0; i < rates_.length; i++) {
            bands.push(Band ({
                baseRate: rates_[i],
                circulatingSupply: 0,
                rates: new uint[](0)
            }));

            bands[i].rates.push((rateBase + bands[i].baseRate) * multiplier);

            _bandAddresses.push();
        }

        _stakingContractSupply = MAX_SUPPLY;     

        emit Transfer( address(0x0), stakingContract, _stakingContractSupply );
        emit LogStakingContractUpdated( stakingContract_ );
        
        initializer = address(0);
        return true;
    }

    function setBandMaster( address bandMaster_ ) public onlyOwner {
        require( bandMaster_ != address(0), "BM0" );
        require( bandMaster_.supportsERC165(), "BM165" );
        require( bandMaster_.supportsInterface(type(IBandMaster).interfaceId), "BMI" );
        bandMaster = bandMaster_;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function totalSupply() public view virtual override (ERC20, IaEgis) returns ( uint256 ) {
        return circulatingSupply();
    }

    function circulatingSupply() public view returns ( uint256 ) {
        uint circulatingSupply_ = 0;
        for (uint i = 0; i < bands.length; i++) {  
            circulatingSupply_ += bands[i].circulatingSupply;
        }

        return circulatingSupply_;
    }

    function getMintAmount() external view returns ( uint256 ) {
        uint mintAmount = 0;
        for (uint i = 0; i < bands.length; i++) {  
            mintAmount += bands[i].circulatingSupply * bands[i].baseRate / rateBase;
        }

        return mintAmount;
    }

    function bandCirculatingSupply(uint i) external view returns (uint256) {
        require(i < bands.length);
        return bands[i].circulatingSupply;
    }

    function _updateHolder(address address_, uint256 entryBalance) private {
        Holder storage holder = holders[address_];
        holder.entryBalance = entryBalance;
        holder.entryIndex = index();
        uint band = holder.band;
        if (!_bandAddresses[band].contains(address_)) {
            _bandAddresses[band].add(address_);
            _addresses.add(address_);
        } 
    }

    function moveBand(address address_, uint256 toBand) external onlyBandMaster returns ( bool ) { 
        return _moveBand(address_, toBand, false);
    }

    function _moveBand(address address_, uint256 toBand, bool force_) private returns ( bool ) {
        require(toBand < bands.length, "TBNE");

        uint256 fromBand = holders[address_].band;

        if (!force_ && fromBand == toBand) return false; 

        uint256 holderBalanceBefore = balanceOf(address_);
        _updateHolder(address_, holderBalanceBefore);
        holders[address_].entryIndex = index();
        holders[address_].band = toBand;

        emit LogMoveBand( fromBand, toBand);

        uint256 bondBalanceBefore = bands[fromBand].circulatingSupply;
        bands[fromBand].circulatingSupply -= holderBalanceBefore;
        bands[toBand].circulatingSupply += holderBalanceBefore;
        
        emit LogBondCirculatingSupply(bondBalanceBefore, bands[fromBand].circulatingSupply);

        if (_bandAddresses[fromBand].contains(address_)) {
            _bandAddresses[fromBand].remove(address_);
        }

        _bandAddresses[toBand].add(address_);

        return true;
    }

    function updateBandRate(uint256 band, uint256 rate) external onlyOwner {
        require(rate > 0, "RZ");
        require(band < bands.length, "BNE");
        
        EnumerableSet.AddressSet storage bandAddresses = _bandAddresses[band];
        for (uint i = 0; i < bandAddresses.length(); i++) {
            uint256 holderBalanceBefore = balanceOf(bandAddresses.at(i));
            _updateHolder(bandAddresses.at(i), holderBalanceBefore);
        }

        bands[band].baseRate = rate;
        bands[band].rates = new uint[](0);
        bands[band].rates.push((rateBase + bands[band].baseRate) * multiplier);

        emit LogRateChanged( index(), band, rate );
    }

    function index() public view returns ( uint256 ) {
        return _index.current();
    }

    /**
        @notice increases aEgis supply to increase staking balances relative to profit_
        @param profit_ uint256
        @return uint256
     */
    function rebase(uint256 profit_, uint epoch_) public onlyStakingContract returns ( bool ) {
        uint256 circulatingSupply_ = circulatingSupply();

        if ( profit_ == 0 ) {
            emit LogRebase( epoch_, 0, index() );
            return false;
        } else if ( circulatingSupply_ > 0 ) {

            for (uint i = 0; i < bands.length; i++) {  //for loop example
                bands[i].circulatingSupply += bands[i].circulatingSupply * bands[i].baseRate / rateBase;
                uint256[] memory bandRates = bands[i].rates;
                uint256 newRate = bandRates[0] * bandRates[bandRates.length-1] / ( rateBase * multiplier );
                bands[i].rates.push(newRate);
            }

            _index.increment();

            _storeRebase( circulatingSupply_, profit_, epoch_ );
        }

        return true;
    }

    /**
        @notice emits event with data about rebase
        @param previousCirculating_ uint
        @param profit_ uint
        @param epoch_ uint
        @return bool
     */
    function _storeRebase( uint256 previousCirculating_, uint256 profit_, uint256 epoch_ ) internal returns ( bool ) {
        uint rebasePercent = profit_ * 1e18 / previousCirculating_;

        rebases.push( Rebase ( {
            epoch: epoch_,
            rebase: rebasePercent, // 18 decimals
            totalStakedBefore: previousCirculating_,
            totalStakedAfter: circulatingSupply(),
            amountRebased: profit_,
            index: index(),
            timeOccured: uint32(block.timestamp)
        }));
        
        emit LogRebase( epoch_, rebasePercent, index() );

        return true;
    }

    function balanceOf(address address_) public view virtual override(ERC20, IaEgis) returns ( uint256 ) {
        
        uint addressLocalIndex = 0;
        uint entryBalance = 0;
        uint rate = 0;

        Holder storage holder = holders[address_];
        if (address_ == stakingContract) {
            return _stakingContractSupply;
        } else {
            addressLocalIndex = index() - holder.entryIndex;

            if (addressLocalIndex == 0) {
                return holder.entryBalance;
            } else {
                entryBalance = holder.entryBalance;
                rate = bands[holder.band].rates[addressLocalIndex-1];

                return entryBalance * rate / ( rateBase * multiplier );
            }
        }
    }

    function transfer( address to, uint256 value ) public override(IERC20, ERC20) returns (bool) {
        _transfer( msg.sender, to, value );
        return true;
    }

    function transferFrom( address from, address to, uint256 value ) public override(IERC20, ERC20) returns ( bool ) {
        _allowedValue[ from ][ msg.sender ] = _allowedValue[ from ][ msg.sender ] - value;
        emit Approval( from, msg.sender,  _allowedValue[ from ][ msg.sender ] );
        
        _transfer( from, to, value );
        return true;
    }

    function _transfer( address from, address to, uint256 value ) internal virtual override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, value);

        uint senderBalance = 0;
        uint senderBand = 0;

        if ( from == stakingContract ) {
            senderBalance = _stakingContractSupply;
        } else {
            senderBalance = balanceOf(from);
            senderBand = holders[from].band;
        }
        
        require(value <= senderBalance, "NEB");

        if (from == stakingContract) {
            _stakingContractSupply -= value;
        } else {
            bands[senderBand].circulatingSupply -= value;
            _updateHolder(from, senderBalance - value );
        }

        if ( to == stakingContract ) {
            _stakingContractSupply += value;
        } else {
            bands[holders[to].band].circulatingSupply += value;
            _updateHolder(to, balanceOf(to) + value);
        }

        emit Transfer( msg.sender, to, value );

        _afterTokenTransfer(from, to, value);
    }

    function getUserBand(address address_) public view returns (uint) {
        return bands[holders[address_].band].baseRate;
    }

    function allowance( address owner_, address spender ) public view override(IERC20, ERC20) returns ( uint256 ) {
        return _allowedValue[ owner_ ][ spender ];
    }

    function approve( address spender, uint256 value ) public override(IERC20, ERC20) returns (bool) {
         _allowedValue[ msg.sender ][ spender ] = value;
         emit Approval( msg.sender, spender, value );
         return true;
    }

    function increaseAllowance( address spender, uint256 addedValue ) public override returns (bool) {
        _allowedValue[ msg.sender ][ spender ] = _allowedValue[ msg.sender ][ spender ] + addedValue;
        emit Approval( msg.sender, spender, _allowedValue[ msg.sender ][ spender ] );
        return true;
    }

    function decreaseAllowance( address spender, uint256 subtractedValue ) public override returns (bool) {
        uint256 oldValue = _allowedValue[ msg.sender ][ spender ];
        if (subtractedValue >= oldValue) {
            _allowedValue[ msg.sender ][ spender ] = 0;
        } else {
            _allowedValue[ msg.sender ][ spender ] = oldValue - subtractedValue;
        }
        emit Approval( msg.sender, spender, _allowedValue[ msg.sender ][ spender ] );
        return true;
    }

    function decimals() public view virtual override (ERC20, IERC20WithDecimals) returns (uint8) {
        return 9;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override (ERC20, IERC20WithDecimals) returns (string memory) {
        return super.name();
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return super.symbol();
    }

    function getBandAddresses( uint32 band_ ) external view onlyOwner returns ( address[] memory ) {
        return _bandAddresses[band_].values();
    }

    function addressAt(uint256 idx) external view onlyOwner returns (address) {
        return _addresses.at(idx);
    }

    function addressContains(address address_) external view onlyOwner returns (bool) {
        return _addresses.contains(address_);
    }

    function addresses() external view onlyOwner returns (address[] memory) {
        return _addresses.values();
    }

    function addressesLength() external view onlyOwner returns (uint256) {
        return _addresses.length();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IaEgis).interfaceId ||
            interfaceId == type(IBandMover).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}