import { useT } from "@/i18n/LanguageContext.jsx";
export default function AuditPage(){ const { t } = useT(); return <main style={{padding:24}}><div className="card"><h1>Audit</h1><p>{t("app_title")}</p></div></main>; }
