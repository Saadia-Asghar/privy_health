import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const Demo = lazy(() => import("./pages/Demo.jsx"));
const DrugChecker = lazy(() => import("./pages/public/DrugChecker.jsx"));
const Medicines = lazy(() => import("./pages/public/Medicines.jsx"));
const DoctorDirectory = lazy(() => import("./pages/public/DoctorDirectory.jsx"));
const PharmacyMap = lazy(() => import("./pages/public/PharmacyMap.jsx"));
const Scanner = lazy(() => import("./pages/emergency/Scanner.jsx"));
const VerifyRecord = lazy(() => import("./pages/public/VerifyRecord.jsx"));
const LiveNetwork = lazy(() => import("./pages/public/LiveNetwork.jsx"));
const Onboarding = lazy(() => import("./pages/patient/Onboarding.jsx"));
const Record = lazy(() => import("./pages/patient/Record.jsx"));
const AccessManager = lazy(() => import("./pages/patient/AccessManager.jsx"));
const History = lazy(() => import("./pages/patient/History.jsx"));
const Transfer = lazy(() => import("./pages/patient/Transfer.jsx"));
const Vitals = lazy(() => import("./pages/patient/Vitals.jsx"));
const Appointments = lazy(() => import("./pages/patient/Appointments.jsx"));
const Insurance = lazy(() => import("./pages/patient/Insurance.jsx"));
const Passport = lazy(() => import("./pages/patient/Passport.jsx"));
const EmergencyCard = lazy(() => import("./pages/emergency/Card.jsx"));
const QRGen = lazy(() => import("./pages/emergency/QRGen.jsx"));
const Audit = lazy(() => import("./pages/patient/Audit.jsx"));
const DoctorRegister = lazy(() => import("./pages/doctor/Register.jsx"));
const Prescribe = lazy(() => import("./pages/doctor/Prescribe.jsx"));
const DoctorPatients = lazy(() => import("./pages/doctor/Patients.jsx"));
const Schedule = lazy(() => import("./pages/doctor/Schedule.jsx"));
const PharmacyRegister = lazy(() => import("./pages/pharmacy/Register.jsx"));
const VerifyPrescription = lazy(() => import("./pages/pharmacy/Verify.jsx"));
const HospitalRegister = lazy(() => import("./pages/hospital/Register.jsx"));
const HospitalDoctors = lazy(() => import("./pages/hospital/Doctors.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminHospitals = lazy(() => import("./pages/admin/Hospitals.jsx"));
const AdminDoctors = lazy(() => import("./pages/admin/Doctors.jsx"));
const Settings = lazy(() => import("./pages/public/Settings.jsx"));
const About = lazy(() => import("./pages/public/About.jsx"));
const RoleHome = lazy(() => import("./pages/home/RoleHome.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function PageSkeleton() {
  return (
    <main style={{ padding: 24 }}>
      <div className="card">
        <div className="skeleton" style={{ height: 24, width: 180 }} />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/home" element={<RoleHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/drug-checker" element={<DrugChecker />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/doctors" element={<DoctorDirectory />} />
        <Route path="/pharmacies" element={<PharmacyMap />} />
        <Route path="/emergency/scan" element={<Scanner />} />
        <Route path="/verify/:tokenId" element={<VerifyRecord />} />
        <Route path="/live" element={<LiveNetwork />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/patient/record" element={<Record />} />
        <Route path="/patient/access" element={<AccessManager />} />
        <Route path="/patient/history" element={<History />} />
        <Route path="/patient/transfer" element={<Transfer />} />
        <Route path="/patient/vitals" element={<Vitals />} />
        <Route path="/patient/appointments" element={<Appointments />} />
        <Route path="/patient/insurance" element={<Insurance />} />
        <Route path="/patient/passport" element={<Passport />} />
        <Route path="/emergency/card" element={<EmergencyCard />} />
        <Route path="/emergency/qr" element={<QRGen />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/prescribe" element={<Prescribe />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/schedule" element={<Schedule />} />
        <Route path="/pharmacy/register" element={<PharmacyRegister />} />
        <Route path="/pharmacy/verify" element={<VerifyPrescription />} />
        <Route path="/hospital/register" element={<HospitalRegister />} />
        <Route path="/hospital/doctors" element={<HospitalDoctors />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/hospitals" element={<AdminHospitals />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
