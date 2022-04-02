// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "hardhat/console.sol";

import "../interfaces/IBandMover.sol";

contract MockBandMover is ERC165, IBandMover {
    function moveBand(address address_, uint256 toBand) external view returns ( bool ) {
        console.log("MockBandMover. address: '%s', toBand: '%s'", address_, toBand);
        return true;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IBandMover).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}