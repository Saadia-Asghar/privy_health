import { useT } from "@/i18n/LanguageContext.jsx";
export default function LanguageToggle(props){ const { t } = useT(); return <div className="card"><h2>LanguageToggle</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
