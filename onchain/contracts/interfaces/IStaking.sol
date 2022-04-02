// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IStaking is IERC165 {
    function stake( uint _amount, address _recipient ) external;
    function unstake( uint _amount, bool _trigger ) external;

    function rebase() external;
}