import { useParams } from "react-router-dom";
import { useT } from "@/i18n/LanguageContext.jsx";

export default function VerifyRecordPage() {
  const { tokenId } = useParams();
  const { t } = useT();
  return (
    <main style={{ padding: 24 }}>
      <div className="card">
        <h1>Verify Record</h1>
        <p>{t("misc_verified_badge")} Token #{tokenId}</p>
      </div>
    </main>
  );
}
