// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DoctorAvailability is ReentrancyGuard {
    struct AvailSlot {
        uint8 dayOfWeek;
        uint8 startHour;
        uint8 endHour;
        bool available;
        uint256 feePKR;
    }

    event AvailabilitySet(address indexed doctor, uint256 count);
    event SlotBooked(address indexed doctor, uint256 timestamp, address indexed bookedBy);

    mapping(address => AvailSlot[]) private _availability;
    mapping(address => mapping(uint256 => bool)) public bookedSlots;
    mapping(address => bool) private _hasAny;
    uint256 private _totalDoctors;

    function setAvailability(AvailSlot[] calldata slots) external nonReentrant {
        if (!_hasAny[msg.sender]) {
            _hasAny[msg.sender] = true;
            _totalDoctors += 1;
        }
        delete _availability[msg.sender];
        for (uint256 i = 0; i < slots.length; i++) {
            _availability[msg.sender].push(slots[i]);
        }
        emit AvailabilitySet(msg.sender, slots.length);
    }

    function getAvailability(address doctor) external view returns (AvailSlot[] memory) {
        return _availability[doctor];
    }

    function isSlotAvailable(address doctor, uint256 timestamp) public view returns (bool) {
        if (bookedSlots[doctor][timestamp]) return false;
        uint8 dayOfWeek = uint8((timestamp / 1 days + 4) % 7); // unix epoch Thursday offset
        uint8 hour = uint8((timestamp / 1 hours) % 24);
        AvailSlot[] memory slots = _availability[doctor];
        for (uint256 i = 0; i < slots.length; i++) {
            if (slots[i].available && slots[i].dayOfWeek == dayOfWeek && hour >= slots[i].startHour && hour < slots[i].endHour) {
                return true;
            }
        }
        return false;
    }

    function bookSlot(address doctor, uint256 timestamp) external nonReentrant {
        require(isSlotAvailable(doctor, timestamp), "slot-unavailable");
        bookedSlots[doctor][timestamp] = true;
        emit SlotBooked(doctor, timestamp, msg.sender);
    }

    function totalAvailableDoctors() external view returns (uint256) {
        return _totalDoctors;
    }
}
