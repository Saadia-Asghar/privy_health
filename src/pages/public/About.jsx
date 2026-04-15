import { Link } from "react-router-dom";
import { useT } from "@/i18n/LanguageContext.jsx";

export default function AboutPage() {
  const { t } = useT();
  return (
    <main className="landing-page-simple">
      <div className="card" style={{ maxWidth: 640, margin: "48px auto", padding: "var(--sp-8)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--sp-4)" }}>{t("nav_about")}</h1>
        <p style={{ color: "var(--text-2)", lineHeight: 1.7, marginBottom: "var(--sp-6)" }}>
          {t("landing_subheadline_long")}
        </p>
        <Link className="btn btn-primary" to="/">
          {t("nav_home")}
        </Link>
      </div>
    </main>
  );
}
