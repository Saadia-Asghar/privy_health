export async function deriveKey(account, signFn){ const sig = await signFn("PrivyHealth Encryption Key");
const bytes = new TextEncoder().encode(account+sig); const hash = await crypto.subtle.digest("SHA-256", bytes);
return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt","decrypt"]); }
export async function encryptJSON(data,key){ const iv=crypto.getRandomValues(new Uint8Array(12)); const raw=new TextEncoder().encode(JSON.stringify(data));
const enc=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,raw); return JSON.stringify({iv:Array.from(iv),data:btoa(String.fromCharCode(...new Uint8Array(enc)))}); }
export async function decryptJSON(encStr,key){ const v=JSON.parse(encStr); const iv=new Uint8Array(v.iv); const bytes=Uint8Array.from(atob(v.data),c=>c.charCodeAt(0));
const dec=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,bytes); return JSON.parse(new TextDecoder().decode(dec)); }