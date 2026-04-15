import { useT } from "@/i18n/LanguageContext.jsx";
export default function DoctorCard(props){ const { t } = useT(); return <div className="card"><h2>DoctorCard</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
