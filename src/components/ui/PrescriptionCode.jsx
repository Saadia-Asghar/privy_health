import { useT } from "@/i18n/LanguageContext.jsx";
export default function PrescriptionCode(props){ const { t } = useT(); return <div className="card"><h2>PrescriptionCode</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
