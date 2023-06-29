// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IWhitelistable.sol";
import "../libraries/Errors.sol";

abstract contract Whitelistable is IWhitelistable, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _whitelist;

    modifier onlyWhitelisted() {
        if (!_whitelist.contains(msg.sender)) revert Errors.NotWhitelisted();
        _;
    }

    function getWhitelistCount() external view returns (uint256) {
        return _whitelist.length();
    }

    function getWhitelistMember(uint256 index) external view returns (address) {
        return _whitelist.at(index);
    }

    function isWhitelisted(address account) public view virtual returns (bool) {
        return _whitelist.contains(account);
    }

    function addToWhitelist(address account) public virtual onlyOwner {
        _whitelist.add(account);
    }

    function removeFromWhitelist(address account) external onlyOwner {
        _whitelist.remove(account);
    }
}
