// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EmergencyAccess is Ownable, ReentrancyGuard {
    error NoCard();
    error NotResponder();

    struct AccessEvent {
        address responder;
        uint256 timestamp;
        string note;
    }

    struct EmergencyCard {
        bool exists;
        string publicData;
        string fullEncryptedCID;
    }

    event EmergencyCardSet(address indexed patient);
    event EmergencyCardAccessed(address indexed patient, address indexed responder);
    event ResponderUpdated(address indexed responder, bool allowed);

    mapping(address => EmergencyCard) private _cards;
    mapping(address => AccessEvent[]) private _accessLogs;
    mapping(address => bool) public responders;
    uint256 private _totalCards;

    constructor() Ownable(msg.sender) {}

    /// @notice Set or update your emergency card.
    function setEmergencyCard(string calldata publicDataJSON, string calldata fullEncryptedCID) external nonReentrant {
        if (!_cards[msg.sender].exists) {
            _totalCards += 1;
        }
        _cards[msg.sender] = EmergencyCard({exists: true, publicData: publicDataJSON, fullEncryptedCID: fullEncryptedCID});
        emit EmergencyCardSet(msg.sender);
    }

    /// @notice Check whether a patient has an emergency card.
    function hasEmergencyCard(address patient) external view returns (bool) {
        return _cards[patient].exists;
    }

    /// @notice Get public emergency data for any patient.
    function getPublicData(address patient) external view returns (string memory) {
        if (!_cards[patient].exists) revert NoCard();
        return _cards[patient].publicData;
    }

    /// @notice Access full emergency card (responder only) and log access.
    function accessFullCard(address patient) external nonReentrant returns (string memory) {
        if (!responders[msg.sender]) revert NotResponder();
        if (!_cards[patient].exists) revert NoCard();
        _accessLogs[patient].push(AccessEvent({responder: msg.sender, timestamp: block.timestamp, note: "full-card-access"}));
        emit EmergencyCardAccessed(patient, msg.sender);
        return _cards[patient].fullEncryptedCID;
    }

    /// @notice Get emergency access logs for a patient.
    function getAccessLog(address patient) external view returns (AccessEvent[] memory) {
        return _accessLogs[patient];
    }

    /// @notice Set responder authorization (admin only).
    function setResponder(address responder, bool allowed) external onlyOwner nonReentrant {
        responders[responder] = allowed;
        emit ResponderUpdated(responder, allowed);
    }

    /// @notice Return total emergency cards.
    function totalEmergencyCards() external view returns (uint256) {
        return _totalCards;
    }
}
