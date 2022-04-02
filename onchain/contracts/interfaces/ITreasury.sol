// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface ITreasury is IERC165 {
    function deposit( uint _amount, address _token, uint _profit ) external returns ( uint );
    function valueOf( address _token, uint _amount ) external view returns ( uint value_ );

    function mintRewards( address _recipient, uint _amount ) external;
}
