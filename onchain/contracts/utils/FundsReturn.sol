// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FundsReturn is Ownable {
    using SafeERC20 for ERC20;

    // Wallet where funds are stored
    address gnosisSafe;

    // Token
    ERC20 public token;

    // Token returns
    mapping(address => uint) private tokenReturns;

    event TokensReturned(address _benefeciary, uint _tokenAmount, string _token);

    constructor(
        address _gnosisSafe,
        address _token
    ) {
        require( _gnosisSafe != address(0), "Zero gnosis");
        require( _token != address(0), "Zero Token address");

        gnosisSafe = _gnosisSafe;
        token = ERC20(_token);
    }

    function setReturn(address beneficiary, uint cap) public onlyOwner {
        tokenReturns[beneficiary] = cap;
    }

    function setBatchReturn(address[] memory beneficiaries, uint[] memory caps) external onlyOwner {
        for (uint i = 0; i < beneficiaries.length; i++) {
            setReturn(beneficiaries[i], caps[i]);
        }
    }

    function getReturn(uint tokenAmount) external {
        require(tokenAmount > 0, "No funds withdrawn");
        require(tokenAmount <= outstandingAmount(msg.sender), "Token Cap exceeded");

        token.safeTransferFrom(gnosisSafe, msg.sender, tokenAmount);
        tokenReturns[msg.sender] -= tokenAmount;

        emit TokensReturned(msg.sender, tokenAmount, token.name());
    }

    function outstandingAmount(address beneficiary) public view returns (uint) {
        return tokenReturns[beneficiary];
    }
}
