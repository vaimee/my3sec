// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../libraries/Errors.sol";

abstract contract HubControllableUpgradeable is Initializable {
    address internal HUB;

    modifier onlyHub() {
        if (msg.sender != HUB) revert Errors.NotHub();
        _;
    }

    function __HubControllable_init(address hub) public {
        if (hub == address(0)) revert Errors.InitParamsInvalid();
        HUB = hub;
    }
}
