import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("HealthRecord", function () {
  it("mints, blocks transfer, grants and revokes access, shares history", async function () {
    const [patient, doctor, other] = await ethers.getSigners();
    const Health = await ethers.getContractFactory("HealthRecord");
    const health = await Health.deploy();
    await health.waitForDeployment();

    await (await health.connect(patient).mintRecord("cid1", "ipfs://meta")).wait();
    const tokenId = await health.patientToken(patient.address);
    await expect(health.connect(patient).transferFrom(patient.address, other.address, tokenId)).to.be.reverted;

    await (await health.connect(patient).grantAccess(tokenId, doctor.address)).wait();
    expect(await health.hasAccess(tokenId, doctor.address)).to.equal(true);
    await (await health.connect(patient).revokeAccess(tokenId, doctor.address)).wait();
    expect(await health.hasAccess(tokenId, doctor.address)).to.equal(false);

    await (await health.connect(patient).shareFullHistory(tokenId, other.address, 30, true, "second opinion")).wait();
    expect(await health.hasFullHistory(tokenId, other.address)).to.equal(true);
  });
});

describe("EmergencyAccess", function () {
  it("sets and reads public emergency card", async function () {
    const [patient] = await ethers.getSigners();
    const C = await ethers.getContractFactory("EmergencyAccess");
    const c = await C.deploy();
    await c.waitForDeployment();
    await (await c.connect(patient).setEmergencyCard('{"bt":"B+"}', "cid")).wait();
    expect(await c.hasEmergencyCard(patient.address)).to.equal(true);
    expect(await c.getPublicData(patient.address)).to.include("B+");
  });
});

describe("DoctorRegistry", function () {
  it("registers verifies and rates doctor", async function () {
    const [admin, doc, patient] = await ethers.getSigners();
    const C = await ethers.getContractFactory("DoctorRegistry");
    const c = await C.deploy();
    await c.waitForDeployment();
    await (await c.connect(doc).registerDoctor("Doc", "Cardio", "PMDC-1", "AKH", "Karachi", "d@d.com")).wait();
    await (await c.connect(admin).verifyDoctor(doc.address)).wait();
    expect(await c.isVerifiedDoctor(doc.address)).to.equal(true);
    await (await c.connect(patient).submitRating(doc.address, 5, "great")).wait();
    const [stars, count] = await c.getDoctorRating(doc.address);
    expect(stars).to.equal(5n);
    expect(count).to.equal(1n);
  });
});

describe("HospitalRegistry", function () {
  it("registers approves and links doctor", async function () {
    const [admin, hospital, doctor] = await ethers.getSigners();
    const C = await ethers.getContractFactory("HospitalRegistry");
    const c = await C.deploy();
    await c.waitForDeployment();
    await (await c.connect(hospital).registerInstitution("AKH", 0, "addr", "Karachi", "L-1", "a@a.com")).wait();
    await (await c.connect(admin).approveInstitution(hospital.address)).wait();
    expect(await c.isApprovedInstitution(hospital.address)).to.equal(true);
    await (await c.connect(hospital).linkDoctor(doctor.address)).wait();
  });
});

describe("PrescriptionNFT", function () {
  it("issues verifies and fills", async function () {
    const [admin, doctor, patient, pharmacy] = await ethers.getSigners();
    const PR = await ethers.getContractFactory("PharmacyRegistry");
    const pr = await PR.deploy();
    await pr.waitForDeployment();
    await (await pr.connect(pharmacy).registerPharmacy("Medico", "addr", "Karachi", "DRAP", "03")).wait();
    await (await pr.connect(admin).approvePharmacy(pharmacy.address)).wait();

    const RX = await ethers.getContractFactory("PrescriptionNFT");
    const rx = await RX.deploy(await pr.getAddress());
    await rx.waitForDeployment();
    await (await rx.connect(admin).setDoctor(doctor.address, true)).wait();
    await (await rx.connect(doctor).issuePrescription(patient.address, "cid", "Augmentin", 3, 2, 0)).wait();

    const ids = await rx.getPatientPrescriptions(patient.address);
    const code = await rx.tokenToCode(ids[0]);
    const verify = await rx.verifyByCode(code);
    expect(verify[0]).to.equal(true);
    await (await rx.connect(pharmacy).fillByCode(code)).wait();
    const verify2 = await rx.verifyByCode(code);
    expect(verify2[1]).to.equal(true);
  });
});

describe("PharmacyRegistry", function () {
  it("registers approves and tiers", async function () {
    const [admin, pharmacy] = await ethers.getSigners();
    const C = await ethers.getContractFactory("PharmacyRegistry");
    const c = await C.deploy();
    await c.waitForDeployment();
    await (await c.connect(pharmacy).registerPharmacy("Medico", "addr", "Karachi", "DRAP", "03")).wait();
    await (await c.connect(admin).approvePharmacy(pharmacy.address)).wait();
    expect(await c.isRegisteredPharmacy(pharmacy.address)).to.equal(true);
    for (let i = 0; i < 101; i++) {
      await (await c.incrementVerifications(pharmacy.address)).wait();
    }
    expect(await c.getTier(pharmacy.address)).to.equal("Silver");
  });
});

describe("Integration", function () {
  it("full patient journey mint->grant->issue->verify->fill", async function () {
    const [admin, patient, doctor, pharmacy] = await ethers.getSigners();
    const Health = await ethers.getContractFactory("HealthRecord");
    const health = await Health.deploy();
    await health.waitForDeployment();
    await (await health.connect(patient).mintRecord("cid", "uri")).wait();
    const tid = await health.patientToken(patient.address);
    await (await health.connect(patient).grantAccess(tid, doctor.address)).wait();

    const PR = await ethers.getContractFactory("PharmacyRegistry");
    const pr = await PR.deploy();
    await pr.waitForDeployment();
    await (await pr.connect(pharmacy).registerPharmacy("Medico", "addr", "Karachi", "DRAP", "03")).wait();
    await (await pr.connect(admin).approvePharmacy(pharmacy.address)).wait();

    const RX = await ethers.getContractFactory("PrescriptionNFT");
    const rx = await RX.deploy(await pr.getAddress());
    await rx.waitForDeployment();
    await (await rx.connect(admin).setDoctor(doctor.address, true)).wait();
    await (await rx.connect(doctor).issuePrescription(patient.address, "cid2", "Metformin", 5, 1, 1)).wait();

    const ids = await rx.getPatientPrescriptions(patient.address);
    const code = await rx.tokenToCode(ids[0]);
    const beforeFill = await rx.verifyByCode(code);
    expect(beforeFill[0]).to.equal(true);
    await (await rx.connect(pharmacy).fillByCode(code)).wait();
    const afterFill = await rx.verifyByCode(code);
    expect(afterFill[1]).to.equal(true);
  });
});
