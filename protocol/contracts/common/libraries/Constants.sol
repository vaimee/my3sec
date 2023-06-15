// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library Constants {
    uint16 internal constant PROFILE_INITIAL_ENERGY = 10;
    uint256 internal constant TIME_WALLET_SLOT_SIZE = 1 days;
    uint256 internal constant DAO_VOTING_DELAY = 1 days;
    uint256 internal constant DAO_VOTING_PERIOD = 7 days;
    uint256 internal constant DAO_PROPOSAL_THRESHOLD = 0;
    uint256 internal constant DAO_QUORUM = 4;
    uint256 internal constant DAO_TIMELOCK_DELAY = 1 days;
}
