import { useState, useEffect } from 'react';
import authService from '../services/authService';
import transferService from '../services/transferService';
import SendMoneyPage from './SendMoneyPage';
import PortfolioPage from './PortfolioPage';
import StatementPage from './StatementPage';

export default function DashboardPage({ user, onLogout }) {
    const [balance, setBalance] = useState(null);
    const [showSendMoney, setShowSendMoney] = useState(false);
    const [showPortfolio, setShowPortfolio] = useState(false);
    const [showStatement, setShowStatement] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const data = await transferService.getBalance();
            setBalance(data.balance);
        } catch (err) {
            console.error('Balance fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        onLogout();
    };

    if (showSendMoney) {
        return <SendMoneyPage onBack={() => {
            setShowSendMoney(false);
            fetchBalance();
        }} />;
    }

    if (showPortfolio) {
        return <PortfolioPage onBack={() => setShowPortfolio(false)} />;
    }

    if (showStatement) {
        return <StatementPage onBack={() => setShowStatement(false)} />;
    }

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <div style={styles.navLeft}>
                    <span style={styles.navLogo}>🏦</span>
                    <span style={styles.navTitle}>VaultCore</span>
                </div>
                <div style={styles.navRight}>
                    <span style={styles.navUser}>👤 {user?.username}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div style={styles.content}>
                <h2 style={styles.welcome}>Welcome, {user?.username}! 👋</h2>
                <p style={styles.role}>Role: {user?.role}</p>

                <div style={styles.grid}>
                    <div style={styles.card}>
                        <div style={styles.cardIcon}>💰</div>
                        <div style={styles.cardTitle}>Balance</div>
                        <div style={styles.cardValue}>
                            {loading ? '...' : `₹${parseFloat(balance).toFixed(2)}`}
                        </div>
                        <div style={styles.cardSub}>Available balance</div>
                    </div>

                    <div style={{...styles.card, cursor: 'pointer'}}
                        onClick={() => setShowSendMoney(true)}>
                        <div style={styles.cardIcon}>↑</div>
                        <div style={styles.cardTitle}>Send Money</div>
                        <div style={styles.cardValue}>Transfer</div>
                        <div style={{...styles.cardSub, color: '#6c63ff'}}>Click to send →</div>
                    </div>

                    <div style={{...styles.card, cursor: 'pointer'}}
                        onClick={() => setShowPortfolio(true)}>
                        <div style={styles.cardIcon}>📈</div>
                        <div style={styles.cardTitle}>Portfolio</div>
                        <div style={styles.cardValue}>Stocks</div>
                        <div style={{...styles.cardSub, color: '#6c63ff'}}>Click to trade →</div>
                    </div>

                    <div style={{...styles.card, cursor: 'pointer'}}
                        onClick={() => setShowStatement(true)}>
                        <div style={styles.cardIcon}>📄</div>
                        <div style={styles.cardTitle}>Statements</div>
                        <div style={styles.cardValue}>PDF</div>
                        <div style={{...styles.cardSub, color: '#6c63ff'}}>Click to download →</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#0f0c29', color: '#fff', fontFamily: 'sans-serif' },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    navLogo: { fontSize: '28px' },
    navTitle: { fontSize: '20px', fontWeight: 'bold', color: '#fff' },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    navUser: { color: '#aaa', fontSize: '14px' },
    logoutBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px' },
    content: { padding: '40px 32px' },
    welcome: { fontSize: '28px', margin: '0 0 8px' },
    role: { color: '#888', fontSize: '14px', marginBottom: '32px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', textAlign: 'center' },
    cardIcon: { fontSize: '32px', marginBottom: '12px' },
    cardTitle: { color: '#888', fontSize: '13px', marginBottom: '8px' },
    cardValue: { fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' },
    cardSub: { color: '#555', fontSize: '12px' }
};