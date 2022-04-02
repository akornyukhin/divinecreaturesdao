// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IDistributor.sol";
import "./interfaces/IEgis.sol";
import "./interfaces/IaEgis.sol";
import "./interfaces/IStaking.sol";

contract Staking is ERC165, IStaking, Ownable {
    using ERC165Checker for address;
    using SafeERC20 for IEgis;
    using SafeERC20 for IaEgis;

    IEgis public immutable Egis;
    IaEgis public immutable aEgis;

    struct Epoch {
        uint number;
        uint distribute;
        uint32 length;
        uint32 endTime;
    }
    Epoch public epoch;

    IDistributor public distributor;

    event LogStake(address indexed recipient, uint256 amount);
    event LogUnstake(address indexed recipient, uint256 amount);
    event LogRebase(uint256 distribute);
    event LogSetDistributor(address indexed _address);

    constructor (
        address egis_,
        address aEgis_,
        uint32 _epochLength,
        uint _firstEpochNumber,
        uint32 _firstEpochTime
    ) {
        require( egis_ != address(0), "E0" );
        require( egis_.supportsERC165(), "E165" );
        require( egis_.supportsInterface(type(IEgis).interfaceId), "EI" );
        Egis = IEgis(egis_);
        require( aEgis_ != address(0), "AE0" );
        require( aEgis_.supportsERC165(), "AE165" );
        require( aEgis_.supportsInterface(type(IaEgis).interfaceId), "AEI" );
        aEgis = IaEgis(aEgis_);

        epoch = Epoch({
            length: _epochLength,
            number: _firstEpochNumber,
            endTime: _firstEpochTime,
            distribute: 0
        });
    }

    /**
        @notice stake Egis
        @param _amount uint
     */
    function stake( uint _amount, address _recipient ) external {
        rebase();

        Egis.safeTransferFrom( msg.sender, address(this), _amount );
        aEgis.safeTransfer( msg.sender, _amount );
        emit LogStake(_recipient, _amount);
    }

    /**
        @notice redeem aEgis for Egis
        @param _amount uint
        @param _trigger bool
     */
    function unstake( uint _amount, bool _trigger ) external {
        aEgis.safeTransferFrom( msg.sender, address(this), _amount );
        Egis.safeTransfer(msg.sender, _amount );

        if ( _trigger ) {
            rebase();
        }

        emit LogUnstake(msg.sender, _amount);
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endTime <= uint32(block.timestamp) ) {

            uint staked = aEgis.circulatingSupply();
            uint mintAmount = aEgis.getMintAmount();

            if ( address(distributor) != address(0) ) {
                if ( mintAmount != 0 ) {
                    distributor.distribute(mintAmount);
                }
            }

            uint balance = contractBalance();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance - staked;
            }

            aEgis.rebase( epoch.distribute, epoch.number );

            epoch.endTime = epoch.endTime + epoch.length;
            epoch.number++;

            emit LogRebase(epoch.distribute);
        }
    }

    /**
        @notice returns contract Egis holdings, including bonuses provided
        @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return Egis.balanceOf(address(this));
    }

    /**
        @notice sets the contract address for LP staking
        @param address_ address
     */
    function setDistributor( address address_ ) external onlyOwner {
        require( address_ != address(0), "D0" );
        require( address_.supportsERC165(), "D165" );
        require( address_.supportsInterface(type(IDistributor).interfaceId), "DI" );
        distributor = IDistributor(address_);
        emit LogSetDistributor(address_);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IStaking).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
