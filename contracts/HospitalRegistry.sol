// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HospitalRegistry is Ownable, ReentrancyGuard {
    enum InstitutionType {
        Hospital,
        Clinic,
        Lab,
        Pharmacy
    }

    struct InstitutionInfo {
        string name;
        InstitutionType institutionType;
        string physAddress;
        string city;
        string license;
        string contactEmail;
        bool approved;
        string rejectionReason;
        uint256 registeredAt;
    }

    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionApproved(address indexed institution);
    event InstitutionRejected(address indexed institution, string reason);
    event DoctorLinked(address indexed institution, address indexed doctor);
    event DoctorPreVerified(address indexed institution, address indexed doctor);

    mapping(address => InstitutionInfo) private _institutions;
    mapping(address => address[]) private _linkedDoctors;
    mapping(address => bool) public preVerifiedDoctors;
    address[] private _allInstitutions;

    constructor() Ownable(msg.sender) {}

    function registerInstitution(
        string calldata name,
        uint8 institutionType,
        string calldata physAddress,
        string calldata city,
        string calldata license,
        string calldata contactEmail
    ) external nonReentrant {
        _institutions[msg.sender] = InstitutionInfo({
            name: name,
            institutionType: InstitutionType(institutionType),
            physAddress: physAddress,
            city: city,
            license: license,
            contactEmail: contactEmail,
            approved: false,
            rejectionReason: "",
            registeredAt: block.timestamp
        });
        _allInstitutions.push(msg.sender);
        emit InstitutionRegistered(msg.sender, name);
    }

    function approveInstitution(address institution) external onlyOwner nonReentrant {
        _institutions[institution].approved = true;
        _institutions[institution].rejectionReason = "";
        emit InstitutionApproved(institution);
    }

    function rejectInstitution(address institution, string calldata reason) external onlyOwner nonReentrant {
        _institutions[institution].approved = false;
        _institutions[institution].rejectionReason = reason;
        emit InstitutionRejected(institution, reason);
    }

    function isApprovedInstitution(address institution) external view returns (bool) {
        return _institutions[institution].approved;
    }

    function linkDoctor(address doctor) external nonReentrant {
        require(_institutions[msg.sender].approved, "institution-not-approved");
        _linkedDoctors[msg.sender].push(doctor);
        emit DoctorLinked(msg.sender, doctor);
    }

    function preVerifyDoctor(address doctor) external nonReentrant {
        require(_institutions[msg.sender].approved, "institution-not-approved");
        preVerifiedDoctors[doctor] = true;
        emit DoctorPreVerified(msg.sender, doctor);
    }

    function getInstitution(address institution) external view returns (InstitutionInfo memory) {
        return _institutions[institution];
    }

    function getAllPending() external view returns (address[] memory) {
        uint256 count;
        for (uint256 i = 0; i < _allInstitutions.length; i++) {
            if (!_institutions[_allInstitutions[i]].approved) count++;
        }
        address[] memory pending = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < _allInstitutions.length; i++) {
            if (!_institutions[_allInstitutions[i]].approved) pending[idx++] = _allInstitutions[i];
        }
        return pending;
    }

    function totalInstitutions() external view returns (uint256) {
        return _allInstitutions.length;
    }
}
