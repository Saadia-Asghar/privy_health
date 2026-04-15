// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPharmacyRegistry {
    function isRegisteredPharmacy(address pharmacy) external view returns (bool);
    function incrementVerifications(address pharmacy) external;
}

contract PrescriptionNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    enum Category {
        OTC,
        ScheduleH,
        ScheduleG,
        Controlled
    }

    error NotDoctor();
    error NotPatient();
    error NotPharmacy();
    error InvalidCode();
    error AlreadyFilled();

    struct Prescription {
        address doctor;
        address patient;
        string encryptedCID;
        string publicSummary;
        uint256 issuedAt;
        uint256 validUntil;
        uint8 category;
        uint8 refillsAllowed;
        uint8 refillsUsed;
        bool filled;
        bool cancelled;
    }

    event PrescriptionIssued(uint256 indexed tokenId, address indexed doctor, address indexed patient, bytes6 code);
    event PrescriptionFilled(uint256 indexed tokenId, address indexed pharmacy);
    event RefillRequested(uint256 indexed tokenId, address indexed patient);
    event RefillApproved(uint256 indexed tokenId, address indexed doctor);
    event PrescriptionCancelled(uint256 indexed tokenId);

    uint256 private _nextTokenId = 1;
    uint256 private _totalPrescriptions;
    IPharmacyRegistry public pharmacyRegistry;
    mapping(address => bool) public doctors;
    mapping(uint256 => Prescription) public prescriptions;
    mapping(bytes6 => uint256) public codeToToken;
    mapping(uint256 => bytes6) public tokenToCode;
    mapping(uint256 => bytes6) private _codeOverride;
    mapping(address => uint256[]) private _patientPrescriptions;
    mapping(address => uint256[]) private _doctorPrescriptions;

    constructor(address pharmacyRegistryAddress) ERC721("PrivyHealth Prescription", "PHRX") Ownable(msg.sender) {
        pharmacyRegistry = IPharmacyRegistry(pharmacyRegistryAddress);
    }

    /// @notice Set doctor authorization for issuing prescriptions.
    function setDoctor(address doctor, bool allowed) external onlyOwner nonReentrant {
        doctors[doctor] = allowed;
    }

    /// @notice Admin-only demo override for fixed code assignments.
    function setCodeOverride(uint256 tokenId, bytes6 code) external onlyOwner nonReentrant {
        _codeOverride[tokenId] = code;
    }

    /// @notice Issue a prescription NFT for patient.
    function issuePrescription(
        address patient,
        string calldata encryptedCID,
        string calldata publicSummary,
        uint256 validDays,
        uint8 category,
        uint8 refillsAllowed
    ) external nonReentrant returns (uint256 tokenId) {
        if (!doctors[msg.sender]) revert NotDoctor();
        tokenId = _nextTokenId++;
        _safeMint(patient, tokenId);
        prescriptions[tokenId] = Prescription({
            doctor: msg.sender,
            patient: patient,
            encryptedCID: encryptedCID,
            publicSummary: publicSummary,
            issuedAt: block.timestamp,
            validUntil: block.timestamp + (validDays * 1 days),
            category: category,
            refillsAllowed: refillsAllowed,
            refillsUsed: 0,
            filled: false,
            cancelled: false
        });
        bytes6 code = generateCode(tokenId);
        _patientPrescriptions[patient].push(tokenId);
        _doctorPrescriptions[msg.sender].push(tokenId);
        _totalPrescriptions += 1;
        emit PrescriptionIssued(tokenId, msg.sender, patient, code);
    }

    /// @notice Generate and store code mapping for a token.
    function generateCode(uint256 tokenId) public returns (bytes6) {
        bytes6 code = _codeOverride[tokenId];
        if (code == bytes6(0)) {
            bytes32 hash = keccak256(abi.encodePacked(tokenId, block.timestamp, msg.sender, block.prevrandao));
            code = bytes6(hash);
        }
        codeToToken[code] = tokenId;
        tokenToCode[tokenId] = code;
        return code;
    }

    /// @notice Verify prescription details by code.
    function verifyByCode(
        bytes6 code
    ) external view returns (bool valid, bool filled, bool expired, string memory publicSummary, uint256 validUntil, address patient) {
        uint256 tokenId = codeToToken[code];
        if (tokenId == 0) return (false, false, false, "", 0, address(0));
        Prescription memory p = prescriptions[tokenId];
        bool isExpired = p.validUntil < block.timestamp || p.cancelled;
        bool isValid = !isExpired && !p.filled;
        return (isValid, p.filled, isExpired, p.publicSummary, p.validUntil, p.patient);
    }

    /// @notice Fill prescription by code from approved pharmacy.
    function fillByCode(bytes6 code) external nonReentrant {
        if (!pharmacyRegistry.isRegisteredPharmacy(msg.sender)) revert NotPharmacy();
        uint256 tokenId = codeToToken[code];
        if (tokenId == 0) revert InvalidCode();
        Prescription storage p = prescriptions[tokenId];
        if (p.filled) revert AlreadyFilled();
        if (p.cancelled || p.validUntil < block.timestamp) revert InvalidCode();
        p.filled = true;
        pharmacyRegistry.incrementVerifications(msg.sender);
        emit PrescriptionFilled(tokenId, msg.sender);
    }

    /// @notice Patient requests refill for an existing token.
    function requestRefill(uint256 tokenId) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotPatient();
        emit RefillRequested(tokenId, msg.sender);
    }

    /// @notice Doctor approves refill count increment.
    function approveRefill(uint256 tokenId) external nonReentrant {
        Prescription storage p = prescriptions[tokenId];
        if (p.doctor != msg.sender) revert NotDoctor();
        if (p.refillsUsed < p.refillsAllowed) {
            p.refillsUsed += 1;
            p.filled = false;
        }
        emit RefillApproved(tokenId, msg.sender);
    }

    /// @notice Doctor cancels prescription.
    function cancelPrescription(uint256 tokenId) external nonReentrant {
        if (prescriptions[tokenId].doctor != msg.sender) revert NotDoctor();
        prescriptions[tokenId].cancelled = true;
        emit PrescriptionCancelled(tokenId);
    }

    /// @notice Return patient prescription IDs.
    function getPatientPrescriptions(address patient) external view returns (uint256[] memory) {
        return _patientPrescriptions[patient];
    }

    /// @notice Return doctor prescription IDs.
    function getDoctorPrescriptions(address doctor) external view returns (uint256[] memory) {
        return _doctorPrescriptions[doctor];
    }

    /// @notice Return total prescriptions minted.
    function totalPrescriptions() external view returns (uint256) {
        return _totalPrescriptions;
    }
}
