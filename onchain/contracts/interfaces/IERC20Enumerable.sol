// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
interface IERC20Enumerable is IERC20, IERC165 {
    /**
     * @dev Returns the list of addresses ever used this token.
     */
    function addresses() external view returns (address[] memory);

    /**
     * @dev Returns the length of the list of addresses ever used this token.
     */
    function addressesLength() external view returns (uint256);

    /**
     * @dev Returns address at index of list of addresses ever used this token.
     */
    function addressAt(uint256 index) external view returns (address);

    /**
     * @dev Returns address at index of list of addresses ever used this token.
     */
    function addressContains(address address_) external view returns (bool);
}
