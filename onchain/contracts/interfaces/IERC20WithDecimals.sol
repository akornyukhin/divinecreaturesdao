// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC20WithDecimals is IERC20, IERC165 {
    function name() external view returns (string memory);
    function decimals() external view returns (uint8);
}