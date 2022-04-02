// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../interfaces/IUniswapV2Pair.sol";

contract UniswapV2Pair is ERC20, IUniswapV2Pair {
    address private immutable _token0;
    address private immutable _token1;
    uint112 private immutable _reserve0; 
    uint112 private immutable _reserve1;
    uint32 private immutable _blockTimestampLast;

    constructor(address token0_, address token1_, uint112 reserve0_, uint112 reserve1_, uint32 blockTimestampLast_) ERC20("SushiSwap LP Token", "SLP") {
        _token0 = token0_;
        _token1 = token1_;
        _reserve0 = reserve0_;
        _reserve1 = reserve1_;
        _blockTimestampLast = blockTimestampLast_;
    }

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        blockTimestampLast = _blockTimestampLast;
    }

    function token0() external view returns ( address ) {
        return _token0;
    }

    function token1() external view returns ( address ) {
        return _token1;
    }

        /**
     * @dev Allow a user to deposit underlying tokens and mint the corresponding number of wrapped tokens.
     */
    function mint(address account, uint256 amount) public virtual {
        _mint(account, amount);
    }
}