import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

const ROOT = process.cwd();
const SRC_CONFIG = path.join(ROOT, "src", "config");
const ENV_LOCAL = path.join(ROOT, ".env.local");
const DEPLOYMENT_JSON = path.join(ROOT, "deployment-record.json");
const DEPLOYED_ADDR_PATH = path.join(SRC_CONFIG, "deployedAddresses.json");

function short(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function updateEnvLocal(addresses) {
  const env = fs.existsSync(ENV_LOCAL) ? fs.readFileSync(ENV_LOCAL, "utf8") : "";
  const lines = env.split(/\r?\n/);
  const map = new Map();
  for (const line of lines) {
    const idx = line.indexOf("=");
    if (idx > 0) map.set(line.slice(0, idx), line.slice(idx + 1));
  }
  for (const [k, v] of Object.entries(addresses)) map.set(k, v);
  const next = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("\n");
  fs.writeFileSync(ENV_LOCAL, `${next}\n`, "utf8");
}

async function deployOne(name, ...args) {
  const Factory = await ethers.getContractFactory(name);
  const contract = await Factory.deploy(...args);
  const tx = contract.deploymentTransaction();
  await contract.waitForDeployment();
  return { name, address: await contract.getAddress(), txHash: tx?.hash ?? "" };
}

async function main() {
  fs.mkdirSync(SRC_CONFIG, { recursive: true });
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();

  const hospitalRegistry = await deployOne("HospitalRegistry");
  const doctorRegistry = await deployOne("DoctorRegistry");
  const pharmacyRegistry = await deployOne("PharmacyRegistry");
  const healthRecord = await deployOne("HealthRecord");
  const emergencyAccess = await deployOne("EmergencyAccess");
  const prescriptionNFT = await deployOne("PrescriptionNFT", pharmacyRegistry.address);
  const appointment = await deployOne("AppointmentSystem", healthRecord.address);
  const vitalSigns = await deployOne("VitalSigns");
  const insuranceClaim = await deployOne("InsuranceClaim", deployer.address, hospitalRegistry.address);
  const doctorAvail = await deployOne("DoctorAvailability");

  const deployed = [
    healthRecord,
    doctorRegistry,
    emergencyAccess,
    prescriptionNFT,
    appointment,
    vitalSigns,
    hospitalRegistry,
    insuranceClaim,
    doctorAvail,
    pharmacyRegistry
  ];

  const envMap = {
    VITE_ADDR_HEALTH_RECORD: healthRecord.address,
    VITE_ADDR_DOCTOR_REGISTRY: doctorRegistry.address,
    VITE_ADDR_EMERGENCY_ACCESS: emergencyAccess.address,
    VITE_ADDR_PRESCRIPTION_NFT: prescriptionNFT.address,
    VITE_ADDR_APPOINTMENT: appointment.address,
    VITE_ADDR_VITAL_SIGNS: vitalSigns.address,
    VITE_ADDR_HOSPITAL_REGISTRY: hospitalRegistry.address,
    VITE_ADDR_INSURANCE_CLAIM: insuranceClaim.address,
    VITE_ADDR_DOCTOR_AVAIL: doctorAvail.address,
    VITE_ADDR_PHARMACY_REGISTRY: pharmacyRegistry.address
  };

  fs.writeFileSync(
    DEPLOYED_ADDR_PATH,
    JSON.stringify(
      {
        network: {
          chainId: Number(net.chainId),
          name: net.name
        },
        deployer: deployer.address,
        contracts: Object.fromEntries(deployed.map((d) => [d.name, { address: d.address, txHash: d.txHash }]))
      },
      null,
      2
    ),
    "utf8"
  );

  updateEnvLocal(envMap);

  const record = {
    submittedAt: new Date().toISOString(),
    network: { chainId: Number(net.chainId), name: net.name },
    deployer: deployer.address,
    contracts: deployed,
    env: envMap,
    submissionEmail: "submissions@wirefluid.com"
  };
  fs.writeFileSync(DEPLOYMENT_JSON, JSON.stringify(record, null, 2), "utf8");

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PrivyHealth Pakistan — Deployment Complete                 ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  Network: ${net.name} (chainId: ${Number(net.chainId)})`.padEnd(63) + "║");
  console.log(`║  Deployer: ${short(deployer.address)}`.padEnd(63) + "║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  for (const d of deployed) {
    const row = `║  ${d.name.padEnd(20)} ${short(d.address)}  TX: ${short(d.txHash || "0x0")}`;
    console.log(row.padEnd(63) + "║");
  }
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log("║  ADD TO VERCEL ENVIRONMENT VARIABLES:                       ║");
  for (const [k, v] of Object.entries(envMap)) {
    console.log(`║  ${k}=${v}`.slice(0, 62).padEnd(62) + "║");
  }
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log("║  SUBMISSION EMAIL: submissions@wirefluid.com               ║");
  console.log("║  Run: cat deployment-record.json                            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
