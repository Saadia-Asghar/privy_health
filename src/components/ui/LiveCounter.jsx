import { useT } from "@/i18n/LanguageContext.jsx";
export default function LiveCounter(props){ const { t } = useT(); return <div className="card"><h2>LiveCounter</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
