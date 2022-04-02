// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./interfaces/IEgis.sol";
import "./interfaces/IDistributor.sol";
import "./interfaces/ITreasury.sol";

contract Distributor is ERC165, Ownable, IDistributor {
    using ERC165Checker for address;

    /* ====== VARIABLES ====== */

    IEgis public immutable Egis;
    ITreasury public immutable treasury;
    
    uint32 public immutable epochLength;
    uint32 public nextEpochTime;

    event LogDistribute(address indexed recipient, uint amount);
    event LogAdjust(uint initialRate, uint currentRate, uint targetRate);
    event LogAddRecipient(address indexed recipient);
    event LogRemoveRecipient(address indexed recipient);
    
    /* ====== STRUCTS ====== */
        
    struct Info {
        address recipient;
    }
    Info[] public info;
       
    /* ====== CONSTRUCTOR ====== */

    constructor( address treasury_, address egis_, uint32 epochLength_, uint32 nextEpochTime_ ) {        
        require( treasury_ != address(0), "T0" );
        require( treasury_.supportsERC165(), "T165" );
        require( treasury_.supportsInterface(type(ITreasury).interfaceId), "TI" );
        treasury = ITreasury(treasury_);
        require( egis_ != address(0), "E0" );
        require( egis_.supportsERC165(), "E165" );
        require( egis_.supportsInterface(type(IEgis).interfaceId), "EI" );
        Egis = IEgis(egis_);
        epochLength = epochLength_;
        nextEpochTime = nextEpochTime_;
    }
    
    /* ====== PUBLIC FUNCTIONS ====== */
    
    /**
        @notice send epoch reward to staking contract
     */
    function distribute(uint _stacked) external returns ( bool ) {
        if ( nextEpochTime <= uint32(block.timestamp) ) {
            nextEpochTime = nextEpochTime + epochLength; // set next epoch time
            
            // distribute rewards to each recipient
            for ( uint i = 0; i < info.length; i++ ) {  
                treasury.mintRewards( // mint and send from treasury
                    info[ i ].recipient, 
                    _stacked
                );
                emit LogDistribute(info[ i ].recipient,  _stacked );
            }
            return true;
        } else { 
            return false; 
        }
    }
     
    
    /* ====== POLICY FUNCTIONS ====== */

    /**
        @notice adds recipient for distributions
        @param _recipient address - IStaking
     */
    function addRecipient( address _recipient ) external onlyOwner {
        require( _recipient != address(0), "IA" );
        require(info.length <= 4, "limit recipients max to 5");
        info.push( Info({
            recipient: _recipient
        }));
        emit LogAddRecipient(_recipient);
    }

    /**
        @notice removes recipient for distributions
        @param _index uint
        @param _recipient address - IStaking
     */
    function removeRecipient( uint _index, address _recipient ) external onlyOwner {
        require( _recipient == info[ _index ].recipient, "NA" );
        info[_index] = info[info.length-1];
        info.pop();
        emit LogRemoveRecipient(_recipient);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IDistributor).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}