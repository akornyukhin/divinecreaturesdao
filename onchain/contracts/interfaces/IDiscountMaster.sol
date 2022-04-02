// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IDiscountMaster is IERC165 {
    /**
    /* @dev Returns rate for an address in %% * 1000 
     */
    function discountRate(address address_) external view returns (uint256);
}