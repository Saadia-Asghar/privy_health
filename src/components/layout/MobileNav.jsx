import { useT } from "@/i18n/LanguageContext.jsx";
export default function MobileNav(props){ const { t } = useT(); return <div className="card"><h2>MobileNav</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
