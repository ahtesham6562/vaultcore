import { useState, useEffect } from 'react';
import transferService from '../services/transferService';

export default function TransactionPage({ onBack }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const data = await transferService.getHistory();
            setHistory(data);
        } catch (err) {
            console.error('History fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'ALL' ? history : history.filter(h => h.type === filter);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={s.shell}>
            {/* Topbar */}
            <div style={s.topbar}>
                <div style={s.logoMark} />
                <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                <span style={s.topbarSection}>/ Ledger</span>
                <button style={s.backBtn} onClick={onBack}>← Dashboard</button>
            </div>

            <div style={s.main}>
                <div style={s.pageHeader}>
                    <div style={s.pageTitle}>Transaction Ledger</div>
                    <div style={s.pageSub}>Double-entry bookkeeping · Immutable · PostgreSQL triggers</div>
                </div>

                {/* Stats */}
                {!loading && (
                    <div style={s.metrics}>
                        {[
                            { label: 'TOTAL ENTRIES', value: history.length, color: 'var(--vc-text)' },
                            { label: 'DEBIT', value: history.filter(h => h.type === 'DEBIT').length, color: 'var(--vc-red)' },
                            { label: 'CREDIT', value: history.filter(h => h.type === 'CREDIT').length, color: 'var(--vc-teal)' },
                            { label: 'TOTAL DEBITED', value: `₹${history.filter(h => h.type === 'DEBIT').reduce((s, h) => s + parseFloat(h.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--vc-red)' },
                        ].map(m => (
                            <div key={m.label} style={s.metricCard}>
                                <div style={s.metricLabel}>{m.label}</div>
                                <div style={{ ...s.metricVal, color: m.color }}>{m.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={s.tabRow}>
                    {['ALL', 'DEBIT', 'CREDIT'].map(f => (
                        <div key={f} style={{ ...s.tab, ...(filter === f ? s.tabActive : {}) }}
                            onClick={() => setFilter(f)}>
                            {f}
                            <span style={{ ...s.tabBadge, background: filter === f ? 'rgba(201,168,76,0.2)' : 'var(--vc-surface2)', color: filter === f ? 'var(--vc-gold)' : 'var(--vc-muted)' }}>
                                {f === 'ALL' ? history.length : history.filter(h => h.type === f).length}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Ledger Table */}
                <div style={s.card}>
                    <div style={s.cardHead}>
                        <div style={s.cardTitle}>Ledger Entries</div>
                        <span style={s.badgeGold}>IMMUTABLE</span>
                    </div>

                    {loading ? (
                        <div style={s.empty}>Loading ledger...</div>
                    ) : filtered.length === 0 ? (
                        <div style={s.empty}>No transactions found.</div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {['DATE', 'TX REF', 'DESCRIPTION', 'TYPE', 'AMOUNT', 'BALANCE AFTER'].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((entry, i) => (
                                    <tr key={i} style={s.tr}>
                                        <td style={s.td}>{formatDate(entry.date)}</td>
                                        <td style={{ ...s.td, fontFamily: 'var(--vc-mono)', fontSize: '10px', color: 'var(--vc-muted)' }}>{entry.txRef}</td>
                                        <td style={{ ...s.td, color: 'var(--vc-muted)' }}>{entry.description}</td>
                                        <td style={s.td}>
                                            <span style={{ ...s.typeBadge, background: entry.type === 'DEBIT' ? 'rgba(255,77,106,0.1)' : 'rgba(29,232,181,0.1)', color: entry.type === 'DEBIT' ? 'var(--vc-red)' : 'var(--vc-teal)', border: `1px solid ${entry.type === 'DEBIT' ? 'rgba(255,77,106,0.25)' : 'rgba(29,232,181,0.25)'}` }}>
                                                {entry.type === 'DEBIT' ? '↑ DEBIT' : '↓ CREDIT'}
                                            </span>
                                        </td>
                                        <td style={{ ...s.td, fontFamily: 'var(--vc-mono)', color: entry.type === 'DEBIT' ? 'var(--vc-red)' : 'var(--vc-teal)', textAlign: 'right' }}>
                                            {entry.type === 'DEBIT' ? '-' : '+'}₹{parseFloat(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ ...s.td, fontFamily: 'var(--vc-mono)', textAlign: 'right', color: 'var(--vc-muted)' }}>
                                            ₹{parseFloat(entry.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

const s = {
    shell: { minHeight: '100vh', background: 'var(--vc-bg)', fontFamily: 'var(--vc-sans)' },
    topbar: { background: 'var(--vc-surface)', borderBottom: '1px solid var(--vc-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '10px', height: '52px' },
    logoMark: { width: '24px', height: '24px', background: 'var(--vc-gold)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', flexShrink: 0 },
    logoText: { fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', color: 'var(--vc-text)' },
    topbarSection: { fontSize: '12px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    backBtn: { marginLeft: 'auto', background: 'none', border: '1px solid var(--vc-border)', color: 'var(--vc-muted)', cursor: 'pointer', fontSize: '11px', padding: '5px 12px', borderRadius: '4px' },
    main: { padding: '24px' },
    pageHeader: { marginBottom: '20px' },
    pageTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--vc-text)' },
    pageSub: { fontSize: '11px', color: 'var(--vc-muted)', marginTop: '2px', fontFamily: 'var(--vc-mono)' },
    metrics: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
    metricCard: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '14px' },
    metricLabel: { fontSize: '9px', fontWeight: '500', color: 'var(--vc-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' },
    metricVal: { fontSize: '20px', fontWeight: '500', fontFamily: 'var(--vc-mono)' },
    tabRow: { display: 'flex', borderBottom: '1px solid var(--vc-border)', marginBottom: '16px' },
    tab: { padding: '10px 16px', cursor: 'pointer', fontSize: '12px', color: 'var(--vc-muted)', borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px' },
    tabActive: { color: 'var(--vc-gold)', borderBottom: '2px solid var(--vc-gold)' },
    tabBadge: { fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--vc-mono)' },
    card: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '16px' },
    cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--vc-border)' },
    cardTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--vc-text)', letterSpacing: '0.04em' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { fontSize: '9px', fontWeight: '500', color: 'var(--vc-muted)', textAlign: 'left', padding: '0 8px 10px 0', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid var(--vc-border)', fontFamily: 'var(--vc-mono)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    td: { padding: '11px 8px 11px 0', fontSize: '11px', color: 'var(--vc-text)', verticalAlign: 'middle' },
    typeBadge: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' },
    empty: { color: 'var(--vc-muted)', textAlign: 'center', padding: '40px', fontFamily: 'var(--vc-mono)', fontSize: '12px' },
    badgeGold: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(201,168,76,0.15)', color: 'var(--vc-gold)', border: '1px solid rgba(201,168,76,0.3)' },
};