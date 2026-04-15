// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VitalSigns is ReentrancyGuard {
    struct VitalReading {
        uint256 tokenId;
        string vitalType;
        uint256 value;
        string unit;
        uint256 timestamp;
    }

    event VitalLogged(uint256 indexed tokenId, string vitalType, uint256 value, string unit, uint256 timestamp);

    mapping(uint256 => mapping(bytes32 => VitalReading[])) private _vitals;
    uint256 private _totalReadings;

    function logVital(
        uint256 tokenId,
        string calldata vitalType,
        uint256 value,
        string calldata unit,
        uint256 timestamp
    ) external nonReentrant {
        VitalReading memory reading = VitalReading({
            tokenId: tokenId,
            vitalType: vitalType,
            value: value,
            unit: unit,
            timestamp: timestamp
        });
        _vitals[tokenId][keccak256(bytes(vitalType))].push(reading);
        _totalReadings += 1;
        emit VitalLogged(tokenId, vitalType, value, unit, timestamp);
    }

    function getVitals(uint256 tokenId, string calldata vitalType) external view returns (VitalReading[] memory) {
        return _vitals[tokenId][keccak256(bytes(vitalType))];
    }

    function getLatestVital(uint256 tokenId, string calldata vitalType) external view returns (VitalReading memory) {
        VitalReading[] memory entries = _vitals[tokenId][keccak256(bytes(vitalType))];
        require(entries.length > 0, "no-vitals");
        return entries[entries.length - 1];
    }

    function totalVitalReadings() external view returns (uint256) {
        return _totalReadings;
    }
}
