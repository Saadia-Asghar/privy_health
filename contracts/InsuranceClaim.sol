// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IHospitalRegistryLite {
    function isApprovedInstitution(address institution) external view returns (bool);
}

contract InsuranceClaim is AccessControl, ReentrancyGuard {
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");

    enum Status {
        Draft,
        Submitted,
        UnderReview,
        Approved,
        Rejected,
        Appealed
    }

    struct Claim {
        address patient;
        uint256 healthRecordTokenId;
        string insurerName;
        string policyNo;
        string diagnosisCID;
        string treatmentCID;
        uint256 amountPKR;
        Status status;
        string reason;
    }

    event ClaimSubmitted(uint256 indexed claimId, address indexed patient);
    event ClaimHospitalVerified(uint256 indexed claimId, address indexed hospital);
    event ClaimResolved(uint256 indexed claimId, bool approved, string reason);
    event ClaimAppealed(uint256 indexed claimId, string reason);

    IHospitalRegistryLite public immutable hospitalRegistry;
    uint256 private _nextClaimId = 1;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) private _patientClaims;

    constructor(address admin, address hospitalRegistryAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(INSURER_ROLE, admin);
        hospitalRegistry = IHospitalRegistryLite(hospitalRegistryAddress);
    }

    function submitClaim(
        uint256 healthRecordTokenId,
        string calldata insurerName,
        string calldata policyNo,
        string calldata diagnosisCID,
        string calldata treatmentCID,
        uint256 amountPKR
    ) external nonReentrant returns (uint256 claimId) {
        claimId = _nextClaimId++;
        claims[claimId] = Claim({
            patient: msg.sender,
            healthRecordTokenId: healthRecordTokenId,
            insurerName: insurerName,
            policyNo: policyNo,
            diagnosisCID: diagnosisCID,
            treatmentCID: treatmentCID,
            amountPKR: amountPKR,
            status: Status.Submitted,
            reason: ""
        });
        _patientClaims[msg.sender].push(claimId);
        emit ClaimSubmitted(claimId, msg.sender);
    }

    function verifyByHospital(uint256 claimId) external nonReentrant {
        require(hospitalRegistry.isApprovedInstitution(msg.sender), "not-approved-hospital");
        claims[claimId].status = Status.UnderReview;
        emit ClaimHospitalVerified(claimId, msg.sender);
    }

    function resolveClaim(uint256 claimId, bool approved, string calldata reason) external onlyRole(INSURER_ROLE) nonReentrant {
        claims[claimId].status = approved ? Status.Approved : Status.Rejected;
        claims[claimId].reason = reason;
        emit ClaimResolved(claimId, approved, reason);
    }

    function appealClaim(uint256 claimId, string calldata reason) external nonReentrant {
        require(claims[claimId].patient == msg.sender, "not-patient");
        claims[claimId].status = Status.Appealed;
        claims[claimId].reason = reason;
        emit ClaimAppealed(claimId, reason);
    }

    function getPatientClaims(address patient) external view returns (uint256[] memory) {
        return _patientClaims[patient];
    }

    function totalClaims() external view returns (uint256) {
        return _nextClaimId - 1;
    }
}
