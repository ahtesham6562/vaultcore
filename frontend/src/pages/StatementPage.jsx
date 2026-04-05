import { useState, useEffect } from "react";
import authService from "../services/authService";

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
};

export default function StatementPage({ onBack }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const isMobile = useIsMobile();

    const downloadStatement = async () => {
        setLoading(true);
        setError('');
        setDone(false);
        try {
            const token = authService.getToken();
            const response = await fetch("http://localhost:8080/api/statement/download", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to download");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "vaultcore-statement.pdf";
            a.click();
            window.URL.revokeObjectURL(url);
            setDone(true);
        } catch (err) {
            setError("Statement generation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.shell}>
            {/* Topbar */}
            <div style={s.topbar}>
                <div style={s.logoMark} />
                <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                {!isMobile && <span style={s.topbarSection}>/ Statement</span>}
                <button style={s.backBtn} onClick={onBack}>← {isMobile ? '' : 'Dashboard'}</button>
            </div>

            <div style={{ ...s.main, padding: isMobile ? '16px' : '24px' }}>
                <div style={s.pageHeader}>
                    <div style={s.pageTitle}>Account Statement</div>
                    <div style={s.pageSub}>iText 8 · PDF generation · Full transaction history</div>
                </div>

                <div style={{ ...s.twoCol, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                    {/* Download Card */}
                    <div style={s.card}>
                        <div style={s.cardHead}>
                            <div style={s.cardTitle}>Generate PDF Statement</div>
                            <span style={s.badgeBlue}>iText 8</span>
                        </div>

                        <div style={s.infoGrid}>
                            {[
                                ['FORMAT', 'PDF / A4'],
                                ['INCLUDES', 'All DEBIT + CREDIT entries'],
                                ['SORTED BY', 'Date descending'],
                                ['GENERATOR', 'iText 8.0.3'],
                                ['SECURITY', 'JWT authenticated'],
                            ].map(([k, v]) => (
                                <div key={k} style={s.infoRow}>
                                    <span style={s.infoKey}>{k}</span>
                                    <span style={s.infoVal}>{v}</span>
                                </div>
                            ))}
                        </div>

                        {done && (
                            <div style={s.successBox}>
                                <div style={s.successIcon}>✓</div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--vc-teal)', fontWeight: '500' }}>Statement downloaded</div>
                                    <div style={{ fontSize: '10px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)', marginTop: '2px' }}>vaultcore-statement.pdf</div>
                                </div>
                            </div>
                        )}

                        {error && <div style={s.errorBox}>{error}</div>}

                        <button onClick={downloadStatement} disabled={loading}
                            style={loading ? s.btnDisabled : s.btn}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span style={s.spinner} />
                                    Generating PDF...
                                </span>
                            ) : '⬇ Download Statement'}
                        </button>
                    </div>

                    {/* Info Card */}
                    <div style={s.card}>
                        <div style={s.cardHead}>
                            <div style={s.cardTitle}>Statement Contents</div>
                            <span style={s.badgeGold}>DOUBLE-ENTRY</span>
                        </div>

                        <div style={s.featureList}>
                            {[
                                { icon: '▦', label: 'Account Details', desc: 'Name, account number, email' },
                                { icon: '↑', label: 'DEBIT Entries', desc: 'All outgoing transfers', color: 'var(--vc-red)' },
                                { icon: '↓', label: 'CREDIT Entries', desc: 'All incoming transfers', color: 'var(--vc-teal)' },
                                { icon: '≡', label: 'Transaction Refs', desc: 'TXN-XXXXXXXX reference IDs' },
                                { icon: '◈', label: 'Balance After', desc: 'Running balance per entry' },
                                { icon: '✦', label: 'Timestamps', desc: 'IST timezone · dd MMM yyyy' },
                            ].map(f => (
                                <div key={f.label} style={s.featureRow}>
                                    <span style={{ ...s.featureIcon, color: f.color || 'var(--vc-muted)' }}>{f.icon}</span>
                                    <div>
                                        <div style={s.featureLabel}>{f.label}</div>
                                        <div style={s.featureDesc}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!isMobile && (
                            <div style={s.techNote}>
                                <span style={s.techNoteLabel}>IMPLEMENTATION</span>
                                <div style={s.techNoteCode}>
                                    {`StatementController\n→ UserRepository.findByUsername()\n→ LedgerRepo.findByAccountId()\n→ iText PdfDocument + Table\n→ ResponseEntity<byte[]>`}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const s = {
    shell: { minHeight: '100vh', background: 'var(--vc-bg)', fontFamily: 'var(--vc-sans)' },
    topbar: { background: 'var(--vc-surface)', borderBottom: '1px solid var(--vc-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', height: '52px', position: 'sticky', top: 0, zIndex: 10 },
    logoMark: { width: '24px', height: '24px', background: 'var(--vc-gold)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', flexShrink: 0 },
    logoText: { fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', color: 'var(--vc-text)' },
    topbarSection: { fontSize: '12px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    backBtn: { marginLeft: 'auto', background: 'none', border: '1px solid var(--vc-border)', color: 'var(--vc-muted)', cursor: 'pointer', fontSize: '11px', padding: '5px 12px', borderRadius: '4px' },
    main: {},
    pageHeader: { marginBottom: '24px' },
    pageTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--vc-text)' },
    pageSub: { fontSize: '11px', color: 'var(--vc-muted)', marginTop: '2px', fontFamily: 'var(--vc-mono)' },
    twoCol: { display: 'grid', gap: '12px' },
    card: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '16px' },
    cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--vc-border)' },
    cardTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--vc-text)', letterSpacing: '0.04em' },
    infoGrid: { display: 'flex', flexDirection: 'column', marginBottom: '20px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    infoKey: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    infoVal: { fontSize: '11px', color: 'var(--vc-text)', fontFamily: 'var(--vc-mono)' },
    successBox: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(29,232,181,0.05)', border: '1px solid rgba(29,232,181,0.2)', borderRadius: '6px', padding: '12px', marginBottom: '16px' },
    successIcon: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--vc-teal)', color: '#0a0d12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 },
    errorBox: { padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.25)', color: 'var(--vc-red)', fontSize: '12px', fontFamily: 'var(--vc-mono)', marginBottom: '16px' },
    btn: { width: '100%', padding: '11px', borderRadius: '6px', border: 'none', background: 'var(--vc-gold)', color: '#1a0e00', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    btnDisabled: { width: '100%', padding: '11px', borderRadius: '6px', border: 'none', background: 'var(--vc-surface2)', color: 'var(--vc-muted)', fontSize: '13px', fontWeight: '600', cursor: 'not-allowed' },
    spinner: { width: '12px', height: '12px', border: '2px solid rgba(26,14,0,0.3)', borderTop: '2px solid #1a0e00', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },
    featureList: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
    featureRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    featureIcon: { fontSize: '14px', marginTop: '1px', flexShrink: 0 },
    featureLabel: { fontSize: '12px', color: 'var(--vc-text)', marginBottom: '2px' },
    featureDesc: { fontSize: '10px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    techNote: { background: 'var(--vc-surface2)', border: '1px solid var(--vc-border)', borderRadius: '6px', padding: '12px' },
    techNoteLabel: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)', display: 'block', marginBottom: '8px' },
    techNoteCode: { fontSize: '10px', color: 'var(--vc-teal)', fontFamily: 'var(--vc-mono)', lineHeight: '1.8', whiteSpace: 'pre' },
    badgeBlue: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(77,159,255,0.1)', color: 'var(--vc-blue)', border: '1px solid rgba(77,159,255,0.25)' },
    badgeGold: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(201,168,76,0.15)', color: 'var(--vc-gold)', border: '1px solid rgba(201,168,76,0.3)' },
};