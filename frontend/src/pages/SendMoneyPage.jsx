import { useState } from 'react';
import transferService from '../services/transferService';

export default function SendMoneyPage({ onBack }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ toAccountNo: '', amount: '', description: '' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleNext = () => {
        if (!form.toAccountNo || !form.amount) { setError('Account number and amount are required.'); return; }
        if (parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0.'); return; }
        setError(''); setStep(2);
    };

    const handleConfirm = async () => {
        setLoading(true); setError('');
        try {
            const data = await transferService.sendMoney(form.toAccountNo, parseFloat(form.amount), form.description);
            setResult(data); setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed.'); setStep(1);
        } finally { setLoading(false); }
    };

    return (
        <div style={s.shell}>
            {/* Topbar */}
            <div style={s.topbar}>
                <div style={s.logoMark} />
                <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                <button style={s.backBtn} onClick={onBack}>← Back to Dashboard</button>
            </div>

            <div style={s.main}>
                <div style={s.pageHeader}>
                    <div style={s.pageTitle}>Transfer Funds</div>
                    <div style={s.pageSub}>Serializable isolation · Double-entry ledger · Fraud detection active</div>
                </div>

                {/* Step Indicator */}
                <div style={s.stepRow}>
                    {['Enter Details', 'Confirm', 'Receipt'].map((label, i) => (
                        <div key={i} style={s.stepItem}>
                            <div style={{ ...s.stepDot, background: step > i + 1 ? 'var(--vc-teal)' : step === i + 1 ? 'var(--vc-gold)' : 'var(--vc-border2)', color: step >= i + 1 ? '#1a0e00' : 'var(--vc-muted)' }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <div style={{ ...s.stepLabel, color: step === i + 1 ? 'var(--vc-text)' : 'var(--vc-muted)' }}>{label}</div>
                            {i < 2 && <div style={{ ...s.stepLine, background: step > i + 1 ? 'var(--vc-teal)' : 'var(--vc-border)' }} />}
                        </div>
                    ))}
                </div>

                <div style={s.formWrap}>
                    {/* Step 1 */}
                    {step === 1 && (
                        <div style={s.card}>
                            <div style={s.cardHead}>
                                <div style={s.cardTitle}>Transaction Details</div>
                                <span style={s.badgeGold}>STEP 1</span>
                            </div>
                            <div style={s.fields}>
                                <div style={s.field}>
                                    <label style={s.label}>RECIPIENT ACCOUNT</label>
                                    <input style={s.input} type="text" name="toAccountNo"
                                        placeholder="ACC-00000" value={form.toAccountNo}
                                        onChange={handleChange} />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>AMOUNT (INR)</label>
                                    <input style={s.input} type="number" name="amount"
                                        placeholder="0.00" value={form.amount}
                                        onChange={handleChange} min="0.01" />
                                    {form.amount && parseFloat(form.amount) > 50000 && (
                                        <div style={s.warnBox}>⚠ Amount exceeds ₹50,000 — 2FA verification will be triggered</div>
                                    )}
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>DESCRIPTION (OPTIONAL)</label>
                                    <input style={s.input} type="text" name="description"
                                        placeholder="Payment reference" value={form.description}
                                        onChange={handleChange} />
                                </div>
                            </div>
                            {error && <div style={s.errorBox}>{error}</div>}
                            <button style={s.btn} onClick={handleNext}>Continue →</button>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div style={s.card}>
                            <div style={s.cardHead}>
                                <div style={s.cardTitle}>Confirm Transfer</div>
                                <span style={s.badgeGold}>STEP 2</span>
                            </div>
                            <div style={s.confirmGrid}>
                                {[
                                    ['TO ACCOUNT', form.toAccountNo],
                                    ['AMOUNT', `₹${parseFloat(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                                    ['DESCRIPTION', form.description || '—'],
                                    ['ISOLATION LEVEL', 'SERIALIZABLE'],
                                    ['FRAUD CHECK', parseFloat(form.amount) > 50000 ? '2FA REQUIRED' : 'PASS'],
                                ].map(([k, v]) => (
                                    <div key={k} style={s.confirmRow}>
                                        <span style={s.confirmKey}>{k}</span>
                                        <span style={{ ...s.confirmVal, color: k === 'AMOUNT' ? 'var(--vc-gold)' : k === 'FRAUD CHECK' && v === '2FA REQUIRED' ? 'var(--vc-red)' : k === 'FRAUD CHECK' ? 'var(--vc-teal)' : 'var(--vc-text)' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            {error && <div style={s.errorBox}>{error}</div>}
                            <div style={s.btnRow}>
                                <button style={s.btnOutline} onClick={() => setStep(1)}>← Edit</button>
                                <button style={s.btn} onClick={handleConfirm} disabled={loading}>
                                    {loading ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && result && (
                        <div style={s.card}>
                            <div style={s.cardHead}>
                                <div style={s.cardTitle}>{result.fraudFlagged ? 'Transaction Flagged' : 'Transfer Complete'}</div>
                                <span style={result.fraudFlagged ? s.badgeRed : s.badgeTeal}>
                                    {result.fraudFlagged ? 'PENDING 2FA' : 'COMMITTED'}
                                </span>
                            </div>

                            {result.fraudFlagged ? (
                                <div style={s.fraudAlert}>
                                    <div style={s.fraudAlertHead}>
                                        <div style={s.fraudPulse} />
                                        <div style={s.fraudTitle}>ALERT — Transaction held for verification</div>
                                    </div>
                                    <div style={s.fraudBody}>
                                        Amount ₹{result.amount} exceeds fraud threshold ₹50,000 · 2FA verification required · Transaction ref: {result.txRef}
                                    </div>
                                </div>
                            ) : (
                                <div style={s.successBox}>
                                    <div style={s.successIcon}>✓</div>
                                    <div style={s.successText}>Transaction committed to ledger</div>
                                </div>
                            )}

                            <div style={s.confirmGrid}>
                                {[
                                    ['TX REFERENCE', result.txRef],
                                    ['AMOUNT', `₹${result.amount}`],
                                    ['FROM', result.fromAccount],
                                    ['TO', result.toAccount],
                                    ['STATUS', result.status],
                                ].map(([k, v]) => (
                                    <div key={k} style={s.confirmRow}>
                                        <span style={s.confirmKey}>{k}</span>
                                        <span style={{ ...s.confirmVal, fontFamily: 'var(--vc-mono)', fontSize: '11px' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <button style={s.btn} onClick={onBack}>Back to Dashboard</button>
                        </div>
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
    backBtn: { marginLeft: 'auto', background: 'none', border: '1px solid var(--vc-border)', color: 'var(--vc-muted)', cursor: 'pointer', fontSize: '11px', padding: '5px 12px', borderRadius: '4px' },
    main: { padding: '24px', maxWidth: '600px', margin: '0 auto' },
    pageHeader: { marginBottom: '24px' },
    pageTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--vc-text)' },
    pageSub: { fontSize: '11px', color: 'var(--vc-muted)', marginTop: '2px', fontFamily: 'var(--vc-mono)' },
    stepRow: { display: 'flex', alignItems: 'center', marginBottom: '24px' },
    stepItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    stepDot: { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', fontFamily: 'var(--vc-mono)', flexShrink: 0 },
    stepLabel: { fontSize: '11px', fontFamily: 'var(--vc-mono)', whiteSpace: 'nowrap' },
    stepLine: { width: '40px', height: '1px', marginLeft: '8px' },
    formWrap: {},
    card: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '20px' },
    cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--vc-border)' },
    cardTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--vc-text)', letterSpacing: '0.04em' },
    fields: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--vc-border)', background: 'var(--vc-surface2)', color: 'var(--vc-text)', fontSize: '13px', outline: 'none' },
    warnBox: { padding: '8px 12px', borderRadius: '4px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.25)', color: 'var(--vc-red)', fontSize: '11px', fontFamily: 'var(--vc-mono)' },
    errorBox: { padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.25)', color: 'var(--vc-red)', fontSize: '12px', fontFamily: 'var(--vc-mono)', marginBottom: '16px' },
    btn: { width: '100%', padding: '11px', borderRadius: '6px', border: 'none', background: 'var(--vc-gold)', color: '#1a0e00', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    btnOutline: { flex: 1, padding: '11px', borderRadius: '6px', border: '1px solid var(--vc-border2)', background: 'transparent', color: 'var(--vc-muted)', fontSize: '13px', cursor: 'pointer' },
    btnRow: { display: 'flex', gap: '10px' },
    confirmGrid: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '20px' },
    confirmRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    confirmKey: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    confirmVal: { fontSize: '13px', color: 'var(--vc-text)', fontWeight: '500' },
    fraudAlert: { background: 'rgba(255,77,106,0.05)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: '6px', padding: '14px', marginBottom: '16px' },
    fraudAlertHead: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
    fraudPulse: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--vc-red)', flexShrink: 0 },
    fraudTitle: { fontSize: '12px', color: 'var(--vc-red)', fontWeight: '500' },
    fraudBody: { fontSize: '11px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)', lineHeight: '1.6' },
    successBox: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(29,232,181,0.05)', border: '1px solid rgba(29,232,181,0.2)', borderRadius: '6px', padding: '14px', marginBottom: '16px' },
    successIcon: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--vc-teal)', color: '#0a0d12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 },
    successText: { fontSize: '12px', color: 'var(--vc-teal)', fontFamily: 'var(--vc-mono)' },
    badgeGold: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(201,168,76,0.15)', color: 'var(--vc-gold)', border: '1px solid rgba(201,168,76,0.3)' },
    badgeTeal: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(29,232,181,0.1)', color: 'var(--vc-teal)', border: '1px solid rgba(29,232,181,0.25)' },
    badgeRed: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,77,106,0.1)', color: 'var(--vc-red)', border: '1px solid rgba(255,77,106,0.25)' },
};