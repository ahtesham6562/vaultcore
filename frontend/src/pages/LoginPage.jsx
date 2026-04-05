import { useState } from 'react';
import authService from '../services/authService';

export default function LoginPage({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await authService.register(form.username, form.email, form.password, form.phone);
                setIsRegister(false);
                setError('✓ Registered successfully. Please login.');
            } else {
                const data = await authService.login(form.username, form.password);
                onLogin(data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div style={s.container}>
            {/* Left Panel - hide on mobile */}
            {!isMobile && (
                <div style={s.left}>
                    <div style={s.brand}>
                        <div style={s.logoMark} />
                        <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                    </div>
                    <div style={s.heroTitle}>Neo-Banking<br />Infrastructure</div>
                    <div style={s.heroSub}>Double-entry ledger · JWT auth<br />Real-time stocks · Fraud detection</div>
                    <div style={s.pills}>
                        {['SERIALIZABLE TX', 'VIRTUAL THREADS', 'ASPECTJ AOP', 'OWASP CLEAR'].map(p => (
                            <div key={p} style={s.pill}>{p}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Right Panel */}
            <div style={{ ...s.right, width: isMobile ? '100%' : '420px', padding: isMobile ? '24px' : '40px' }}>
                {isMobile && (
                    <div style={{ ...s.brand, marginBottom: '32px' }}>
                        <div style={s.logoMark} />
                        <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                    </div>
                )}
                <div style={s.card}>
                    <div style={s.cardTitle}>{isRegister ? 'Create Account' : 'Sign In'}</div>
                    <div style={s.cardSub}>{isRegister ? 'Join VaultCore platform' : 'Welcome back'}</div>

                    <div style={s.tabs}>
                        <button style={!isRegister ? s.tabActive : s.tabInactive} onClick={() => setIsRegister(false)}>Login</button>
                        <button style={isRegister ? s.tabActive : s.tabInactive} onClick={() => setIsRegister(true)}>Register</button>
                    </div>

                    <form onSubmit={handleSubmit} style={s.form}>
                        <div style={s.field}>
                            <label style={s.label}>USERNAME</label>
                            <input style={s.input} type="text" name="username"
                                placeholder="Enter username" value={form.username}
                                onChange={handleChange} required />
                        </div>
                        {isRegister && (
                            <div style={s.field}>
                                <label style={s.label}>EMAIL</label>
                                <input style={s.input} type="email" name="email"
                                    placeholder="Enter email" value={form.email}
                                    onChange={handleChange} required />
                            </div>
                        )}
                        <div style={s.field}>
                            <label style={s.label}>PASSWORD</label>
                            <input style={s.input} type="password" name="password"
                                placeholder="Enter password" value={form.password}
                                onChange={handleChange} required />
                        </div>
                        {isRegister && (
                            <div style={s.field}>
                                <label style={s.label}>PHONE (OPTIONAL)</label>
                                <input style={s.input} type="text" name="phone"
                                    placeholder="+91 00000 00000" value={form.phone}
                                    onChange={handleChange} />
                            </div>
                        )}
                        {error && (
                            <div style={{ ...s.errorBox, color: error.startsWith('✓') ? 'var(--vc-teal)' : 'var(--vc-red)', borderColor: error.startsWith('✓') ? 'rgba(29,232,181,0.3)' : 'rgba(255,77,106,0.3)', background: error.startsWith('✓') ? 'rgba(29,232,181,0.08)' : 'rgba(255,77,106,0.08)' }}>
                                {error}
                            </div>
                        )}
                        <button style={s.btn} type="submit" disabled={loading}>
                            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', display: 'flex', background: 'var(--vc-bg)', fontFamily: 'var(--vc-sans)' },
    left: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', borderRight: '1px solid var(--vc-border)' },
    brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' },
    logoMark: { width: '28px', height: '28px', background: 'var(--vc-gold)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' },
    logoText: { fontSize: '16px', fontWeight: '600', letterSpacing: '0.05em', color: 'var(--vc-text)' },
    heroTitle: { fontSize: '36px', fontWeight: '300', lineHeight: '1.3', color: 'var(--vc-text)', marginBottom: '16px' },
    heroSub: { fontSize: '13px', color: 'var(--vc-muted)', lineHeight: '1.8', fontFamily: 'var(--vc-mono)', marginBottom: '40px' },
    pills: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    pill: { padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--vc-mono)', letterSpacing: '0.06em', background: 'rgba(201,168,76,0.1)', color: 'var(--vc-gold)', border: '1px solid rgba(201,168,76,0.25)' },
    right: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    card: { width: '100%' },
    cardTitle: { fontSize: '20px', fontWeight: '500', color: 'var(--vc-text)', marginBottom: '4px' },
    cardSub: { fontSize: '12px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)', marginBottom: '28px' },
    tabs: { display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--vc-surface)', borderRadius: '6px', padding: '4px', border: '1px solid var(--vc-border)' },
    tabActive: { flex: 1, padding: '8px', borderRadius: '4px', background: 'var(--vc-surface2)', border: '1px solid var(--vc-border2)', color: 'var(--vc-text)', fontSize: '12px', cursor: 'pointer' },
    tabInactive: { flex: 1, padding: '8px', borderRadius: '4px', background: 'transparent', border: '1px solid transparent', color: 'var(--vc-muted)', fontSize: '12px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--vc-border)', background: 'var(--vc-surface)', color: 'var(--vc-text)', fontSize: '13px', outline: 'none' },
    errorBox: { padding: '10px 14px', borderRadius: '6px', border: '1px solid', fontSize: '12px', fontFamily: 'var(--vc-mono)' },
    btn: { padding: '11px', borderRadius: '6px', border: 'none', background: 'var(--vc-gold)', color: '#1a0e00', fontSize: '13px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.02em' },
};