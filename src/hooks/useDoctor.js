import { useEffect, useState } from "react";
export function useDoctor(account){ const [s,setS]=useState({doctorInfo:null,isVerified:false,patientsWithAccess:0,pendingRefills:0,todayAppointments:0});
useEffect(()=>{ if(!account) return; setS({doctorInfo:{name:"Dr. Ahmed Khan"},isVerified:true,patientsWithAccess:3,pendingRefills:1,todayAppointments:2}); },[account]); return s; }