import { useT } from "@/i18n/LanguageContext.jsx";
export default function Button(props){ const { t } = useT(); return <div className="card"><h2>Button</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
