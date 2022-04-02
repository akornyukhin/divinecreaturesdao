// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./interfaces/IBlessable.sol";
import "./interfaces/IBandMaster.sol";
import "./interfaces/IBandMover.sol";
import "./interfaces/IDiscountMaster.sol";
import "./interfaces/IERC721WithQuality.sol";

contract BlessingHub is IBlessable, ERC165, Pausable, Ownable, IBandMaster, IDiscountMaster {
    using ERC165Checker for address;

    modifier onlyNft() {
        require( msg.sender == nft, "ONFT" );
        _;
    }

    address private bandMover;
    address private nft;
    uint8 stakingBandsCount;
    uint256[] bondingRates;

    event Blessed(address indexed recipient, uint amount);

    constructor(address bandMover_, address nft_, uint8 stakingBandsCount_, uint256[] memory bondingRates_) {
        require( bandMover_ != address(0), "BM0" );
        require( bandMover_.supportsERC165(), "BM165" );
        require( bandMover_.supportsInterface(type(IBandMover).interfaceId), "BMI" );
        bandMover = bandMover_;
        require( nft_ != address(0), "N0" );
        require( nft_.supportsERC165(), "N165" );
        require( nft_.supportsInterface(type(IERC721WithQuality).interfaceId), "NI" );
        nft = nft_;
        stakingBandsCount = stakingBandsCount_;
        bondingRates = bondingRates_;
    }

    function bless(address address_, uint8[] memory qualities) external onlyNft whenNotPaused {
        uint256 bandStaking = 0;
        for (uint i = 0; i < qualities.length; i++) {
            uint8 quality = qualities[i];
            if (quality == 3) {
                bandStaking += 2;
            } else if (quality == 2) {
                bandStaking += 1;
            } else if (quality == 10) {
                bandStaking += 10;
            }
        }
        if (bandStaking >= stakingBandsCount - 1) {
            bandStaking = stakingBandsCount - 1;
        }

        IBandMover(bandMover).moveBand(address_, bandStaking);
    }

    function discountRate(address address_) external view returns (uint256) {
        IERC721WithQuality nftContract = IERC721WithQuality(nft);
        uint8[] memory qualities = nftContract.qualitiesByOwner(address_);

        uint256 bandBonding = 0;
        for (uint i = 0; i < qualities.length; i++) {
            uint8 quality = qualities[i];
            // console.log(quality);
            if (quality == 3) {
                bandBonding += 2;
            }
            if (quality == 2) {
                bandBonding += 2;
            }
            if (quality == 1) {
                bandBonding += 1;
            }
        }

        if (bandBonding >= bondingRates.length - 1) {
            bandBonding = bondingRates.length - 1;
        }

        // console.log("Blessing band: %s", bandBonding);
        return bondingRates[bandBonding];
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IBlessable).interfaceId ||
            interfaceId == type(IBandMaster).interfaceId ||
            interfaceId == type(IDiscountMaster).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}