// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IHealthRecordLite {
    function patientToken(address patient) external view returns (uint256);
    function grantAccess(uint256 tokenId, address doctor) external;
    function addMedicalEntry(uint256 tokenId, string calldata entryType, string calldata encryptedCID) external;
}

contract AppointmentSystem is ReentrancyGuard {
    enum AppointmentStatus {
        Booked,
        Confirmed,
        Cancelled,
        Completed
    }

    struct Appointment {
        address patient;
        address doctor;
        uint256 timestamp;
        string notesCID;
        string summaryEncryptedCID;
        AppointmentStatus status;
    }

    event AppointmentBooked(uint256 indexed id, address indexed patient, address indexed doctor, uint256 timestamp);
    event AppointmentConfirmed(uint256 indexed id);
    event AppointmentCancelled(uint256 indexed id);
    event AppointmentCompleted(uint256 indexed id, string summaryEncryptedCID);

    IHealthRecordLite public immutable healthRecord;
    uint256 private _nextId = 1;
    mapping(uint256 => Appointment) public appointments;
    mapping(address => uint256[]) private _patientAppointments;
    mapping(address => uint256[]) private _doctorAppointments;

    constructor(address healthRecordAddress) {
        healthRecord = IHealthRecordLite(healthRecordAddress);
    }

    function bookAppointment(address doctor, uint256 timestamp, string calldata notesCID, bool grantRecordAccess) external nonReentrant {
        uint256 id = _nextId++;
        appointments[id] = Appointment({
            patient: msg.sender,
            doctor: doctor,
            timestamp: timestamp,
            notesCID: notesCID,
            summaryEncryptedCID: "",
            status: AppointmentStatus.Booked
        });
        _patientAppointments[msg.sender].push(id);
        _doctorAppointments[doctor].push(id);
        if (grantRecordAccess) {
            uint256 tokenId = healthRecord.patientToken(msg.sender);
            if (tokenId != 0) healthRecord.grantAccess(tokenId, doctor);
        }
        emit AppointmentBooked(id, msg.sender, doctor, timestamp);
    }

    function confirmAppointment(uint256 id) external nonReentrant {
        Appointment storage a = appointments[id];
        require(a.doctor == msg.sender, "not-doctor");
        a.status = AppointmentStatus.Confirmed;
        emit AppointmentConfirmed(id);
    }

    function cancelAppointment(uint256 id) external nonReentrant {
        Appointment storage a = appointments[id];
        require(a.patient == msg.sender || a.doctor == msg.sender, "not-authorized");
        a.status = AppointmentStatus.Cancelled;
        emit AppointmentCancelled(id);
    }

    function completeAppointment(uint256 id, string calldata summaryEncryptedCID) external nonReentrant {
        Appointment storage a = appointments[id];
        require(a.doctor == msg.sender, "not-doctor");
        a.status = AppointmentStatus.Completed;
        a.summaryEncryptedCID = summaryEncryptedCID;
        uint256 tokenId = healthRecord.patientToken(a.patient);
        if (tokenId != 0) healthRecord.addMedicalEntry(tokenId, "visit_summary", summaryEncryptedCID);
        emit AppointmentCompleted(id, summaryEncryptedCID);
    }

    function getPatientAppointments(address patient) external view returns (uint256[] memory) {
        return _patientAppointments[patient];
    }

    function getDoctorAppointments(address doctor) external view returns (uint256[] memory) {
        return _doctorAppointments[doctor];
    }

    function totalAppointments() external view returns (uint256) {
        return _nextId - 1;
    }
}
