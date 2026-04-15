import { useEffect, useState } from "react";
import { ADMIN_WALLET } from "@/config/addresses.js";
export function useRole(account){ const [state,setState]=useState({role:"guest",loading:true});
useEffect(()=>{ if(!account){setState({role:"guest",loading:false}); return;} if(account===ADMIN_WALLET){setState({role:"admin",loading:false}); return;}
const cached = localStorage.getItem("ph_role_"+account); setState({role: cached || "new", loading:false}); },[account]);
return state;
}
