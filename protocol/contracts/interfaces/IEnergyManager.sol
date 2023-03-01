// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEnergyManager {
    struct EnergyInfo {
        address account;
        uint256 energy;
    }

    function totalEnergyOf(address account) external view returns (uint256);

    function freeEnergyOf(address account) external view returns (uint256);

    function allocatedEnergyOf(address account) external view returns (uint256);

    function receivedEnergyOf(address account) external view returns (uint256);

    function energizedBy(address account) external view returns (EnergyInfo[] memory);

    function energizersOf(address account) external view returns (EnergyInfo[] memory);

    function giveEnergyTo(address account, uint256 amount) external;

    function removeEnergyFrom(address account, uint256 amount) external;

    function createEnergyFor(address account, uint256 amount) external;

    function destroyEnergyFor(address account, uint256 amount) external;
}
