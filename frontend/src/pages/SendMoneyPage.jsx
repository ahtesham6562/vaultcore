import { useState } from 'react';
import transferService from '../services/transferService';

export default function SendMoneyPage({ onBack }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        toAccountNo: '',
        amount: '',
        description: ''
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (!form.toAccountNo || !form.amount) {
            setError('Account number aur amount required hai!');
            return;
        }
        if (parseFloat(form.amount) <= 0) {
            setError('Amount 0 se zyada hona chahiye!');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await transferService.sendMoney(
                form.toAccountNo,
                parseFloat(form.amount),
                form.description
            );
            setResult(data);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed!');
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={onBack}>← Back</button>
                    <h2 style={styles.title}>Send Money</h2>
                    <div style={styles.steps}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{
                                ...styles.stepDot,
                                background: step >= s ? '#6c63ff' : 'rgba(255,255,255,0.2)'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Step 1 — Enter Details */}
                {step === 1 && (
                    <div style={styles.body}>
                        <p style={styles.stepLabel}>Step 1 — Enter Details</p>
                        <input
                            style={styles.input}
                            type="text"
                            name="toAccountNo"
                            placeholder="Receiver Account No (e.g. ACC-00482)"
                            value={form.toAccountNo}
                            onChange={handleChange}
                        />
                        <input
                            style={styles.input}
                            type="number"
                            name="amount"
                            placeholder="Amount (₹)"
                            value={form.amount}
                            onChange={handleChange}
                            min="0.01"
                        />
                        <input
                            style={styles.input}
                            type="text"
                            name="description"
                            placeholder="Description (optional)"
                            value={form.description}
                            onChange={handleChange}
                        />
                        {error && <p style={styles.error}>{error}</p>}
                        <button style={styles.btn} onClick={handleNext}>
                            Next →
                        </button>
                    </div>
                )}

                {/* Step 2 — Confirm */}
                {step === 2 && (
                    <div style={styles.body}>
                        <p style={styles.stepLabel}>Step 2 — Confirm Transfer</p>
                        <div style={styles.confirmBox}>
                            <div style={styles.confirmRow}>
                                <span style={styles.confirmLabel}>To Account</span>
                                <span style={styles.confirmValue}>{form.toAccountNo}</span>
                            </div>
                            <div style={styles.confirmRow}>
                                <span style={styles.confirmLabel}>Amount</span>
                                <span style={{...styles.confirmValue, color: '#6c63ff', fontSize: '22px'}}>
                                    ₹{parseFloat(form.amount).toFixed(2)}
                                </span>
                            </div>
                            {form.description && (
                                <div style={styles.confirmRow}>
                                    <span style={styles.confirmLabel}>Note</span>
                                    <span style={styles.confirmValue}>{form.description}</span>
                                </div>
                            )}
                        </div>
                        {error && <p style={styles.error}>{error}</p>}
                        <div style={styles.btnRow}>
                            <button style={styles.btnOutline} onClick={() => setStep(1)}>
                                ← Edit
                            </button>
                            <button style={styles.btn} onClick={handleConfirm} disabled={loading}>
                                {loading ? 'Processing...' : 'Confirm ✓'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3 — Success */}
                {step === 3 && result && (
                    <div style={styles.body}>
                        <div style={styles.successIcon}>✓</div>
                        <p style={styles.successTitle}>Transfer Successful!</p>
                        <div style={styles.confirmBox}>
                            <div style={styles.confirmRow}>
                                <span style={styles.confirmLabel}>Tx Ref</span>
                                <span style={{...styles.confirmValue, fontSize: '11px'}}>{result.txRef}</span>
                            </div>
                            <div style={styles.confirmRow}>
                                <span style={styles.confirmLabel}>Amount</span>
                                <span style={styles.confirmValue}>₹{result.amount}</span>
                            </div>
                            <div style={styles.confirmRow}>
                                <span style={styles.confirmLabel}>Status</span>
                                <span style={{...styles.confirmValue, color: '#4caf50'}}>{result.status}</span>
                            </div>
                            {result.fraudFlagged && (
                                <div style={styles.confirmRow}>
                                    <span style={styles.confirmLabel}>⚠️ Fraud Flag</span>
                                    <span style={{...styles.confirmValue, color: '#ff6b6b'}}>2FA Required</span>
                                </div>
                            )}
                        </div>
                        <button style={styles.btn} onClick={onBack}>
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif'
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', width: '420px', overflow: 'hidden'
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    backBtn: {
        background: 'none', border: 'none', color: '#888',
        cursor: 'pointer', fontSize: '14px'
    },
    title: { color: '#fff', fontSize: '18px', margin: 0 },
    steps: { display: 'flex', gap: '6px' },
    stepDot: { width: '8px', height: '8px', borderRadius: '50%', transition: 'background .3s' },
    body: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' },
    stepLabel: { color: '#888', fontSize: '13px', margin: 0 },
    input: {
        padding: '12px 16px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.07)',
        color: '#fff', fontSize: '14px', outline: 'none'
    },
    btn: {
        padding: '12px', borderRadius: '8px', border: 'none',
        background: '#6c63ff', color: '#fff', fontSize: '15px',
        cursor: 'pointer', fontWeight: 'bold'
    },
    btnOutline: {
        padding: '12px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'transparent', color: '#fff',
        fontSize: '15px', cursor: 'pointer', flex: 1
    },
    btnRow: { display: 'flex', gap: '10px' },
    error: { color: '#ff6b6b', fontSize: '13px', margin: 0 },
    confirmBox: {
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px'
    },
    confirmRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    confirmLabel: { color: '#888', fontSize: '13px' },
    confirmValue: { color: '#fff', fontSize: '15px', fontWeight: 'bold' },
    successIcon: {
        width: '60px', height: '60px', borderRadius: '50%',
        background: '#4caf50', color: '#fff', fontSize: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto'
    },
    successTitle: { color: '#fff', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', margin: 0 }
};