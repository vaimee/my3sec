// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/TimelockController.sol";

import "../common/libraries/Constants.sol";

contract Timelock is TimelockController {
    constructor(
        address[] memory proposers,
        address[] memory executors
    ) TimelockController(Constants.DAO_TIMELOCK_DELAY, proposers, executors, msg.sender) {}
}
