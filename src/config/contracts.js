import { BrowserProvider, Contract, JsonRpcProvider, ZeroAddress } from "ethers";
import { NETWORK } from "./network.js";
import { ADDRESSES } from "./addresses.js";

import HealthRecord from "@/artifacts/contracts/HealthRecord.sol/HealthRecord.json";
import DoctorRegistry from "@/artifacts/contracts/DoctorRegistry.sol/DoctorRegistry.json";
import EmergencyAccess from "@/artifacts/contracts/EmergencyAccess.sol/EmergencyAccess.json";
import PrescriptionNFT from "@/artifacts/contracts/PrescriptionNFT.sol/PrescriptionNFT.json";
import AppointmentSystem from "@/artifacts/contracts/AppointmentSystem.sol/AppointmentSystem.json";
import VitalSigns from "@/artifacts/contracts/VitalSigns.sol/VitalSigns.json";
import HospitalRegistry from "@/artifacts/contracts/HospitalRegistry.sol/HospitalRegistry.json";
import InsuranceClaim from "@/artifacts/contracts/InsuranceClaim.sol/InsuranceClaim.json";
import DoctorAvailability from "@/artifacts/contracts/DoctorAvailability.sol/DoctorAvailability.json";
import PharmacyRegistry from "@/artifacts/contracts/PharmacyRegistry.sol/PharmacyRegistry.json";

const ABI = {
  HEALTH_RECORD: HealthRecord.abi,
  DOCTOR_REGISTRY: DoctorRegistry.abi,
  EMERGENCY_ACCESS: EmergencyAccess.abi,
  PRESCRIPTION_NFT: PrescriptionNFT.abi,
  APPOINTMENT: AppointmentSystem.abi,
  VITAL_SIGNS: VitalSigns.abi,
  HOSPITAL_REGISTRY: HospitalRegistry.abi,
  INSURANCE_CLAIM: InsuranceClaim.abi,
  DOCTOR_AVAIL: DoctorAvailability.abi,
  PHARMACY_REGISTRY: PharmacyRegistry.abi
};

export const readProvider = new JsonRpcProvider(NETWORK.rpc);

export function getReadContract(name) {
  const address = ADDRESSES[name];
  if (!address || address === ZeroAddress) {
    console.warn(`Missing address for ${name}`);
    return null;
  }
  return new Contract(address, ABI[name], readProvider);
}

export async function getWriteContract(name) {
  const address = ADDRESSES[name];
  if (!window.ethereum || !address || address === ZeroAddress) {
    console.warn(`No wallet/address for ${name}`);
    return null;
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(address, ABI[name], signer);
}
