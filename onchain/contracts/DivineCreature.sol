// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./interfaces/IBlessable.sol";
import "./interfaces/IERC721WithQuality.sol";


contract DivineCreature is ERC721, ERC721Enumerable, ERC721URIStorage,
    Pausable, Ownable, ERC721Burnable, IERC721WithQuality {
    using ERC165Checker for address;
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeCast for uint256;

    event BlessableAdded( address blessable );
    event BlessableRemoved( address blessable );
    event Blessed( address address_, uint8[] qualities );

    Counters.Counter private _tokenIdCounter;
    EnumerableSet.AddressSet private _holders;
    EnumerableSet.AddressSet private _blessables;

    // Mapping from token ID to approved address
    mapping(uint256 => uint8) private _qualities;

    constructor() ERC721("DivineCreature", "dEGIS") {
    }

    // Add BlessingHub address
    function addBlessable(address blessable_) public onlyOwner {
        require( blessable_ != address(0), "B0" );
        require( blessable_.supportsERC165(), "B165" );
        require( blessable_.supportsInterface(type(IBlessable).interfaceId), "BI" );

        if (!_blessables.contains(blessable_)) {
            IBlessable blessable = IBlessable(blessable_);

            for (uint i = 0; i < _holders.length(); i++) {
                address holder = _holders.at(i);
                blessable.bless(holder, qualitiesByOwner(holder));
            }

            _blessables.add(blessable_);
            emit BlessableAdded(blessable_);
        }
    }

    // Remove BlessingHub address
    function removeBlessable(address blessable_) public onlyOwner {
        require( blessable_ != address(0), "EmptyAddress" );

        if (!_blessables.contains(blessable_)) {
            _blessables.remove(blessable_);
            emit BlessableRemoved(blessable_);
        }
    }

    function quality(uint256 tokenId) public view virtual returns (uint8) {
        return _qualities[tokenId];
    }

    function qualitiesByOwner(address tokensOwner) public view virtual returns (uint8[] memory) {
        uint count = balanceOf(tokensOwner);
        uint8[] memory qualities = new uint8[](count);
        for (uint i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(tokensOwner, i);
            qualities[i] = quality(tokenId);
        }
        return qualities;
    }

    function _bless(address holder) internal returns (bool) {
        if (holder == address(0)) return false;
        uint8[] memory qualities = qualitiesByOwner(holder);
        for (uint i = 0; i < _blessables.length(); i++) {
            IBlessable blessable = IBlessable(_blessables.at(i));
            blessable.bless(holder, qualities);
        }

        emit Blessed(holder, qualities);

        return true;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function blessables() external view returns (address[] memory) {
        return _blessables.values();
    }

    function holders() external view returns (address[] memory) { // TODO: Keep it private?
        return _holders.values();
    }

    function safeMint(address to, uint8 quality_, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _qualities[tokenId] = quality_;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function safeMintBatch(address to, uint8 quality_, string[] memory uris) public onlyOwner {
        for (uint i = 0; i < uris.length; i++) {
            string memory uri = uris[i];
            safeMint(to, quality_, uri);
        }
    }

    function _mint(address to, uint256 tokenId) internal virtual override {
        super._mint(to, tokenId);
        _afterTokenTransfer(address(0), to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override (ERC721, ERC721URIStorage) {
        address owner = ERC721.ownerOf(tokenId);
        super._burn(tokenId);
        _afterTokenTransfer(owner, address(0), tokenId);
    }

    function burnBatch(uint256[] memory tokenIds) public virtual {
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            burn(tokenId);
        }
    }

    function _transfer(address from, address to, uint256 tokenId) internal virtual override {
        super._transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal whenNotPaused
        override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);

        if (address(0) != from) _holders.add(from);
        if (address(0) != to) _holders.add(to);
    }

    function _afterTokenTransfer(address from, address to, uint256) internal virtual {
        if (address(0) != from) {
            if (balanceOf(from) == 0) _holders.remove(from);
            _bless(from);
        }

        if (address(0) != to) {
            if (balanceOf(to) == 0) _holders.remove(to);
            if (from != to) _bless(to);
        }
    }

    function transferFromBatch(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public {
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            transferFrom(from, to, tokenId);
        }
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage)
        returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual
        override(ERC721, ERC721Enumerable, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721WithQuality).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            ERC721Enumerable.supportsInterface(interfaceId);
    }
}
