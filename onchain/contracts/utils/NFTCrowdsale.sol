// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../interfaces/IERC20WithDecimals.sol";
import "../interfaces/IERC721WithQuality.sol";

contract NFTCrowdsale is Ownable {
    using SafeERC20 for IERC20WithDecimals;
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC165Checker for address;

    // Divine creatures (nft)
    IERC721Enumerable public divineCreatures;

    // FTM
    IERC20WithDecimals public ftm;

    // Address where funds are collected
    address public wallet;

    // Amount of wei raised
    uint256 public fundsRaised;

    // Opening and closing time of the sale
    uint256 public openingTime;
    uint256 public closingTime;

    // Flag if we need to check the addreess approval
    bool private _checkApproval= true;

    // Addresses allowed for purchase
    EnumerableSet.AddressSet private _approvedBuyes;

    // Mapping to check who bought token
    EnumerableSet.AddressSet private _boughtNFT;

    event NFTPurchased(address indexed purchaser, address indexed beneficiary, uint256 tokenId);

    constructor(
        address _wallet, // wallet receiving the funds
        address _ftm, // mim address
        address _divineCreatures, // Divine creatures (nft) address
        uint256 _openingTime,     // opening time in unix epoch seconds
        uint256 _closingTime      // closing time in unix epoch seconds
    )
    {
        require( _wallet != address(0), "Zero receiving address");
        require( _ftm != address(0), "Zero FTM address");
        require( _divineCreatures != address(0), "Zero divine creature (nft) address");
        require( _divineCreatures.supportsERC165(), "E165" );
        require( _divineCreatures.supportsInterface(type(IERC721WithQuality).interfaceId), "EI" );

        require( _openingTime >= uint32(block.timestamp), "Opening time is before current time");
        require( _closingTime > _openingTime, "Opening time is not before closing time");

        wallet = _wallet;
        ftm = IERC20WithDecimals(_ftm);
        divineCreatures = IERC721Enumerable(_divineCreatures);
        openingTime = _openingTime;
        closingTime = _closingTime;
    }

    modifier onlyWhileOpen {
        require(isOpen(), "Sale not open");
        _;
    }

    modifier onlyWhileClose {
        require( !isOpen(), "Sale is open");
        _;
    }

    /**
     * @return true if the crowdsale is open, false otherwise.
     */
    function isOpen() public view returns (bool) {
        // solhint-disable-next-line not-rely-on-time
        return uint32(block.timestamp) >= openingTime && uint32(block.timestamp) <= closingTime;
    }

    /**
     * @return true if the crowdsale is open, false otherwise.
     */
    function nftPrice() public pure returns (uint256) {
        return 125 * 10 ** 18;
    }

    /**
     * @dev Add a batch of address to the allowed buyers
     * @param beneficiary addresses to own the NFT
     * @param amount expected exactly nftPrice()
     */
    function buyNFT(address beneficiary, uint amount) public {
        uint256 nftPrice_ = nftPrice();
        require(amount == nftPrice_, string(abi.encodePacked("Incorrect amount. Expected exactly: ", nftPrice_)));
        bool approved = checkApproved(beneficiary);

        if ( _checkApproval ) {
            require(approved, "Address not approved");
        }

        require(!_boughtNFT.contains(beneficiary), "NFT already bought");

        uint tokenId = _getTokenId();

        _processPurchase(beneficiary, tokenId, amount);

        emit NFTPurchased(msg.sender, beneficiary, tokenId);
    }

    function setDevineCreature(address _divineCreatures) external onlyOwner returns(bool) {
        require( _divineCreatures != address(0), "Zero divine creature (nft) address");
        require( _divineCreatures.supportsERC165(), "E165" );
        require( _divineCreatures.supportsInterface(type(IERC721WithQuality).interfaceId), "EI" );
        divineCreatures = IERC721Enumerable( _divineCreatures );
        return true;
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }

     /**
     * @dev Add a specific address to the allowed buyers
     * @param beneficiary Address to be added
     */
    function addAddress(address beneficiary) external onlyOwner {
        return _addAddress(beneficiary);
    }

    /**
     * @dev Add a batch of address to the allowed buyers
     * @param beneficiaries List of addresses to be added
     */
    function addBatchAddress(address[] memory beneficiaries) external onlyOwner {
        for (uint i = 0; i < beneficiaries.length; i++) {
            _addAddress(beneficiaries[i]);
        }
    }

    function _addAddress(address beneficiary) internal {
        _approvedBuyes.add(beneficiary);
    }

    /**
     * @dev Checks if the address is approved for NFT buy.
     * @param beneficiary Address  to be checked
     * @return True/False if the address is approved
     */
    function checkApproved(address beneficiary) public view returns (bool) {
        return _addressContains(beneficiary);
    }

    function _getTokenId() internal view returns(uint) {
        uint256 balance = divineCreatures.balanceOf(address(this));
        require( balance != 0, "All NFT are sold" );
        return divineCreatures.tokenOfOwnerByIndex(address(this), random() % balance);
    }

    function _processPurchase(address beneficiary, uint256 tokenId, uint amount) internal returns (bool) {
        ftm.safeTransferFrom(beneficiary, wallet, amount);
        divineCreatures.safeTransferFrom(address(this), beneficiary, tokenId);
        fundsRaised += amount;
        _boughtNFT.add(beneficiary);
        return true;
    }

    function retrieveNFT() external onlyOwner onlyWhileClose returns(bool) {
        uint nftAmount = divineCreatures.balanceOf(address(this));

        for (uint i=0; i < nftAmount; i++) {
            divineCreatures.safeTransferFrom(address(this), wallet, _getTokenId());
        }

        return true;
    }

    function removeApprovalCheck() external onlyOwner {
        _checkApproval = false;
    }

    function toggleApprovalCheck() external onlyOwner {
        _checkApproval = true;
    }

    // Support functions
    function addressAt(uint256 idx) external view onlyOwner returns (address) {
        return _approvedBuyes.at(idx);
    }

    function addressContains(address address_) external view onlyOwner returns (bool) {
        return _addressContains(address_);
    }

    function _addressContains(address address_) internal view returns (bool) {
        return _approvedBuyes.contains(address_);
    }

    function approvedAddresses() external view onlyOwner returns (address[] memory) {
        return _approvedBuyes.values();
    }

    function approvedAddressesLength() external view onlyOwner returns (uint256) {
        return _approvedBuyes.length();
    }

    function buyersAddresses() external view onlyOwner returns (address[] memory) {
        return _boughtNFT.values();
    }

    function buyersAddressesLength() external view onlyOwner returns (uint256) {
        return _boughtNFT.length();
    }
}