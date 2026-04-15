import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

const DEMO_PATH = path.join(process.cwd(), "src", "config", "demoData.json");

async function main() {
  const [admin, patient1, drAhmed, drFatima, agaKhan, shaukat, medico, patient2] = await ethers.getSigners();

  const addresses = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "config", "deployedAddresses.json"), "utf8"));
  const c = addresses.contracts;
  const health = await ethers.getContractAt("HealthRecord", c.HealthRecord.address);
  const doctor = await ethers.getContractAt("DoctorRegistry", c.DoctorRegistry.address);
  const emergency = await ethers.getContractAt("EmergencyAccess", c.EmergencyAccess.address);
  const rx = await ethers.getContractAt("PrescriptionNFT", c.PrescriptionNFT.address);
  const hospital = await ethers.getContractAt("HospitalRegistry", c.HospitalRegistry.address);
  const pharmacy = await ethers.getContractAt("PharmacyRegistry", c.PharmacyRegistry.address);
  const avail = await ethers.getContractAt("DoctorAvailability", c.DoctorAvailability.address);

  await (await hospital.connect(agaKhan).registerInstitution("Aga Khan Hospital", 0, "Stadium Rd", "Karachi", "AKH-001", "contact@agakhan.pk")).wait();
  await (await hospital.connect(shaukat).registerInstitution("Shaukat Khanum", 0, "Johar Town", "Lahore", "SKM-001", "contact@skm.pk")).wait();
  await (await hospital.connect(admin).approveInstitution(agaKhan.address)).wait();
  await (await hospital.connect(admin).approveInstitution(shaukat.address)).wait();

  await (await doctor.connect(drAhmed).registerDoctor("Dr. Ahmed Khan", "Cardiologist", "PMDC-12345", "Aga Khan Hospital", "Karachi", "ahmed@privy.pk")).wait();
  await (await doctor.connect(drFatima).registerDoctor("Dr. Fatima Malik", "Neurologist", "PMDC-67890", "Shaukat Khanum", "Lahore", "fatima@privy.pk")).wait();
  await (await doctor.connect(admin).verifyDoctor(drAhmed.address)).wait();
  await (await doctor.connect(admin).verifyDoctor(drFatima.address)).wait();
  await (await hospital.connect(agaKhan).linkDoctor(drAhmed.address)).wait();
  await (await hospital.connect(shaukat).linkDoctor(drFatima.address)).wait();

  await (await avail.connect(drAhmed).setAvailability([
    [1, 9, 17, true, 3000],
    [2, 9, 17, true, 3000],
    [3, 9, 17, true, 3000],
    [4, 9, 17, true, 3000],
    [5, 9, 17, true, 3000]
  ])).wait();

  await (await pharmacy.connect(medico).registerPharmacy("Medico Pharmacy", "Saddar", "Karachi", "DRAP-RX-001", "+923001234567")).wait();
  await (await pharmacy.connect(admin).approvePharmacy(medico.address)).wait();

  await (await health.connect(patient1).mintRecord("mock_cid_patient1", "ipfs://patient1")).wait();
  await (await emergency.connect(patient1).setEmergencyCard(
    '{"bt":"B+","al":["Penicillin"],"meds":"Warfarin 5mg","ec":{"name":"Father","phone":"0300-1234567"},"donor":false}',
    "mock_full_cid_emergency_patient1"
  )).wait();

  const tokenId = await health.patientToken(patient1.address);
  await (await health.connect(patient1).grantAccess(tokenId, drAhmed.address)).wait();

  await (await rx.connect(admin).setDoctor(drAhmed.address, true)).wait();
  const tx1 = await (await rx.connect(drAhmed).issuePrescription(
    patient1.address,
    "mock_rx_1",
    "Metformin 500mg twice daily",
    30,
    1,
    3
  )).wait();
  const id1 = tx1.logs.find((l) => l.fragment?.name === "PrescriptionIssued")?.args?.tokenId ?? 1n;

  const tx2 = await (await rx.connect(drAhmed).issuePrescription(
    patient1.address,
    "mock_rx_2",
    "Augmentin 625mg twice daily",
    5,
    2,
    0
  )).wait();
  const id2 = tx2.logs.find((l) => l.fragment?.name === "PrescriptionIssued")?.args?.tokenId ?? 2n;
  const code = ethers.encodeBytes32String("PK7X4M").slice(0, 14);
  await (await rx.connect(admin).setCodeOverride(id2, code)).wait();
  await (await rx.connect(admin).generateCode(id2)).wait();

  fs.mkdirSync(path.dirname(DEMO_PATH), { recursive: true });
  fs.writeFileSync(
    DEMO_PATH,
    JSON.stringify(
      {
        wallets: {
          admin: admin.address,
          patient1: patient1.address,
          patient2: patient2.address,
          doctorAhmed: drAhmed.address,
          doctorFatima: drFatima.address,
          agaKhan: agaKhan.address,
          shaukat: shaukat.address,
          medico: medico.address
        },
        patient1TokenId: tokenId.toString(),
        prescriptions: {
          first: { tokenId: id1.toString() },
          second: { tokenId: id2.toString(), code: "PK-7X4M2K" }
        }
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("Seeded demo data successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
