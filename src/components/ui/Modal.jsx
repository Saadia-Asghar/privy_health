import { useT } from "@/i18n/LanguageContext.jsx";
export default function Modal(props){ const { t } = useT(); return <div className="card"><h2>Modal</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
