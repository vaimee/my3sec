// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../libraries/Errors.sol";

abstract contract HubControllable {
    address public immutable HUB;

    modifier onlyHub() {
        if (msg.sender != HUB) revert Errors.NotHub();
        _;
    }

    constructor(address hub) {
        if (hub == address(0)) revert Errors.InitParamsInvalid();
        HUB = hub;
    }
}
