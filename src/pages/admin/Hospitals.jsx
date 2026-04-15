import { useT } from "@/i18n/LanguageContext.jsx";
export default function HospitalsPage(){ const { t } = useT(); return <main style={{padding:24}}><div className="card"><h1>Hospitals</h1><p>{t("app_title")}</p></div></main>; }
