// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC721WithQuality is IERC165 {
    function quality(uint256 tokenId) external view returns (uint8);
    function qualitiesByOwner(address tokensOwner) external view returns (uint8[] memory);
    function holders() external view returns (address[] memory); 
}