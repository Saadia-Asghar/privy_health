// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HealthRecord is ERC721URIStorage, ReentrancyGuard {
    error AlreadyHasRecord();
    error SoulboundToken();
    error NotAuthorized();
    error NotYourRecord();
    error NoRecord();

    struct AccessGrant {
        bool active;
        uint256 grantedAt;
        uint256 expiresAt;
        string purpose;
    }

    struct ShareInfo {
        address to;
        uint256 grantedAt;
        uint256 expiresAt;
        bool active;
        bool allowNotes;
        string purpose;
    }

    struct MedicalEntry {
        address author;
        string entryType;
        string encryptedCID;
        uint256 timestamp;
    }

    event RecordMinted(address indexed patient, uint256 indexed tokenId, string encryptedCID);
    event RecordUpdated(uint256 indexed tokenId, string encryptedCID);
    event AccessRequested(address indexed doctor, address indexed patient, string reason, uint256 durationDays);
    event AccessGranted(uint256 indexed tokenId, address indexed doctor, uint256 expiresAt);
    event AccessRevoked(uint256 indexed tokenId, address indexed doctor);
    event HistoryShared(uint256 indexed tokenId, address indexed to, uint256 expiresAt, bool allowNotes, string purpose);
    event HistoryShareRevoked(uint256 indexed tokenId, address indexed to);
    event MedicalEntryAdded(uint256 indexed tokenId, address indexed author, string entryType, string encryptedCID);
    event RecordViewed(uint256 indexed tokenId, address indexed viewer);

    uint256 private _nextTokenId = 1;
    uint256 private _totalRecords;

    mapping(address => uint256) public patientToken;
    mapping(uint256 => string) private _encryptedCID;
    mapping(uint256 => mapping(address => AccessGrant)) public accessGrants;
    mapping(uint256 => address[]) private _accessList;
    mapping(uint256 => mapping(address => bool)) private _accessTracked;
    mapping(uint256 => ShareInfo[]) private _shares;
    mapping(uint256 => MedicalEntry[]) private _medicalEntries;

    constructor() ERC721("PrivyHealth Record", "PHR") {}

    /// @notice Mint your own soulbound health record.
    /// @param encryptedCID Encrypted IPFS CID.
    /// @param tokenUri Metadata URI.
    function mintRecord(string calldata encryptedCID, string calldata tokenUri) external nonReentrant {
        if (patientToken[msg.sender] != 0) revert AlreadyHasRecord();

        uint256 tokenId = _nextTokenId++;
        patientToken[msg.sender] = tokenId;
        _encryptedCID[tokenId] = encryptedCID;
        _totalRecords += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);
        emit RecordMinted(msg.sender, tokenId, encryptedCID);
    }

    /// @notice Update encrypted record payload for your token.
    /// @param tokenId Record token ID.
    /// @param newCID New encrypted CID.
    function updateRecord(uint256 tokenId, string calldata newCID) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotYourRecord();
        _encryptedCID[tokenId] = newCID;
        emit RecordUpdated(tokenId, newCID);
    }

    /// @notice Request a patient to grant access.
    /// @param patient Patient wallet.
    /// @param reason Reason for access.
    /// @param durationDays Requested duration in days.
    function requestAccess(address patient, string calldata reason, uint256 durationDays) external nonReentrant {
        if (patientToken[patient] == 0) revert NoRecord();
        emit AccessRequested(msg.sender, patient, reason, durationDays);
    }

    /// @notice Grant doctor access to your record.
    /// @param tokenId Record token ID.
    /// @param doctor Doctor wallet.
    function grantAccess(uint256 tokenId, address doctor) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotYourRecord();
        uint256 expiresAt = block.timestamp + 30 days;
        accessGrants[tokenId][doctor] = AccessGrant({
            active: true,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            purpose: "clinical-care"
        });
        if (!_accessTracked[tokenId][doctor]) {
            _accessTracked[tokenId][doctor] = true;
            _accessList[tokenId].push(doctor);
        }
        emit AccessGranted(tokenId, doctor, expiresAt);
    }

    /// @notice Revoke doctor access to your record.
    /// @param tokenId Record token ID.
    /// @param doctor Doctor wallet.
    function revokeAccess(uint256 tokenId, address doctor) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotYourRecord();
        AccessGrant storage grant = accessGrants[tokenId][doctor];
        grant.active = false;
        grant.expiresAt = block.timestamp;
        emit AccessRevoked(tokenId, doctor);
    }

    /// @notice Share full history with another wallet.
    /// @param tokenId Record token ID.
    /// @param to Recipient wallet.
    /// @param daysCount Duration in days (0 means one year fallback).
    /// @param allowNotes Whether notes are visible.
    /// @param purpose Share purpose.
    function shareFullHistory(
        uint256 tokenId,
        address to,
        uint256 daysCount,
        bool allowNotes,
        string calldata purpose
    ) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotYourRecord();
        uint256 expiresAt = daysCount == 0 ? block.timestamp + 365 days : block.timestamp + (daysCount * 1 days);
        _shares[tokenId].push(
            ShareInfo({
                to: to,
                grantedAt: block.timestamp,
                expiresAt: expiresAt,
                active: true,
                allowNotes: allowNotes,
                purpose: purpose
            })
        );
        emit HistoryShared(tokenId, to, expiresAt, allowNotes, purpose);
    }

    /// @notice Revoke an existing history share.
    /// @param tokenId Record token ID.
    /// @param from Shared recipient address.
    function revokeShare(uint256 tokenId, address from) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotYourRecord();
        ShareInfo[] storage list = _shares[tokenId];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i].to == from && list[i].active) {
                list[i].active = false;
            }
        }
        emit HistoryShareRevoked(tokenId, from);
    }

    /// @notice Check if doctor currently has access.
    /// @param tokenId Record token ID.
    /// @param doctor Doctor wallet.
    /// @return Whether access is active and unexpired.
    function hasAccess(uint256 tokenId, address doctor) public view returns (bool) {
        AccessGrant memory grant = accessGrants[tokenId][doctor];
        return grant.active && grant.expiresAt >= block.timestamp;
    }

    /// @notice Check if wallet has full history share.
    /// @param tokenId Record token ID.
    /// @param to Recipient wallet.
    /// @return Whether share is active and unexpired.
    function hasFullHistory(uint256 tokenId, address to) external view returns (bool) {
        ShareInfo[] memory list = _shares[tokenId];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i].to == to && list[i].active && list[i].expiresAt >= block.timestamp) {
                return true;
            }
        }
        return false;
    }

    /// @notice Return all wallets ever granted access.
    /// @param tokenId Record token ID.
    /// @return List of doctor wallets.
    function getAccessList(uint256 tokenId) external view returns (address[] memory) {
        return _accessList[tokenId];
    }

    /// @notice Return all share entries.
    /// @param tokenId Record token ID.
    /// @return Shares list.
    function getShares(uint256 tokenId) external view returns (ShareInfo[] memory) {
        return _shares[tokenId];
    }

    /// @notice Add encrypted medical entry by an authorized doctor.
    /// @param tokenId Record token ID.
    /// @param entryType Type of entry.
    /// @param encryptedCID Encrypted payload CID.
    function addMedicalEntry(
        uint256 tokenId,
        string calldata entryType,
        string calldata encryptedCID
    ) external nonReentrant {
        if (!hasAccess(tokenId, msg.sender)) revert NotAuthorized();
        _medicalEntries[tokenId].push(
            MedicalEntry({author: msg.sender, entryType: entryType, encryptedCID: encryptedCID, timestamp: block.timestamp})
        );
        emit MedicalEntryAdded(tokenId, msg.sender, entryType, encryptedCID);
    }

    /// @notice Record view access event for audit trail.
    /// @param tokenId Record token ID.
    function logView(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender && !hasAccess(tokenId, msg.sender)) revert NotAuthorized();
        emit RecordViewed(tokenId, msg.sender);
    }

    /// @notice Get encrypted CID for owner or authorized doctor.
    /// @param tokenId Record token ID.
    /// @return Encrypted CID string.
    function getEncryptedCID(uint256 tokenId) external view returns (string memory) {
        if (ownerOf(tokenId) != msg.sender && !hasAccess(tokenId, msg.sender)) revert NotAuthorized();
        return _encryptedCID[tokenId];
    }

    /// @notice Return number of minted records.
    /// @return Total records.
    function totalRecords() external view returns (uint256) {
        return _totalRecords;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert SoulboundToken();
        return super._update(to, tokenId, auth);
    }
}
