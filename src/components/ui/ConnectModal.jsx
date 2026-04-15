import { useT } from "@/i18n/LanguageContext.jsx";
export default function ConnectModal(props){ const { t } = useT(); return <div className="card"><h2>ConnectModal</h2><p>{t("app_tagline")}</p>{props?.children}</div>; }
