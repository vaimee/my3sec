// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWhitelistable {
    function getWhitelistCount() external view returns (uint256);

    function getWhitelistMember(uint256 index) external view returns (address);

    function isWhitelisted(address account) external view returns (bool);

    function addToWhitelist(address account) external;

    function removeFromWhitelist(address account) external;
}
