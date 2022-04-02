// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

// import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

interface IBondDepository is IERC165 {
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
    ) external;

    function setDiscountMaster( address discountMaster_ ) external;
    
    /* ======== POLICY FUNCTIONS ======== */

    enum PARAMETER { VESTING, PAYOUT, FEE, DEBT, MINPRICE }
    
    /**
     *  @notice set parameters for new bonds
     *  @param _parameter PARAMETER
     *  @param _input uint
     */
    function setBondTerms ( PARAMETER _parameter, uint _input ) external;

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
    ) external;

    /**
     *  @notice set contract for auto stake
     *  @param _staking address
     *  @param _helper bool
     */
    function setStaking( address _staking, bool _helper ) external;

    /* ======== USER FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint
     *  @param _maxPrice uint
     *  @param _depositor address
     *  @return uint
     */
    function deposit(uint _amount, uint _maxPrice, address _depositor) external returns ( uint );

    /** 
     *  @notice redeem bond for user
     *  @param _recipient address
     *  @param _stake bool
     *  @return uint
     */ 
    function redeem( address _recipient, bool _stake ) external returns ( uint );
    
    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout() external view returns ( uint );

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function payoutFor( uint _value, address buyer_) external view returns ( uint );

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint
     */
    function bondPrice(address buyer_) external view returns ( uint price_ );

    /**
     *  @notice converts bond price to DAI value
     *  @return price_ uint
     */
    function bondPriceInUSD(address buyer_) external view returns ( uint price_ );


    /**
     *  @notice calculate current ratio of debt to Egis supply
     *  @return debtRatio_ uint
     */
    function debtRatio() external view returns ( uint debtRatio_ );

    /**
     *  @notice debt ratio in same terms for reserve or liquidity bonds
     *  @return uint
     */
    function standardizedDebtRatio() external view returns ( uint );

    /**
     *  @notice calculate debt factoring in decay
     *  @return uint
     */
    function currentDebt() external view returns ( uint );

    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint
     */
    function percentVestedFor( address _depositor ) external view returns ( uint percentVested_ );

    /**
     *  @notice calculate amount of Egis available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint
     */
    function pendingPayoutFor( address _depositor ) external view returns ( uint pendingPayout_ );

    /* ======= AUXILLIARY ======= */

    /**
     *  @notice allow anyone to send lost tokens (excluding principle or Egis) to the DAO
     *  @return bool
     */
    function recoverLostToken( IERC20 _token ) external returns ( bool );
}