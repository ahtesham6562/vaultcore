import { useState, useEffect } from 'react';
import authService from '../services/authService';
import transferService from '../services/transferService';
import SendMoneyPage from './SendMoneyPage';
import PortfolioPage from './PortfolioPage';
import StatementPage from './StatementPage';
import TransactionPage from './TransactionPage';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
};

export default function DashboardPage({ user, onLogout }) {
    const [balance, setBalance] = useState(null);
    const [activePage, setActivePage] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => { fetchBalance(); }, []);

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

    const handleLogout = () => { authService.logout(); onLogout(); };

    const navigate = (page) => {
        setActivePage(page);
        setSidebarOpen(false);
    };

    if (activePage === 'transfer') return <SendMoneyPage onBack={() => { setActivePage('dashboard'); fetchBalance(); }} />;
    if (activePage === 'portfolio') return <PortfolioPage onBack={() => setActivePage('dashboard')} />;
    if (activePage === 'statement') return <StatementPage onBack={() => setActivePage('dashboard')} />;
    if (activePage === 'ledger') return <TransactionPage onBack={() => setActivePage('dashboard')} />;

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: '▦' },
        { id: 'transfer', label: 'Transfer', icon: '↑' },
        { id: 'portfolio', label: 'Portfolio', icon: '◈' },
        { id: 'ledger', label: 'Ledger', icon: '▤' },
        { id: 'statement', label: 'Statement', icon: '≡' },
    ];

    const Sidebar = () => (
        <div style={{ ...s.sidebar, ...(isMobile ? s.sidebarMobile : {}), ...(isMobile && sidebarOpen ? s.sidebarMobileOpen : {}) }}>
            <div style={s.navLabel}>NAVIGATION</div>
            {navItems.map(item => (
                <div key={item.id}
                    style={{ ...s.navItem, ...(activePage === item.id ? s.navActive : {}) }}
                    onClick={() => navigate(item.id)}>
                    <span>{item.icon}</span>
                    {item.label}
                </div>
            ))}
            <div style={{ ...s.navLabel, marginTop: '20px' }}>SYSTEM</div>
            {[
                { icon: '◎', label: 'Virtual Threads', badge: 'ON' },
                { icon: '⊙', label: 'Fraud Guard', badge: 'ON' },
                { icon: '✦', label: 'Audit Log', badge: 'AOP' },
                { icon: '⛨', label: 'OWASP ZAP', badge: 'CLEAR' },
            ].map(item => (
                <div key={item.label} style={s.navItem}>
                    <span>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={s.navBadge}>{item.badge}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ ...s.shell, gridTemplateColumns: isMobile ? '1fr' : '200px 1fr' }}>
            {/* Topbar */}
            <div style={{ ...s.topbar, gridColumn: '1 / -1' }}>
                {isMobile && (
                    <button style={s.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                )}
                <div style={s.logoMark} />
                <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                <div style={s.topbarRight}>
                    <div style={s.statusPill}>
                        <div style={s.pulse} />
                        {!isMobile && 'LIVE'}
                    </div>
                    <div style={s.userChip}>{user?.username?.charAt(0).toUpperCase()}</div>
                    {!isMobile && <span style={s.userName}>{user?.username}</span>}
                    <button style={s.logoutBtn} onClick={handleLogout}>
                        {isMobile ? '↩' : 'Sign out'}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            {!isMobile ? <Sidebar /> : <Sidebar />}

            {/* Main */}
            <div style={s.main}>
                <div style={s.pageHeader}>
                    <div style={s.pageTitle}>Overview</div>
                    <div style={s.pageSub}>
                        Account summary · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                </div>

                {/* Metrics */}
                <div style={{ ...s.metrics, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
                    {[
                        { label: 'BALANCE', value: loading ? '—' : `₹${parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--vc-gold)', sub: '↑ Active', subColor: 'var(--vc-teal)' },
                        { label: 'ACCOUNT', value: user?.username, color: 'var(--vc-text)', sub: user?.role || 'USER', subColor: 'var(--vc-muted)' },
                        { label: 'FRAUD LIMIT', value: '₹50,000', color: 'var(--vc-red)', sub: '2FA above limit', subColor: 'var(--vc-muted)' },
                        { label: 'SECURITY', value: 'CLEAR', color: 'var(--vc-teal)', sub: '0 vulnerabilities', subColor: 'var(--vc-muted)' },
                    ].map(m => (
                        <div key={m.label} style={s.metricCard}>
                            <div style={s.metricLabel}>{m.label}</div>
                            <div style={{ ...s.metricVal, color: m.color, fontSize: isMobile ? '16px' : '20px' }}>{m.value}</div>
                            <div style={{ ...s.metricChange, color: m.subColor }}>{m.sub}</div>
                        </div>
                    ))}
                </div>

                <div style={{ ...s.twoCol, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                    {/* Quick Actions */}
                    <div style={s.card}>
                        <div style={s.cardHead}>
                            <div style={s.cardTitle}>Quick Actions</div>
                            <span style={s.badgeBlue}>INSTANT</span>
                        </div>
                        {[
                            { label: 'Send Money', sub: 'SERIALIZABLE TX', page: 'transfer', color: 'var(--vc-gold)' },
                            { label: 'Trade Stocks', sub: 'LIVE PRICES', page: 'portfolio', color: 'var(--vc-teal)' },
                            { label: 'Transaction Ledger', sub: 'DOUBLE-ENTRY', page: 'ledger', color: 'var(--vc-blue)' },
                            { label: 'Download Statement', sub: 'PDF · iText 8', page: 'statement', color: 'var(--vc-muted)' },
                        ].map(a => (
                            <div key={a.page} style={s.actionRow} onClick={() => navigate(a.page)}>
                                <div style={{ ...s.actionDot, background: a.color }} />
                                <div style={{ flex: 1 }}>
                                    <div style={s.actionLabel}>{a.label}</div>
                                    <div style={s.actionSub}>{a.sub}</div>
                                </div>
                                <span style={{ color: 'var(--vc-muted)' }}>→</span>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack */}
                    <div style={s.card}>
                        <div style={s.cardHead}>
                            <div style={s.cardTitle}>Tech Stack</div>
                            <span style={s.badgeTeal}>PRODUCTION</span>
                        </div>
                        {[
                            ['Spring Boot 3.x', 'Backend Framework'],
                            ['PostgreSQL + Flyway', 'Immutable Ledger'],
                            ['JWT + Spring Security', 'Auth Layer'],
                            ['AspectJ AOP', 'Audit & Fraud'],
                            ['Java 21 Loom', 'Virtual Threads'],
                            ['iText 8', 'PDF Generation'],
                        ].map(([name, desc]) => (
                            <div key={name} style={s.stackRow}>
                                <div style={s.stackDot} />
                                <div>
                                    <div style={s.stackName}>{name}</div>
                                    <div style={s.stackDesc}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const s = {
    shell: { minHeight: '100vh', display: 'grid', gridTemplateColumns: '200px 1fr', gridTemplateRows: '52px 1fr', fontFamily: 'var(--vc-sans)', background: 'var(--vc-bg)' },
    topbar: { background: 'var(--vc-surface)', borderBottom: '1px solid var(--vc-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', position: 'sticky', top: 0, zIndex: 100 },
    hamburger: { background: 'none', border: 'none', color: 'var(--vc-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' },
    logoMark: { width: '24px', height: '24px', background: 'var(--vc-gold)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', flexShrink: 0 },
    logoText: { fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', color: 'var(--vc-text)' },
    topbarRight: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' },
    statusPill: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(29,232,181,0.08)', border: '1px solid rgba(29,232,181,0.2)', borderRadius: '20px', padding: '4px 10px', fontSize: '10px', color: 'var(--vc-teal)', fontFamily: 'var(--vc-mono)' },
    pulse: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--vc-teal)', animation: 'pulse 2s ease-in-out infinite' },
    userChip: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--vc-gold), #8b5e10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: '#1a0e00' },
    userName: { fontSize: '12px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    logoutBtn: { padding: '5px 12px', borderRadius: '4px', border: '1px solid var(--vc-border2)', background: 'transparent', color: 'var(--vc-muted)', fontSize: '11px', cursor: 'pointer' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 98 },
    sidebar: { background: 'var(--vc-surface)', borderRight: '1px solid var(--vc-border)', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '2px' },
    sidebarMobile: { position: 'fixed', top: '52px', left: 0, bottom: 0, width: '200px', zIndex: 99, transform: 'translateX(-100%)', transition: 'transform 0.25s ease' },
    sidebarMobileOpen: { transform: 'translateX(0)' },
    navLabel: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.12em', color: 'var(--vc-muted)', padding: '8px 16px 4px', textTransform: 'uppercase' },
    navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', color: 'var(--vc-muted)', borderLeft: '2px solid transparent', transition: 'all 0.15s' },
    navActive: { background: 'rgba(201,168,76,0.08)', color: 'var(--vc-gold)', borderLeft: '2px solid var(--vc-gold)' },
    navBadge: { marginLeft: 'auto', fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '2px 6px', borderRadius: '3px', background: 'rgba(29,232,181,0.1)', color: 'var(--vc-teal)', border: '1px solid rgba(29,232,181,0.2)' },
    main: { background: 'var(--vc-bg)', padding: '20px', overflowY: 'auto' },
    pageHeader: { marginBottom: '20px' },
    pageTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--vc-text)' },
    pageSub: { fontSize: '11px', color: 'var(--vc-muted)', marginTop: '2px', fontFamily: 'var(--vc-mono)' },
    metrics: { display: 'grid', gap: '12px', marginBottom: '20px' },
    metricCard: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '14px' },
    metricLabel: { fontSize: '9px', fontWeight: '500', color: 'var(--vc-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' },
    metricVal: { fontWeight: '500', fontFamily: 'var(--vc-mono)', marginBottom: '4px' },
    metricChange: { fontSize: '10px', fontFamily: 'var(--vc-mono)' },
    twoCol: { display: 'grid', gap: '12px' },
    card: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
    cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--vc-border)' },
    cardTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--vc-text)', letterSpacing: '0.04em' },
    badgeBlue: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(77,159,255,0.1)', color: 'var(--vc-blue)', border: '1px solid rgba(77,159,255,0.25)' },
    badgeTeal: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(29,232,181,0.1)', color: 'var(--vc-teal)', border: '1px solid rgba(29,232,181,0.25)' },
    actionRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--vc-border)', cursor: 'pointer' },
    actionDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
    actionLabel: { fontSize: '12px', color: 'var(--vc-text)', marginBottom: '2px' },
    actionSub: { fontSize: '10px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    stackRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    stackDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--vc-border2)', marginTop: '4px', flexShrink: 0 },
    stackName: { fontSize: '12px', color: 'var(--vc-text)', marginBottom: '2px' },
    stackDesc: { fontSize: '10px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
};