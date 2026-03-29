import { useState } from 'react';
import authService from '../services/authService';

export default function LoginPage({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await authService.register(
                    form.username,
                    form.email,
                    form.password,
                    form.phone
                );
                setIsRegister(false);
                setError('Registered! Ab login karo.');
            } else {
                const data = await authService.login(
                    form.username,
                    form.password
                );
                onLogin(data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kuch galat hua!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>🏦</div>
                <h1 style={styles.title}>VaultCore</h1>
                <p style={styles.subtitle}>Neo-Bank Infrastructure</p>

                <div style={styles.tabs}>
                    <button
                        style={isRegister ? styles.tabInactive : styles.tabActive}
                        onClick={() => setIsRegister(false)}>
                        Login
                    </button>
                    <button
                        style={isRegister ? styles.tabActive : styles.tabInactive}
                        onClick={() => setIsRegister(true)}>
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        style={styles.input}
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    {isRegister && (
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    {isRegister && (
                        <input
                            style={styles.input}
                            type="text"
                            name="phone"
                            placeholder="Phone (optional)"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    )}

                    {error && <p style={styles.error}>{error}</p>}

                    <button
                        style={styles.button}
                        type="submit"
                        disabled={loading}>
                        {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '380px',
        textAlign: 'center'
    },
    logo: { fontSize: '48px', marginBottom: '8px' },
    title: { color: '#fff', fontSize: '28px', margin: '0 0 4px' },
    subtitle: { color: '#888', fontSize: '14px', marginBottom: '24px' },
    tabs: {
        display: 'flex',
        marginBottom: '24px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    tabActive: {
        flex: 1, padding: '10px',
        background: '#6c63ff', color: '#fff',
        border: 'none', cursor: 'pointer', fontSize: '14px'
    },
    tabInactive: {
        flex: 1, padding: '10px',
        background: 'transparent', color: '#888',
        border: 'none', cursor: 'pointer', fontSize: '14px'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.07)',
        color: '#fff', fontSize: '14px', outline: 'none'
    },
    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        background: '#6c63ff',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '8px'
    },
    error: { color: '#ff6b6b', fontSize: '13px', margin: '0' }
};