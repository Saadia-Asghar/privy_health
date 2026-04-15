import { useT } from "@/i18n/LanguageContext.jsx";
export default function DrugCheckerPage(){ const { t } = useT(); return <main style={{padding:24}}><div className="card"><h1>DrugChecker</h1><p>{t("app_title")}</p></div></main>; }
