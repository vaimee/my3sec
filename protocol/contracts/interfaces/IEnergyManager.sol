// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEnergyManager {
    function totalEnergyOf(uint256 profileId) external view returns (uint256);

    function freeEnergyOf(uint256 profileId) external view returns (uint256);

    function allocatedEnergyOf(uint256 profileId) external view returns (uint256);

    function receivedEnergyOf(uint256 profileId) external view returns (uint256);

    function energizedBy(uint256 profileId, uint256 index) external view returns (uint256, uint256);

    function energizersOf(uint256 profileId, uint256 index) external view returns (uint256, uint256);

    function totalEnergizedBy(uint256 profileId) external view returns (uint256);

    function totalEnergizersOf(uint256 profileId) external view returns (uint256);

    function giveEnergy(uint256 from, uint256 to, uint256 amount) external;

    function removeEnergy(uint256 from, uint256 to, uint256 amount) external;

    function createEnergyFor(uint256 profileId, uint256 amount) external;

    function destroyEnergyFor(uint256 profileId, uint256 amount) external;
}
