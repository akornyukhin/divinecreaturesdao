// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "./IERC20WithDecimals.sol";
import "./IERC20Enumerable.sol";

interface IaEgis is IERC20WithDecimals, IERC20Enumerable {
    function rebase( uint256 profit_, uint epoch_ ) external returns ( bool );

    function getMintAmount() external view returns ( uint256 );

    function balanceOf( address who ) external view returns ( uint256 );
    
    function index() external view returns ( uint256 );

    function totalSupply() external view returns ( uint256 );

    function circulatingSupply() external view returns ( uint256 );

    // TODO: Separate following into an own interface? 
    function bandCirculatingSupply(uint i) external view returns (uint256);

    function updateBandRate(uint256 band, uint256 rate) external;

    function getBandAddresses( uint32 band_ ) external view returns ( address[] memory );

    function getUserBand(address address_) external view returns (uint);
}