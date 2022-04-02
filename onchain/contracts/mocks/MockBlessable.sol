// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "../interfaces/IBlessable.sol";

contract MockBlessable is ERC165, IBlessable {
    function bless(address address_, uint8[] memory qualities) view external {
        console.log("MockBlessable. address: '%s'", address_);
        for (uint i = 0; i < qualities.length; i++) {
            console.log("MockBlessable. qualities[%s]: '%s'", i, qualities[i]);
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IBlessable).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}