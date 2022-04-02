// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "./interfaces/IEgis.sol";
import "./interfaces/IERC20WithDecimals.sol";
import "./VaultOwned.sol";

contract Egis is ERC20, /*IERC20Enumerable,*/ ERC20Snapshot, ERC20Permit, VaultOwned, IEgis, ERC165 {

    constructor() ERC20("Egis", "EGIS") ERC20Permit("Egis") {
        // This is initial mint for presale
        // _mint(msg.sender, 1448438000000000);
    }

    function mint(address account_, uint256 amount_) external onlyVault() {
        _mint(account_, amount_);
    }

    function burn(uint256 amount) external virtual {
        _burn(msg.sender, amount);
    }
     
    function burnFrom(address account_, uint256 amount_) external virtual {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) internal virtual {
        uint256 decreasedAllowance_ =
            allowance(account_, msg.sender) - amount_;

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override(ERC20, IERC20WithDecimals) returns (string memory) {
        return ERC20.name();
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return ERC20.symbol();
    }


    function decimals() public view virtual override(ERC20, IERC20WithDecimals) returns (uint8) {
        return 9;
    }

    function snapshot() public onlyOwner {
        _snapshot();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override (ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IEgis).interfaceId ||
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IERC20Permit).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}