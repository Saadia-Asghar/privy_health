export const shortAddr=(a)=>a? `${a.slice(0,6)}...${a.slice(-4)}` : "";
export const fmtDate=(ts)=>new Date(Number(ts)*1000).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"});
export const fmtDateTime=(ts)=>new Date(Number(ts)*1000).toLocaleString("en-PK",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"});
export const timeAgo=(ts)=>{const d=Date.now()-Number(ts)*1000; if(d<60000)return "just now"; if(d<3600000)return Math.floor(d/60000)+" minutes ago"; if(d<86400000)return Math.floor(d/3600000)+" hours ago"; return Math.floor(d/86400000)+" days ago";};
export const fmtPKR=(n)=>"PKR "+Number(n).toLocaleString("en-PK");
export const bloodTypeColor=(bt)=>({ "A+":"blood-a","A-":"blood-a","B+":"blood-b","B-":"blood-b","AB+":"blood-ab","AB-":"blood-ab","O+":"blood-o","O-":"blood-o"}[bt]||"blood-default");
