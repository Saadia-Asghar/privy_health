import fs from "fs";
import path from "path";

const root = process.cwd();
const w = (p, c) => {
  const fp = path.join(root, p);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, c, "utf8");
};

const genericComponent = (name) => `import { useT } from "@/i18n/LanguageContext.jsx";
export default function ${name}(props){ const { t } = useT(); return <div className="card"><h2>${name}</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
`;

const uiFiles = [
  "Button","Card","Badge","Input","Modal","Toast","Skeleton","EmptyState","ThemeToggle","LanguageToggle",
  "ConnectModal","NetworkGuard","TxPreview","WhatsNext","PrescriptionCode","DoctorCard","WhatsAppTester","LiveCounter"
];
for (const n of uiFiles) w(`src/components/ui/${n}.jsx`, genericComponent(n));

for (const n of ["AppShell","Sidebar","Topbar","MobileNav"]) w(`src/components/layout/${n}.jsx`, genericComponent(n));

const pages = [
  "Landing","Demo","NotFound",
  "home/RoleHome","home/PatientHome","home/DoctorHome","home/PharmacyHome","home/HospitalHome","home/AdminHome",
  "patient/Onboarding","patient/Record","patient/AccessManager","patient/History","patient/Transfer","patient/Vitals","patient/Appointments","patient/Insurance","patient/Passport","patient/Audit",
  "emergency/Card","emergency/QRGen","emergency/Scanner",
  "doctor/Register","doctor/Prescribe","doctor/Patients","doctor/Schedule",
  "pharmacy/Register","pharmacy/Verify",
  "hospital/Register","hospital/Doctors",
  "admin/Dashboard","admin/Hospitals","admin/Doctors",
  "public/DrugChecker","public/DoctorDirectory","public/PharmacyMap","public/Medicines","public/LiveNetwork","public/Settings"
];
for (const p of pages) {
  const name = p.split("/").pop();
  w(`src/pages/${p}.jsx`, `import { useT } from "@/i18n/LanguageContext.jsx";
export default function ${name.replace(/[^a-zA-Z0-9_]/g, "")}Page(){ const { t } = useT(); return <main style={{padding:24}}><div className="card"><h1>${name}</h1><p>{t("app_title")}</p></div></main>; }
`);
}

w("src/hooks/useRole.js", `import { useEffect, useState } from "react";
import { ADMIN_WALLET } from "@/config/addresses.js";
export function useRole(account){ const [state,setState]=useState({role:"guest",loading:true});
useEffect(()=>{ if(!account){setState({role:"guest",loading:false}); return;} if(account===ADMIN_WALLET){setState({role:"admin",loading:false}); return;}
const cached = localStorage.getItem("ph_role_"+account); setState({role: cached || "new", loading:false}); },[account]);
return state;
}
`);
w("src/hooks/usePatient.js", `import { useEffect, useState } from "react";
export function usePatient(account){ const [s,setS]=useState({tokenId:0,hasRecord:false,hasEmergencyCard:false,activePrescriptions:0,pendingRequests:0});
useEffect(()=>{ if(!account) return; setS({tokenId:1,hasRecord:true,hasEmergencyCard:true,activePrescriptions:2,pendingRequests:1}); },[account]); return s; }`);
w("src/hooks/useDoctor.js", `import { useEffect, useState } from "react";
export function useDoctor(account){ const [s,setS]=useState({doctorInfo:null,isVerified:false,patientsWithAccess:0,pendingRefills:0,todayAppointments:0});
useEffect(()=>{ if(!account) return; setS({doctorInfo:{name:"Dr. Ahmed Khan"},isVerified:true,patientsWithAccess:3,pendingRefills:1,todayAppointments:2}); },[account]); return s; }`);

w("src/utils/format.js", `export const shortAddr=(a)=>a? \`\${a.slice(0,6)}...\${a.slice(-4)}\` : "";
export const fmtDate=(ts)=>new Date(Number(ts)*1000).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"});
export const fmtDateTime=(ts)=>new Date(Number(ts)*1000).toLocaleString("en-PK",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"});
export const timeAgo=(ts)=>{const d=Date.now()-Number(ts)*1000; if(d<60000)return "just now"; if(d<3600000)return Math.floor(d/60000)+" minutes ago"; if(d<86400000)return Math.floor(d/3600000)+" hours ago"; return Math.floor(d/86400000)+" days ago";};
export const fmtPKR=(n)=>"PKR "+Number(n).toLocaleString("en-PK");
export const bloodTypeColor=(bt)=>({ "A+":"blood-a","A-":"blood-a","B+":"blood-b","B-":"blood-b","AB+":"blood-ab","AB-":"blood-ab","O+":"blood-o","O-":"blood-o"}[bt]||"blood-default");
`);
w("src/utils/errors.js", `export function parseError(err){ const m=String(err?.reason||err?.message||"");
if(m.includes("rejected")) return { en:"Transaction rejected", ur:"ٹرانزیکشن مسترد" };
if(m.includes("insufficient")) return { en:"Insufficient funds", ur:"بیلنس ناکافی" };
if(m.includes("AlreadyHasRecord")) return { en:"Record already exists", ur:"ریکارڈ پہلے سے موجود ہے" };
if(m.includes("NotAuthorized")) return { en:"Not authorized", ur:"اجازت نہیں" };
return { en:"Please try again", ur:"دوبارہ کوشش کریں" }; }`);
w("src/utils/crypto.js", `export async function deriveKey(account, signFn){ const sig = await signFn("PrivyHealth Encryption Key");
const bytes = new TextEncoder().encode(account+sig); const hash = await crypto.subtle.digest("SHA-256", bytes);
return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt","decrypt"]); }
export async function encryptJSON(data,key){ const iv=crypto.getRandomValues(new Uint8Array(12)); const raw=new TextEncoder().encode(JSON.stringify(data));
const enc=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,raw); return JSON.stringify({iv:Array.from(iv),data:btoa(String.fromCharCode(...new Uint8Array(enc)))}); }
export async function decryptJSON(encStr,key){ const v=JSON.parse(encStr); const iv=new Uint8Array(v.iv); const bytes=Uint8Array.from(atob(v.data),c=>c.charCodeAt(0));
const dec=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,bytes); return JSON.parse(new TextDecoder().decode(dec)); }`);
w("src/utils/ipfs.js", `export async function uploadToIPFS(data, filename="data.json"){ const jwt=import.meta.env.VITE_PINATA_JWT; if(!jwt){ const cid="mock_"+Date.now(); localStorage.setItem(cid,JSON.stringify(data)); return cid; }
const body=new FormData(); body.append("file", new Blob([JSON.stringify(data)],{type:"application/json"}), filename);
const res=await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS",{method:"POST",headers:{Authorization:"Bearer "+jwt},body}); const j=await res.json(); return j.IpfsHash; }
export async function fetchFromIPFS(cid){ if(cid.startsWith("mock_")) return JSON.parse(localStorage.getItem(cid)||"null");
const g=[\`https://gateway.pinata.cloud/ipfs/\${cid}\`,\`https://ipfs.io/ipfs/\${cid}\`,\`https://cloudflare-ipfs.com/ipfs/\${cid}\`,\`https://dweb.link/ipfs/\${cid}\`];
for(const u of g){ try{ const ctl=new AbortController(); setTimeout(()=>ctl.abort(),8000); const r=await fetch(u,{signal:ctl.signal}); if(r.ok) return await r.json(); }catch{} } throw new Error("IPFS fetch failed"); }`);
w("src/utils/notify.js", `import toast from "react-hot-toast"; import { parseError } from "./errors.js";
export const notify={ success:(m,tx)=>toast.success(tx? \`\${m} • \${tx.slice(0,10)}...\` : m), error:(e)=>{const p=parseError(e); toast.error(p.en);}, loading:(m)=>{const id=toast.loading(m); return ()=>toast.dismiss(id);}, info:(m)=>toast(m)};`);

const meds = [];
const brands = ["Getz","Hilton","Ferozsons","AGP","CCL","Efroze","Genome","Macter","Saffron","Highnoon"];
const cats = ["Antibiotic","Antidiabetic","Antihypertensive","NSAID","PPI","Statin","Antihistamine","Psychotropic","Anticoagulant","Bronchodilator","Vitamin","Antifungal","Antiviral"];
for (let i = 1; i <= 100; i++) {
  const category = cats[(i - 1) % cats.length];
  const brand = `${category.replace(/[^A-Za-z]/g, "").slice(0,8)}-${i}`;
  meds.push({
    brand: `${brand} ${100 + (i % 10) * 50}mg`,
    generic: `Generic Compound ${i}`,
    manufacturer: `${brands[(i - 1) % brands.length]} Pakistan`,
    pricePerStrip: 120 + i * 3,
    tabletsPerStrip: 10,
    category,
    scheduleType: i % 4 === 0 ? "G" : i % 3 === 0 ? "H" : "OTC",
    prescriptionRequired: i % 4 !== 1,
    genericAvailable: true,
    genericBrand: `Gen-${i}`,
    genericPrice: 80 + i * 2,
    commonUses: ["Routine treatment", "Clinical management", "Doctor advised use"],
    commonAllergies: ["Penicillin", "NSAID sensitivity"],
    searchTerms: [brand.toLowerCase(), `generic compound ${i}`, category.toLowerCase()]
  });
}
w("src/config/medicines.json", JSON.stringify(meds, null, 2));
