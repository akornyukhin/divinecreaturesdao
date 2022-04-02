// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "../interfaces/IEgis.sol";

contract Crowdsale is Ownable {
    using SafeERC20 for IERC20;
    using SafeERC20 for IEgis;
    using ERC165Checker for address;

    // The token being sold
    IEgis public egis;

    // DAI 
    IERC20 public dai;

    // Address where funds are collected
    address public wallet;

    // Address where EGIS is located
    address public egisHolder;

    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    // So, if you are using a rate of 1 with a ERC20Detailed token with 3 decimals called TOK
    // 1 wei will give you 1 unit, or 0.001 TOK.
    uint256 public rate;

    // Amount of wei raised
    uint256 public fundsRaised;

    // Opening and closing time of the sale
    uint256 public openingTime;
    uint256 public closingTime;

    // Buyers contributions (in DAI)
    mapping(address => uint256) private _contributions;

    // Buyers purchase allowances (in DAI)
    mapping(address => uint256) private _caps;

    event TokensPurchased(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    event TokensRetrieved(uint amount);

    constructor(
        uint256 _rate,    // exchange rate DAI vs EGIS 
        address _wallet, // wallet receiving the funds
        address _dai, // DAI address
        address _egis, // address of Egis token
        uint256 _openingTime,     // opening time in unix epoch seconds
        uint256 _closingTime      // closing time in unix epoch seconds
    ) 
    {
        require( _rate == 1, "Wrong rate" );
        require( _wallet != address(0), "Zero receiving address");
        require( _dai != address(0), "Zero DAI address");
        require( _egis != address(0), "Zero Egis address");
        require( _egis.supportsERC165(), "E165" );
        require( _egis.supportsInterface(type(IEgis).interfaceId), "EI" );
        require( _openingTime >= uint32(block.timestamp), "Opening time is before current time");
        require( _closingTime > _openingTime, "Opening time is not before closing time");
        
        rate = _rate;
        wallet = _wallet;
        egisHolder = msg.sender;
        dai = IERC20(_dai);
        egis = IEgis(_egis);
        openingTime = _openingTime;
        closingTime = _closingTime;
    }

    modifier onlyWhileOpen {
        require(isOpen(), "Sale not open");
        _;
    }

    /**
     * @return true if the crowdsale is open, false otherwise.
     */
    function isOpen() public view returns (bool) {
        // solhint-disable-next-line not-rely-on-time
        return uint32(block.timestamp) >= openingTime && uint32(block.timestamp) <= closingTime;
    }


    function buyTokens(address beneficiary, uint256 daiAmount) public {
   
        _preValidatePurchase(beneficiary, daiAmount);

        // calculate Egis amount to be transfered
        uint256 egisAmount = _getTokenAmount(daiAmount);

        // Increase total number of funds raised
        fundsRaised += daiAmount;

        _processPurchase(beneficiary, daiAmount, egisAmount);
        emit TokensPurchased(msg.sender, beneficiary, daiAmount, egisAmount);
    }

     /**
     * @dev Sets a specific beneficiary's maximum contribution.
     * @param beneficiary Address to be capped
     * @param cap Dai limit for individual contribution
     */
    function setCap(address beneficiary, uint256 cap) external onlyOwner {
        return _setCap(beneficiary, cap);
    }

    /**
     * @dev Sets a batch of beneficiary's maximum contribution.
     * @param beneficiaries List of beneficiaries addresses
     * @param caps List of Dai limit for individual contribution
     */
    function setBatchCap(address[] memory beneficiaries, uint256[] memory caps) external onlyOwner {
        for (uint i = 0; i < beneficiaries.length; i++) {
            _setCap(beneficiaries[i], caps[i]);
        }
    }

    function _setCap(address beneficiary, uint256 cap) internal {
        _caps[beneficiary] = cap;
    }

    /**
     * @dev Returns the cap of a specific beneficiary.
     * @param beneficiary Address whose cap is to be checked
     * @return Current cap for individual beneficiary
     */
    function getCap(address beneficiary) public view returns (uint256) {
        return _caps[beneficiary];
    }

    /**
     * @dev Returns the amount contributed so far by a specific beneficiary.
     * @param beneficiary Address of contributor
     * @return Beneficiary contribution so far
     */
    function getContribution(address beneficiary) public view returns (uint256) {
        return _contributions[beneficiary];
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param daiAmount Amount of dai contributed (without decimals)
     */
    function _preValidatePurchase(address beneficiary, uint256 daiAmount) internal view {
        require( daiAmount > 0, "No funds transfered");
        require(daiAmount <= _caps[beneficiary],
         "IndividuallyCappedCrowdsale: beneficiary's cap exceeded");
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param daiAmount Value in dai to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 daiAmount) internal pure returns (uint256) {
        return daiAmount * 1e9 / 1e18;
    }

    function _processPurchase(address beneficiary, uint256 daiAmount, uint256 tokenAmount) internal returns (bool) {
        dai.safeTransferFrom(beneficiary, wallet, daiAmount);
        egis.safeTransferFrom(egisHolder, beneficiary, tokenAmount);
        _contributions[beneficiary] += daiAmount;
        _caps[beneficiary] -= daiAmount;
        return true;
    }
}

