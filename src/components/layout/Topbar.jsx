import { useT } from "@/i18n/LanguageContext.jsx";
export default function Topbar(props){ const { t } = useT(); return <div className="card"><h2>Topbar</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
