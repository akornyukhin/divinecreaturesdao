// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./libraries/uniswap/LowGasSafeMath.sol";

import "./interfaces/IEgis.sol";
import "./interfaces/IBondCalculator.sol";
import "./interfaces/IERC20WithDecimals.sol";
import "./interfaces/IUniswapV2Pair.sol";

contract BondCalculator is ERC165, IBondCalculator {
    using ERC165Checker for address;
    using LowGasSafeMath for *;

    IERC20WithDecimals public immutable Egis;

    constructor( address egis_ ) {
        require( egis_ != address(0), "E0" );
        require( egis_.supportsERC165(), "BM165" );
        require( egis_.supportsInterface(type(IEgis).interfaceId), "BMI" );
        Egis = IERC20WithDecimals(egis_);
    }

    function getKValue( address _pair ) public view returns( uint k_ ) {
        uint token0 = IERC20WithDecimals( IUniswapV2Pair( _pair ).token0() ).decimals();
        uint token1 = IERC20WithDecimals( IUniswapV2Pair( _pair ).token1() ).decimals();
        uint pairDecimals = IERC20WithDecimals( _pair ).decimals();

        (uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();

        if ((token0 + token1) < pairDecimals)
        {
            uint decimals = pairDecimals - (token0 + token1);
            k_ = reserve0 * reserve1 * ( 10 ** decimals );
        }
        else {
            uint decimals = token0 + token1 - pairDecimals;
            k_ = reserve0 * reserve1 / ( 10 ** decimals );
        }
    }

    function getTotalValue( address _pair ) public view returns ( uint _value ) {
        _value = getKValue( _pair ).sqrrt() * (2);
    }

    function valuation( address _pair, uint amount_ ) external view override returns ( uint _value ) {
        uint totalValue = getTotalValue( _pair );
        uint totalSupply = IUniswapV2Pair( _pair ).totalSupply();

        _value = totalValue * LowGasSafeMath.fraction( amount_, totalSupply ).decode112with18() / 1e18 ;
    }

    function markdown( address _pair ) external view override returns ( uint ) {
        ( uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();

        uint reserve;
        if ( IUniswapV2Pair( _pair ).token0() == address(Egis) ) {
            reserve = reserve1;
        } else {
            require(IUniswapV2Pair( _pair ).token1() == address(Egis), "not a Egis lp pair");
            reserve = reserve0;
        }

        return reserve * ( 2 * ( 10 ** Egis.decimals() ) ) / getTotalValue( _pair );
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IBondCalculator).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
