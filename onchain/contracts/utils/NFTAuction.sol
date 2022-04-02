// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

import "../interfaces/IERC20WithDecimals.sol";
import "../interfaces/IERC721WithQuality.sol";

contract Auction is Ownable {
    using SafeERC20 for IERC20WithDecimals;
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC165Checker for address;

    // Divine creatures (nft)
    IERC721Enumerable public divineCreatures;
    IERC721WithQuality private divineCreaturesQualities;

    // FTM
    IERC20WithDecimals public ftm;

    struct AuctionLot {
        address highestBidder; // address of the heighst bidder
        uint256 tokenId; // tokenId of the NFT being sold
        uint256 localOpenTime; // lot local auction open time in unix time
        uint256 localAuctionEndTime; // lot local auction end time in unix time
        uint256 highestBid; // current highest bid (in FTM)
        uint256 minIncrement; // min increment on top of highest bid (in FTM)
        bool ended; // flag if the auction ended
        mapping(address => uint) pendingReturns; // funds which have to be returned
    }

    AuctionLot[] public auctionLots;
    uint256 public auctionLength;

    // Receiver of funds
    address public beneficiary;

    // Events that will be emitted on changes.
    event HighestBidIncreased(uint lotId, address bidder, uint amount);
    event AuctionEndedSuccess(uint lotId, uint tokenId, address winner, uint amount);
    event AuctionEndedNoBidder(uint lotId);
    event FundsWithdrawn(uint lotId, address bidder, uint amount);
    event FundsWithdrawFailed(uint lotId, address bidder, uint amount);
    event AuctionExtended(uint lotId, uint newEndTime);
    event AuctionEndedRetrieve(uint lotId, uint tokenId);
    event LotPlaced(uint tokenId, uint startPrice, uint openTime, uint auctionLength, uint minIncrement);
    event LotIncrementUpdated(uint lotId, uint updateIncrement);
    event LotStartPriceUpdated(uint lotId, uint updatePrice);

    constructor(
        address _beneficiary, // beneficiary receiving the funds
        address _ftm, // mim address
        address _divineCreatures // divine creatures (nft) address
    ) {
        require( _beneficiary != address(0), "Zero receiving address");
        require( _ftm != address(0), "Zero FTM address");
        require( _divineCreatures != address(0), "Zero blessing hub address");
        require( _divineCreatures.supportsERC165(), "E165" );
        require( _divineCreatures.supportsInterface(type(IERC721WithQuality).interfaceId), "EI" );

        beneficiary = _beneficiary;
        ftm = IERC20WithDecimals(_ftm);
        divineCreatures = IERC721Enumerable(_divineCreatures);
        divineCreaturesQualities = IERC721WithQuality(_divineCreatures);
    }

    function setDevineCreature(address _divineCreatures) external onlyOwner returns(bool) {
        require( _divineCreatures != address(0), "Zero divine creature (nft) address");
        require( _divineCreatures.supportsERC165(), "E165" );
        require( _divineCreatures.supportsInterface(type(IERC721WithQuality).interfaceId), "EI" );
        divineCreatures = IERC721Enumerable( _divineCreatures );
        return true;
    }

    function placeLot(
        uint256 _tokenId,
        uint256 _startPrice, 
        uint256 _openTime, 
        uint256 _auctionLength, 
        uint256 _minIncrement) external onlyOwner {
        _placeLot( _tokenId, _startPrice, _openTime, _auctionLength, _minIncrement);
    }

    function batchPlaceLot(
        uint256[] memory tokenIds,
        uint256 _startPrice, 
        uint256 _openTime, 
        uint256 _auctionLength, 
        uint256 _minIncrement) external onlyOwner {
            for (uint i = 0; i < tokenIds.length; i++) {
                _placeLot(tokenIds[i], _startPrice, _openTime, _auctionLength, _minIncrement);
        } 
    }

    function _placeLot(
        uint256 _tokenId, 
        uint256 _startPrice, 
        uint256 _openTime, 
        uint256 _auctionLength, 
        uint256 _minIncrement) internal returns(bool) {
        require( _openTime >= uint32(block.timestamp), "Opening time is before current time");
        require(divineCreatures.ownerOf(_tokenId) == address(this), "NFT not owned");
        uint8 nftQuality = divineCreaturesQualities.quality(_tokenId);

        if (nftQuality == 1) {
            require(_startPrice >= 125 * (10 ** ftm.decimals()), "Wrong price");
        } else if (nftQuality == 2) {
            require(_startPrice >= 420 * (10 ** ftm.decimals()), "Wrong price");
        } else if (nftQuality == 3) {
            require(_startPrice >= 840 * (10 ** ftm.decimals()), "Wrong price");
        }

        // for test decreasing it to 10 seconds
        require(_auctionLength >= 3600, "The auction must be at least 1 hour");
        require(_minIncrement >= 5, "Increment must be at least 1FTM");

        // Push empty lot to get 0 in all fields
        auctionLots.push();
        auctionLength = auctionLength + 1;
        AuctionLot storage auctionLot = auctionLots[auctionLots.length-1];

        auctionLot.tokenId = _tokenId;
        auctionLot.highestBidder = address(0);
        auctionLot.highestBid = _startPrice;
        auctionLot.localOpenTime = _openTime;
        auctionLot.localAuctionEndTime = _openTime + _auctionLength;
        auctionLot.minIncrement = _minIncrement;
        auctionLot.ended = false;

        emit LotPlaced(_tokenId, _startPrice, _openTime, _auctionLength, _minIncrement);

        return true;
    }

    function updateLotMinPrice(
        uint256 _lotId, 
        uint256 _startPrice) external onlyOwner {
            AuctionLot storage auctionLot = auctionLots[_lotId];

            require( auctionLot.highestBidder == address(0), "Lot has bids" );
            auctionLot.highestBid = _startPrice;
            emit LotStartPriceUpdated(_lotId, _startPrice);
        }

    function updateLotIncrement(
        uint256 _lotId, 
        uint256 _minIncrement) external onlyOwner {
        _updateLot(_lotId, _minIncrement);
    }

    function batchUpdateLot(
        uint256[] memory lotIds,
        uint256[] memory minIncrements) external onlyOwner {
            for (uint i = 0; i < lotIds.length; i++) {
                _updateLot(lotIds[i], minIncrements[i]);
        } 
    }

    function _updateLot(
        uint256 _lotId, 
        uint256 _minIncrement) internal returns(bool) {

        require(_minIncrement >= 1, "Increment must be at least 1FTM");

        AuctionLot storage auctionLot = auctionLots[_lotId];

        auctionLot.minIncrement = _minIncrement;

        emit LotIncrementUpdated(_lotId, _minIncrement);

        return true;
    }

    function bid( uint256 lotId, uint256 bidAmount ) external returns(bool) {
        AuctionLot storage auctionLot = auctionLots[lotId];

        require( !auctionLot.ended, "Auction ended");
        require(msg.sender != auctionLot.highestBidder, "You are highest bidder");

        if (auctionLot.highestBidder != address(0)) {
            require(bidAmount >= auctionLot.highestBid + auctionLot.minIncrement, "Bid too small");
        }
        
        if ( auctionLot.highestBidder != address(0) ) {
            auctionLot.pendingReturns[auctionLot.highestBidder] += auctionLot.highestBid;
        }

        uint amountToTransfer = bidAmount;

        if ( auctionLot.pendingReturns[msg.sender] != 0 ) {
            amountToTransfer = bidAmount - auctionLot.pendingReturns[msg.sender];
            auctionLot.pendingReturns[msg.sender] = 0;
        }

        ftm.safeTransferFrom(msg.sender, address(this), amountToTransfer);
        auctionLot.highestBidder = msg.sender;
        auctionLot.highestBid = bidAmount;

        emit HighestBidIncreased(lotId, msg.sender, bidAmount);

        return true;
    }

    function pendingReturnsFor(uint256 lotId, address address_) public view returns (uint256) {
        return auctionLots[lotId].pendingReturns[address_];
    }

    /// Withdraw a bid that was overbid.
    function withdrawFunds(uint256 lotId) external {
        AuctionLot storage auctionLot = auctionLots[lotId];
        uint amount = auctionLot.pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            auctionLot.pendingReturns[msg.sender] = 0;

            // Using simple transfer here, so that we can return pendingAmount back
            if ( !ftm.transfer(msg.sender, amount) ) {
                // No need to call throw here, just reset the amount owing
                auctionLot.pendingReturns[msg.sender] = amount;
                emit FundsWithdrawFailed(lotId, msg.sender, amount);
            }
        }

        emit FundsWithdrawn(lotId, msg.sender, amount);
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd(uint256 lotId, bool _force) external onlyOwner returns(bool) {
        AuctionLot storage auctionLot = auctionLots[lotId];

        require(!auctionLot.ended, "Lot auction already ended");

        if ( _force ) {
            auctionLot.ended = true;

            if (auctionLot.highestBidder != address(0)) {
                ftm.safeTransfer(beneficiary, auctionLot.highestBid);
                divineCreatures.safeTransferFrom(address(this), auctionLot.highestBidder, auctionLot.tokenId);
                emit AuctionEndedSuccess(lotId, auctionLot.tokenId, auctionLot.highestBidder, auctionLot.highestBid);
                } else {
                emit AuctionEndedNoBidder(lotId);
                return true;
            }
        }

        if ( auctionLot.highestBidder == address(0) ) {
            auctionLot.localAuctionEndTime = auctionLot.localAuctionEndTime  + uint(block.timestamp) + 3600;
            emit AuctionExtended(lotId, auctionLot.localAuctionEndTime);
            return false;
        }

        require(uint256(block.timestamp) >= auctionLot.localAuctionEndTime, "Lot auction is still live");

        auctionLot.ended = true;

        if (auctionLot.highestBidder != address(0)) {
            ftm.safeTransfer(beneficiary, auctionLot.highestBid);
            divineCreatures.safeTransferFrom(address(this), auctionLot.highestBidder, auctionLot.tokenId);
            emit AuctionEndedSuccess(lotId, auctionLot.tokenId, auctionLot.highestBidder, auctionLot.highestBid);
        } else {
            emit AuctionEndedNoBidder(lotId);
        }

        return true;
    }

    function retrieveLot(uint256 lotId, address _addressTo) external onlyOwner{
        _retrieveLot(lotId, _addressTo);
    }

    function batchRetrieveLot(uint[] memory lotIds, address _addressTo) external onlyOwner {
        for (uint i = 0; i < lotIds.length; i++) {
            _retrieveLot(lotIds[i], _addressTo);
        } 
    }

    function _retrieveLot(uint256 lotId, address _addressTo) internal returns(bool) {
        require(lotId < auctionLots.length, "Wrong lot id");
        AuctionLot storage auctionLot = auctionLots[lotId];
        uint tokenId = auctionLot.tokenId;
        divineCreatures.safeTransferFrom(address(this), _addressTo, tokenId);

        if ( !auctionLot.ended ) {
            auctionLot.ended = true;
        }

        emit AuctionEndedRetrieve(lotId, tokenId);
        return true;
    }
}