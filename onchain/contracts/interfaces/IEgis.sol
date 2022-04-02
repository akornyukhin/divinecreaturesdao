// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "./IERC20WithDecimals.sol";
import "./IERC20Mintable.sol";

interface IEgis is IERC20Mintable, IERC20WithDecimals {
    function burnFrom(address account_, uint256 amount_) external;
}
