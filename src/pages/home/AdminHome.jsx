import { useT } from "@/i18n/LanguageContext.jsx";
export default function AdminHomePage(){ const { t } = useT(); return <main style={{padding:24}}><div className="card"><h1>AdminHome</h1><p>{t("app_title")}</p></div></main>; }
