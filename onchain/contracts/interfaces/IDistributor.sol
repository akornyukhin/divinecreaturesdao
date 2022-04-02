// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IDistributor is IERC165 {
    function distribute(uint stacked_) external returns ( bool );
}