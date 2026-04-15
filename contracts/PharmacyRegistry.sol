// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PharmacyRegistry is Ownable, ReentrancyGuard {
    error AlreadyRegistered();
    error NotRegistered();

    struct PharmacyInfo {
        string name;
        string physAddress;
        string city;
        string drapLicense;
        string whatsappNumber;
        bool approved;
        uint256 verifications;
    }

    event PharmacyRegistered(address indexed pharmacy, string city);
    event PharmacyApproved(address indexed pharmacy);
    event VerificationIncremented(address indexed pharmacy, uint256 count);

    mapping(address => PharmacyInfo) private _pharmacies;
    address[] private _allPharmacies;

    constructor() Ownable(msg.sender) {}

    /// @notice Register caller as a pharmacy.
    function registerPharmacy(
        string calldata name,
        string calldata physAddress,
        string calldata city,
        string calldata drapLicense,
        string calldata whatsappNumber
    ) external nonReentrant {
        if (bytes(_pharmacies[msg.sender].name).length != 0) revert AlreadyRegistered();
        _pharmacies[msg.sender] = PharmacyInfo({
            name: name,
            physAddress: physAddress,
            city: city,
            drapLicense: drapLicense,
            whatsappNumber: whatsappNumber,
            approved: false,
            verifications: 0
        });
        _allPharmacies.push(msg.sender);
        emit PharmacyRegistered(msg.sender, city);
    }

    /// @notice Approve a pharmacy (admin only).
    function approvePharmacy(address pharmacy) external onlyOwner nonReentrant {
        if (bytes(_pharmacies[pharmacy].name).length == 0) revert NotRegistered();
        _pharmacies[pharmacy].approved = true;
        emit PharmacyApproved(pharmacy);
    }

    /// @notice Returns true if pharmacy exists and is approved.
    function isRegisteredPharmacy(address pharmacy) external view returns (bool) {
        PharmacyInfo memory p = _pharmacies[pharmacy];
        return bytes(p.name).length != 0 && p.approved;
    }

    /// @notice Increment pharmacy verification counter.
    function incrementVerifications(address pharmacy) external nonReentrant {
        if (bytes(_pharmacies[pharmacy].name).length == 0) revert NotRegistered();
        _pharmacies[pharmacy].verifications += 1;
        emit VerificationIncremented(pharmacy, _pharmacies[pharmacy].verifications);
    }

    /// @notice Return current tier for a pharmacy.
    function getTier(address pharmacy) external view returns (string memory) {
        uint256 count = _pharmacies[pharmacy].verifications;
        if (count >= 500) return "Gold";
        if (count >= 100) return "Silver";
        return "Bronze";
    }

    /// @notice Return pharmacy profile.
    function getPharmacy(address pharmacy) external view returns (PharmacyInfo memory) {
        return _pharmacies[pharmacy];
    }

    /// @notice Return pharmacy wallets in city.
    function getPharmaciesInCity(string calldata city) external view returns (address[] memory) {
        bytes32 cityHash = keccak256(bytes(city));
        uint256 count;
        for (uint256 i = 0; i < _allPharmacies.length; i++) {
            if (keccak256(bytes(_pharmacies[_allPharmacies[i]].city)) == cityHash) count++;
        }
        address[] memory entries = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < _allPharmacies.length; i++) {
            if (keccak256(bytes(_pharmacies[_allPharmacies[i]].city)) == cityHash) {
                entries[idx++] = _allPharmacies[i];
            }
        }
        return entries;
    }

    /// @notice Return total pharmacies.
    function totalPharmacies() external view returns (uint256) {
        return _allPharmacies.length;
    }
}
