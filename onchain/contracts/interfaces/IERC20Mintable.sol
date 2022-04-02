// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC20Mintable is IERC165 {
  function mint( address account_, uint256 ammount_ ) external;
}