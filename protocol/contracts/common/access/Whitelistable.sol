// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../libraries/Errors.sol";

abstract contract Whitelistable is Ownable {
    mapping(address => bool) private _whitelist;

    modifier onlyWhitelisted() {
        if (!_whitelist[msg.sender]) revert Errors.NotWhitelisted();
        _;
    }

    function addToWhitelist(address account) external onlyOwner {
        _whitelist[account] = true;
    }

    function removeFromWhitelist(address account) external onlyOwner {
        _whitelist[account] = false;
    }

    function isWhitelisted(address account) public view virtual returns (bool) {
        return _whitelist[account];
    }
}
