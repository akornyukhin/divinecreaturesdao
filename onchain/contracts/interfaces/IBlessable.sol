// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IBlessable is IERC165 {
    function bless(address address_, uint8[] memory qualities) external;
}