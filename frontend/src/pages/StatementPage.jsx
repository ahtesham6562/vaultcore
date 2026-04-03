import { useState } from "react";
import authService from "../services/authService";

const StatementPage = ({ onBack }) => {
  const [loading, setLoading] = useState(false);

  const downloadStatement = async () => {
    setLoading(true);
    try {
      const token = authService.getToken(); // "accessToken" key se lega
      const response = await fetch("http://localhost:8080/api/statement/download", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vaultcore-statement.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Statement download failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📄</div>
        <h1 style={styles.title}>Account Statement</h1>
        <p style={styles.sub}>
          Download your complete transaction history as a PDF.
        </p>

        <button
          onClick={downloadStatement}
          disabled={loading}
          style={loading ? styles.btnDisabled : styles.btn}
        >
          {loading ? "Generating PDF..." : "⬇ Download Statement"}
        </button>

        <button onClick={onBack} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#0f0c29", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" },
  card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "40px", textAlign: "center", maxWidth: "420px", width: "100%" },
  icon: { fontSize: "64px", marginBottom: "16px" },
  title: { color: "#fff", fontSize: "24px", fontWeight: "bold", marginBottom: "8px" },
  sub: { color: "#888", fontSize: "14px", marginBottom: "32px" },
  btn: { width: "100%", background: "#6c63ff", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" },
  btnDisabled: { width: "100%", background: "#3a3560", color: "#888", border: "none", borderRadius: "12px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: "not-allowed", marginBottom: "12px" },
  backBtn: { width: "100%", background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px", fontSize: "14px", cursor: "pointer" }
};

export default StatementPage;