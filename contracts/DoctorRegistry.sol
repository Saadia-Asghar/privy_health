// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DoctorRegistry is Ownable, ReentrancyGuard {
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidStars();

    struct DoctorInfo {
        string name;
        string specialization;
        string pmdc;
        string hospital;
        string city;
        string email;
        address wallet;
        bool verified;
        bool active;
        uint256 registeredAt;
        uint256 verifiedAt;
        string rejectionReason;
    }

    event DoctorRegistered(address indexed doctor, string pmdc);
    event DoctorVerified(address indexed doctor);
    event DoctorRejected(address indexed doctor, string reason);
    event DoctorRated(address indexed doctor, uint8 stars, string comment, address indexed patient);

    mapping(address => DoctorInfo) private _doctors;
    mapping(address => uint256) private _totalStars;
    mapping(address => uint256) private _ratingCount;
    address[] private _allDoctors;

    constructor() Ownable(msg.sender) {}

    /// @notice Register caller as a doctor.
    function registerDoctor(
        string calldata name,
        string calldata specialization,
        string calldata pmdc,
        string calldata hospital,
        string calldata city,
        string calldata email
    ) external nonReentrant {
        if (_doctors[msg.sender].registeredAt != 0) revert AlreadyRegistered();
        _doctors[msg.sender] = DoctorInfo({
            name: name,
            specialization: specialization,
            pmdc: pmdc,
            hospital: hospital,
            city: city,
            email: email,
            wallet: msg.sender,
            verified: false,
            active: true,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            rejectionReason: ""
        });
        _allDoctors.push(msg.sender);
        emit DoctorRegistered(msg.sender, pmdc);
    }

    /// @notice Verify a doctor. Only admin.
    function verifyDoctor(address doctor) external onlyOwner nonReentrant {
        if (_doctors[doctor].registeredAt == 0) revert NotRegistered();
        _doctors[doctor].verified = true;
        _doctors[doctor].verifiedAt = block.timestamp;
        _doctors[doctor].rejectionReason = "";
        emit DoctorVerified(doctor);
    }

    /// @notice Reject a doctor. Only admin.
    function rejectDoctor(address doctor, string calldata reason) external onlyOwner nonReentrant {
        if (_doctors[doctor].registeredAt == 0) revert NotRegistered();
        _doctors[doctor].verified = false;
        _doctors[doctor].active = false;
        _doctors[doctor].rejectionReason = reason;
        emit DoctorRejected(doctor, reason);
    }

    /// @notice Check if doctor is verified and active.
    function isVerifiedDoctor(address doctor) external view returns (bool) {
        DoctorInfo memory d = _doctors[doctor];
        return d.verified && d.active;
    }

    /// @notice Get doctor profile by wallet.
    function getDoctor(address doctor) external view returns (DoctorInfo memory) {
        return _doctors[doctor];
    }

    /// @notice Return all registered doctor wallets.
    function getAllDoctors() external view returns (address[] memory) {
        return _allDoctors;
    }

    /// @notice Return verified and active doctor wallets.
    function getVerifiedDoctors() external view returns (address[] memory) {
        uint256 count;
        for (uint256 i = 0; i < _allDoctors.length; i++) {
            DoctorInfo memory d = _doctors[_allDoctors[i]];
            if (d.verified && d.active) count++;
        }
        address[] memory verified = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < _allDoctors.length; i++) {
            DoctorInfo memory d = _doctors[_allDoctors[i]];
            if (d.verified && d.active) verified[idx++] = _allDoctors[i];
        }
        return verified;
    }

    /// @notice Submit rating for a doctor.
    function submitRating(address doctor, uint8 stars, string calldata comment) external nonReentrant {
        if (_doctors[doctor].registeredAt == 0) revert NotRegistered();
        if (stars == 0 || stars > 5) revert InvalidStars();
        _totalStars[doctor] += stars;
        _ratingCount[doctor] += 1;
        emit DoctorRated(doctor, stars, comment, msg.sender);
    }

    /// @notice Get cumulative doctor rating metrics.
    function getDoctorRating(address doctor) external view returns (uint256 totalStars, uint256 count) {
        return (_totalStars[doctor], _ratingCount[doctor]);
    }

    /// @notice Return total registered doctors.
    function totalDoctors() external view returns (uint256) {
        return _allDoctors.length;
    }
}
