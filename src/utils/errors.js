export function parseError(err){ const m=String(err?.reason||err?.message||"");
if(m.includes("rejected")) return { en:"Transaction rejected", ur:"ٹرانزیکشن مسترد" };
if(m.includes("insufficient")) return { en:"Insufficient funds", ur:"بیلنس ناکافی" };
if(m.includes("AlreadyHasRecord")) return { en:"Record already exists", ur:"ریکارڈ پہلے سے موجود ہے" };
if(m.includes("NotAuthorized")) return { en:"Not authorized", ur:"اجازت نہیں" };
return { en:"Please try again", ur:"دوبارہ کوشش کریں" }; }