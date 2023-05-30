// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ITimeWallet {
    function spendTimeFor(uint256 profileId, uint256 time) external;
}
