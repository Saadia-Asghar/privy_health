import { useEffect, useState } from "react";
export function usePatient(account){ const [s,setS]=useState({tokenId:0,hasRecord:false,hasEmergencyCard:false,activePrescriptions:0,pendingRequests:0});
useEffect(()=>{ if(!account) return; setS({tokenId:1,hasRecord:true,hasEmergencyCard:true,activePrescriptions:2,pendingRequests:1}); },[account]); return s; }