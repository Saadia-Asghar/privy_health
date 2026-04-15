import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  Heart,
  LayoutDashboard,
  Lock,
  Moon,
  Play,
  Stethoscope,
  Sun,
  Wallet
} from "lucide-react";
import { useT } from "@/i18n/LanguageContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useWallet } from "@/context/WalletContext.jsx";
import toast from "react-hot-toast";

function shortAddr(a) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function LandingPage() {
  const { t, toggle, lang } = useT();
  const { toggle: toggleTheme, isDark } = useTheme();
  const { account, connect, disconnect, connecting } = useWallet();

  const onConnect = async () => {
    try {
      await connect();
      toast.success(t("btn_connect_wallet"));
    } catch (e) {
      if (String(e?.message || e).includes("NO_METAMASK")) toast.error(t("err_no_metamask"));
      else toast.error(t("err_please_try_again"));
    }
  };

  return (
    <div className="landing-shell">
      <aside className="landing-sidebar">
        <div className="landing-logo">
          <div className="landing-logo-mark" aria-hidden>
            <Heart size={22} strokeWidth={2.2} fill="currentColor" className="landing-logo-heart" />
          </div>
          <div>
            <div className="landing-wordmark">{t("landing_brand_wordmark")}</div>
            <div className="landing-logo-sub">{t("landing_brand_sub")}</div>
          </div>
        </div>

        <p className="landing-nav-label">{t("nav_section_public")}</p>
        <nav className="landing-nav">
          <NavLink end className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/">
            {t("nav_home")}
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/drug-checker">
            {t("nav_drug_checker")}
            <span className="badge badge-free">{t("misc_free_badge")}</span>
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/medicines">
            {t("nav_medicine_prices")}
            <span className="badge badge-new">{t("misc_new_badge")}</span>
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/doctors">
            {t("nav_doctors")}
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item landing-nav-emergency ${isActive ? "active" : ""}`} to="/emergency/scan">
            {t("nav_emergency_scan")}
            <span className="badge badge-emergency">{t("emergency_urgent")}</span>
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/live">
            {t("nav_live_short")}
            <span className="badge badge-live-dot">
              <span className="live-dot" /> {t("nav_live_short")}
            </span>
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/demo">
            {t("nav_demo")}
          </NavLink>
          <NavLink className={({ isActive }) => `landing-nav-item ${isActive ? "active" : ""}`} to="/about">
            {t("nav_about")}
          </NavLink>
        </nav>

        <p className="landing-nav-label">{t("nav_section_patient")}</p>
        <nav className="landing-nav">
          <Link className="landing-nav-item" to="/patient/record">
            <LayoutDashboard size={18} />
            {t("nav_dashboard")}
            <Lock size={14} className="landing-nav-lock" aria-hidden />
          </Link>
        </nav>
      </aside>

      <div className="landing-main">
        <header className="landing-topbar">
          <div className="landing-topbar-left" />
          <div className="landing-topbar-right">
            <Link className="landing-top-link" to="/live">
              <span className="live-dot" />
              {t("nav_live_short")}
            </Link>
            <Link className="landing-top-link" to="/demo">
              <Play size={16} />
              {t("nav_demo")}
            </Link>
            <button type="button" className="landing-icon-btn" onClick={toggle} title={lang === "en" ? "Urdu" : "English"}>
              {lang === "en" ? "اردو" : "EN"}
            </button>
            <button type="button" className="landing-icon-btn" onClick={toggleTheme} title="Theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {account ? (
              <button type="button" className="btn btn-outline landing-wallet-btn" onClick={disconnect}>
                {shortAddr(account)}
              </button>
            ) : (
              <button type="button" className="btn btn-primary landing-connect" onClick={onConnect} disabled={connecting}>
                <Wallet size={18} />
                {connecting ? t("misc_loading") : t("btn_connect_wallet")}
              </button>
            )}
          </div>
        </header>

        <main className="landing-hero-wrap">
          <div className="landing-hero-inner">
            <div className="landing-badge-row">
              <span className="landing-network-badge">{t("landing_badge_network")}</span>
            </div>
            <h1 className="landing-headline">
              <span className="landing-h1">{t("landing_headline_1")}</span>
              <span className="landing-h1">{t("landing_headline_2")}</span>
              <span className="landing-h1 landing-h1-accent">{t("landing_headline_3")}</span>
            </h1>
            <p className="landing-sub">{t("landing_subheadline_long")}</p>
          </div>

          <div className="landing-stats">
            <div className="landing-stat-card">
              <div className="landing-ekg" aria-hidden>
                <Activity className="landing-ekg-line" size={120} strokeWidth={1} />
              </div>
              <div className="landing-stat-num">48</div>
              <div className="landing-stat-label">{t("landing_stat_records_label")}</div>
            </div>
            <div className="landing-stat-card">
              <div className="landing-ekg" aria-hidden>
                <Activity className="landing-ekg-line" size={120} strokeWidth={1} />
              </div>
              <div className="landing-stat-num">12</div>
              <div className="landing-stat-label">{t("landing_stat_doctors_label")}</div>
            </div>
          </div>
        </main>

        <button type="button" className="landing-fab" title="AI assistant" aria-label="Assistant">
          <Stethoscope size={22} />
        </button>
      </div>
    </div>
  );
}
