// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEnergyManager {
    function totalEnergyOf(address account) external view returns (uint256);

    function freeEnergyOf(address account) external view returns (uint256);

    function allocatedEnergyOf(address account) external view returns (uint256);

    function receivedEnergyOf(address account) external view returns (uint256);

    function energizedBy(address account, uint256 index) external view returns (address, uint256);

    function energizersOf(address account, uint256 index) external view returns (address, uint256);

    function totalEnergizedBy(address account) external view returns (uint256);

    function totalEnergizersOf(address account) external view returns (uint256);

    function giveEnergyTo(address account, uint256 amount) external;

    function removeEnergyFrom(address account, uint256 amount) external;

    function createEnergyFor(address account, uint256 amount) external;

    function destroyEnergyFor(address account, uint256 amount) external;
}
