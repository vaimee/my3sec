// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../common/access/HubControllable.sol";
import "../common/interfaces/ITimeWallet.sol";
import "../common/libraries/Constants.sol";
import "../common/libraries/Errors.sol";

contract TimeWallet is ITimeWallet, HubControllable {
    mapping(uint256 => uint256) internal _lastTimeSlot;
    mapping(uint256 => uint256) internal _totalTimeSinceLastTimeSlot;

    constructor(address hub) HubControllable(hub) {}

    function spendTimeFor(uint256 profileId, uint256 time) external override onlyHub {
        if (time >= Constants.TIME_WALLET_SLOT_SIZE) revert Errors.ExceededLoggableTime();

        // Get the current day from the genesis block
        uint256 currentDay = block.timestamp / Constants.TIME_WALLET_SLOT_SIZE;

        // If the user hasn't logged any hours today or it's a new day
        if (_lastTimeSlot[profileId] < currentDay) {
            _lastTimeSlot[profileId] = currentDay;
            _totalTimeSinceLastTimeSlot[profileId] = time;
        } else {
            if (_totalTimeSinceLastTimeSlot[profileId] + time > Constants.TIME_WALLET_SLOT_SIZE)
                revert Errors.ExceededLoggableTime();
            _totalTimeSinceLastTimeSlot[profileId] += time;
        }
    }
}
