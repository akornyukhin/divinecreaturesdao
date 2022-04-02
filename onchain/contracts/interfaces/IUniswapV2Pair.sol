// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// interface IUniswapV2ERC20 {
//     function totalSupply() external view returns (uint);
// }

interface IUniswapV2Pair is IERC20 {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns ( address );
    function token1() external view returns ( address );
}