import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import stockService from '../services/stockService';

const COLORS = ['#c9a84c', '#1de8b5', '#ff4d6a', '#4d9fff', '#e8c87a', '#ab47bc', '#26a69a', '#ef5350'];

export default function PortfolioPage({ onBack }) {
    const [prices, setPrices] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buyForm, setBuyForm] = useState({ symbol: '', quantity: '' });
    const [sellForm, setSellForm] = useState({ symbol: '', quantity: '' });
    const [buyMsg, setBuyMsg] = useState('');
    const [sellMsg, setSellMsg] = useState('');
    const [activeTab, setActiveTab] = useState('market');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchPrices, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        await Promise.all([fetchPrices(), fetchPortfolio()]);
        setLoading(false);
    };

    const fetchPrices = async () => {
        try { setPrices(await stockService.getAllPrices()); } catch (err) { console.error(err); }
    };

    const fetchPortfolio = async () => {
        try { setPortfolio(await stockService.getPortfolio()); } catch (err) { console.error(err); }
    };

    const handleBuy = async () => {
        if (!buyForm.symbol || !buyForm.quantity) { setBuyMsg('Symbol and quantity required.'); return; }
        try {
            const data = await stockService.buyStock(buyForm.symbol, parseInt(buyForm.quantity));
            setBuyMsg(`✓ ${data.message} — ₹${data.totalCost} deducted`);
            setBuyForm({ symbol: '', quantity: '' });
            fetchPortfolio();
        } catch (err) { setBuyMsg(err.response?.data?.message || 'Purchase failed.'); }
    };

    const handleSell = async () => {
        if (!sellForm.symbol || !sellForm.quantity) { setSellMsg('Symbol and quantity required.'); return; }
        try {
            const data = await stockService.sellStock(sellForm.symbol, parseInt(sellForm.quantity));
            setSellMsg(`✓ ${data.message} — ₹${data.totalEarned} credited`);
            setSellForm({ symbol: '', quantity: '' });
            fetchPortfolio();
        } catch (err) { setSellMsg(err.response?.data?.message || 'Sale failed.'); }
    };

    const totalInvested = portfolio.reduce((sum, h) => sum + parseFloat(h.invested), 0);
    const totalValue = portfolio.reduce((sum, h) => sum + parseFloat(h.currentValue), 0);
    const totalPnl = totalValue - totalInvested;

    const tabs = [
        { id: 'market', label: 'Market', badge: 'LIVE' },
        { id: 'portfolio', label: 'Holdings', badge: `${portfolio.length}` },
        { id: 'buy', label: 'Buy', badge: null },
        { id: 'sell', label: 'Sell', badge: null },
    ];

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--vc-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)', fontSize: '12px' }}>Loading market data...</div>
        </div>
    );

    return (
        <div style={s.shell}>
            {/* Topbar */}
            <div style={s.topbar}>
                <div style={s.logoMark} />
                <span style={s.logoText}>Vault<span style={{ color: 'var(--vc-gold)' }}>Core</span></span>
                <span style={s.topbarSection}>/ Portfolio</span>
                <div style={s.statusPill}>
                    <div style={s.pulse} />
                    LIVE · 5s refresh
                </div>
                <button style={s.backBtn} onClick={onBack}>← Dashboard</button>
            </div>

            <div style={s.main}>
                <div style={s.pageHeader}>
                    <div style={s.pageTitle}>Stock Portfolio</div>
                    <div style={s.pageSub}>Mock API · 8 symbols · ±2% price fluctuation · Real-time updates</div>
                </div>

                {/* Metrics */}
                {portfolio.length > 0 && (
                    <div style={s.metrics}>
                        {[
                            { label: 'TOTAL INVESTED', value: `₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--vc-text)' },
                            { label: 'CURRENT VALUE', value: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--vc-gold)' },
                            { label: 'P&L', value: `${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: totalPnl >= 0 ? 'var(--vc-teal)' : 'var(--vc-red)' },
                            { label: 'HOLDINGS', value: `${portfolio.length} stocks`, color: 'var(--vc-blue)' },
                        ].map(m => (
                            <div key={m.label} style={s.metricCard}>
                                <div style={s.metricLabel}>{m.label}</div>
                                <div style={{ ...s.metricVal, color: m.color }}>{m.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div style={s.tabRow}>
                    {tabs.map(t => (
                        <div key={t.id} style={{ ...s.tab, ...(activeTab === t.id ? s.tabActive : {}) }}
                            onClick={() => setActiveTab(t.id)}>
                            {t.label}
                            {t.badge && <span style={{ ...s.tabBadge, background: activeTab === t.id ? 'rgba(201,168,76,0.2)' : 'var(--vc-surface2)', color: activeTab === t.id ? 'var(--vc-gold)' : 'var(--vc-muted)' }}>{t.badge}</span>}
                        </div>
                    ))}
                </div>

                {/* Market Tab */}
                {activeTab === 'market' && (
                    <div style={s.content}>
                        <div style={s.card}>
                            <div style={s.cardHead}>
                                <div style={s.cardTitle}>Live Prices — INR</div>
                                <span style={s.badgeTeal}>MOCK API</span>
                            </div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={prices} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="symbol" stroke="var(--vc-muted)" fontSize={10} tick={{ fontFamily: 'var(--vc-mono)' }} />
                                    <YAxis stroke="var(--vc-muted)" fontSize={10} tick={{ fontFamily: 'var(--vc-mono)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--vc-surface2)', border: '1px solid var(--vc-border2)', color: 'var(--vc-text)', fontFamily: 'var(--vc-mono)', fontSize: '11px' }} formatter={(val) => [`₹${val}`, 'Price']} />
                                    <Bar dataKey="price" fill="var(--vc-gold)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={s.priceGrid}>
                            {prices.map((stock, i) => (
                                <div key={stock.symbol} style={s.priceCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={s.symbol}>{stock.symbol}</div>
                                        <div style={{ ...s.latency, color: stock.latencyMs < 10 ? 'var(--vc-teal)' : 'var(--vc-gold)' }}>{stock.latencyMs}ms</div>
                                    </div>
                                    <div style={s.price}>₹{parseFloat(stock.price).toLocaleString('en-IN')}</div>
                                    <div style={{ height: '3px', background: 'var(--vc-border)', borderRadius: '2px', marginTop: '8px' }}>
                                        <div style={{ height: '100%', width: `${(i + 1) * 12}%`, background: COLORS[i % COLORS.length], borderRadius: '2px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                    <div style={s.content}>
                        {portfolio.length === 0 ? (
                            <div style={s.empty}>No holdings yet — use the Buy tab to get started.</div>
                        ) : (
                            <div style={s.twoCol}>
                                <div style={s.card}>
                                    <div style={s.cardHead}>
                                        <div style={s.cardTitle}>Allocation</div>
                                        <span style={s.badgeBlue}>PIE CHART</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={portfolio} dataKey="currentValue" nameKey="symbol" cx="50%" cy="50%" outerRadius={70}>
                                                {portfolio.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: 'var(--vc-surface2)', border: '1px solid var(--vc-border2)', color: 'var(--vc-text)', fontFamily: 'var(--vc-mono)', fontSize: '11px' }} formatter={(val) => [`₹${val}`, 'Value']} />
                                            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--vc-mono)', color: 'var(--vc-muted)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={s.card}>
                                    <div style={s.cardHead}>
                                        <div style={s.cardTitle}>Holdings</div>
                                        <span style={s.badgeGold}>{portfolio.length} STOCKS</span>
                                    </div>
                                    {portfolio.map((h, i) => (
                                        <div key={h.symbol} style={s.holdingRow}>
                                            <div style={{ ...s.holdingDot, background: COLORS[i % COLORS.length] }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={s.holdingSymbol}>{h.symbol}</div>
                                                <div style={s.holdingDetail}>{h.quantity} shares · avg ₹{h.avgCost}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={s.holdingValue}>₹{parseFloat(h.currentValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                                <div style={{ fontSize: '10px', fontFamily: 'var(--vc-mono)', color: parseFloat(h.pnl) >= 0 ? 'var(--vc-teal)' : 'var(--vc-red)' }}>
                                                    {parseFloat(h.pnl) >= 0 ? '+' : ''}₹{parseFloat(h.pnl).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Buy Tab */}
                {activeTab === 'buy' && (
                    <div style={s.content}>
                        <div style={{ ...s.card, maxWidth: '420px' }}>
                            <div style={s.cardHead}>
                                <div style={s.cardTitle}>Buy Stock</div>
                                <span style={s.badgeTeal}>MARKET ORDER</span>
                            </div>
                            <div style={s.fields}>
                                <div style={s.field}>
                                    <label style={s.label}>SYMBOL</label>
                                    <select style={s.input} value={buyForm.symbol}
                                        onChange={e => setBuyForm({ ...buyForm, symbol: e.target.value })}>
                                        <option value="">Select symbol</option>
                                        {prices.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol} — ₹{p.price}</option>)}
                                    </select>
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>QUANTITY</label>
                                    <input style={s.input} type="number" placeholder="0" min="1"
                                        value={buyForm.quantity}
                                        onChange={e => setBuyForm({ ...buyForm, quantity: e.target.value })} />
                                </div>
                                {buyForm.symbol && buyForm.quantity && (
                                    <div style={s.estimateBox}>
                                        <span style={s.label}>ESTIMATED COST</span>
                                        <span style={{ color: 'var(--vc-gold)', fontFamily: 'var(--vc-mono)', fontSize: '16px' }}>
                                            ₹{((prices.find(p => p.symbol === buyForm.symbol)?.price || 0) * parseInt(buyForm.quantity || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                                {buyMsg && <div style={{ ...s.msgBox, color: buyMsg.startsWith('✓') ? 'var(--vc-teal)' : 'var(--vc-red)', borderColor: buyMsg.startsWith('✓') ? 'rgba(29,232,181,0.3)' : 'rgba(255,77,106,0.3)', background: buyMsg.startsWith('✓') ? 'rgba(29,232,181,0.08)' : 'rgba(255,77,106,0.08)' }}>{buyMsg}</div>}
                                <button style={s.btn} onClick={handleBuy}>Execute Buy Order</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sell Tab */}
                {activeTab === 'sell' && (
                    <div style={s.content}>
                        <div style={{ ...s.card, maxWidth: '420px' }}>
                            <div style={s.cardHead}>
                                <div style={s.cardTitle}>Sell Stock</div>
                                <span style={s.badgeRed}>MARKET ORDER</span>
                            </div>
                            {portfolio.length === 0 ? (
                                <div style={s.empty}>No holdings to sell.</div>
                            ) : (
                                <div style={s.fields}>
                                    <div style={s.field}>
                                        <label style={s.label}>SYMBOL</label>
                                        <select style={s.input} value={sellForm.symbol}
                                            onChange={e => setSellForm({ ...sellForm, symbol: e.target.value })}>
                                            <option value="">Select holding</option>
                                            {portfolio.map(h => <option key={h.symbol} value={h.symbol}>{h.symbol} — {h.quantity} shares</option>)}
                                        </select>
                                    </div>
                                    <div style={s.field}>
                                        <label style={s.label}>QUANTITY</label>
                                        <input style={s.input} type="number" placeholder="0" min="1"
                                            value={sellForm.quantity}
                                            onChange={e => setSellForm({ ...sellForm, quantity: e.target.value })} />
                                    </div>
                                    {sellForm.symbol && sellForm.quantity && (
                                        <div style={s.estimateBox}>
                                            <span style={s.label}>ESTIMATED RETURN</span>
                                            <span style={{ color: 'var(--vc-teal)', fontFamily: 'var(--vc-mono)', fontSize: '16px' }}>
                                                ₹{((prices.find(p => p.symbol === sellForm.symbol)?.price || 0) * parseInt(sellForm.quantity || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                    {sellMsg && <div style={{ ...s.msgBox, color: sellMsg.startsWith('✓') ? 'var(--vc-teal)' : 'var(--vc-red)', borderColor: sellMsg.startsWith('✓') ? 'rgba(29,232,181,0.3)' : 'rgba(255,77,106,0.3)', background: sellMsg.startsWith('✓') ? 'rgba(29,232,181,0.08)' : 'rgba(255,77,106,0.08)' }}>{sellMsg}</div>}
                                    <button style={{ ...s.btn, background: 'var(--vc-red)', color: '#fff' }} onClick={handleSell}>Execute Sell Order</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
    statusPill: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(29,232,181,0.08)', border: '1px solid rgba(29,232,181,0.2)', borderRadius: '20px', padding: '4px 10px', fontSize: '10px', color: 'var(--vc-teal)', fontFamily: 'var(--vc-mono)' },
    pulse: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--vc-teal)' },
    backBtn: { marginLeft: 'auto', background: 'none', border: '1px solid var(--vc-border)', color: 'var(--vc-muted)', cursor: 'pointer', fontSize: '11px', padding: '5px 12px', borderRadius: '4px' },
    main: { padding: '24px' },
    pageHeader: { marginBottom: '20px' },
    pageTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--vc-text)' },
    pageSub: { fontSize: '11px', color: 'var(--vc-muted)', marginTop: '2px', fontFamily: 'var(--vc-mono)' },
    metrics: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
    metricCard: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '14px' },
    metricLabel: { fontSize: '9px', fontWeight: '500', color: 'var(--vc-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' },
    metricVal: { fontSize: '18px', fontWeight: '500', fontFamily: 'var(--vc-mono)' },
    tabRow: { display: 'flex', borderBottom: '1px solid var(--vc-border)', marginBottom: '20px' },
    tab: { padding: '10px 16px', cursor: 'pointer', fontSize: '12px', color: 'var(--vc-muted)', borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' },
    tabActive: { color: 'var(--vc-gold)', borderBottom: '2px solid var(--vc-gold)' },
    tabBadge: { fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--vc-mono)' },
    content: {},
    card: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
    cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--vc-border)' },
    cardTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--vc-text)', letterSpacing: '0.04em' },
    priceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' },
    priceCard: { background: 'var(--vc-surface)', border: '1px solid var(--vc-border)', borderRadius: '6px', padding: '12px' },
    symbol: { fontSize: '10px', fontWeight: '500', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)', letterSpacing: '0.08em' },
    price: { fontSize: '16px', fontWeight: '500', color: 'var(--vc-text)', fontFamily: 'var(--vc-mono)' },
    latency: { fontSize: '9px', fontFamily: 'var(--vc-mono)' },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    holdingRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    holdingDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
    holdingSymbol: { fontSize: '12px', color: 'var(--vc-text)', fontWeight: '500', marginBottom: '2px' },
    holdingDetail: { fontSize: '10px', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    holdingValue: { fontSize: '12px', color: 'var(--vc-text)', fontFamily: 'var(--vc-mono)', marginBottom: '2px' },
    fields: { display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em', color: 'var(--vc-muted)', fontFamily: 'var(--vc-mono)' },
    input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--vc-border)', background: 'var(--vc-surface2)', color: 'var(--vc-text)', fontSize: '13px', outline: 'none' },
    estimateBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--vc-surface2)', borderRadius: '6px', border: '1px solid var(--vc-border)' },
    msgBox: { padding: '10px 12px', borderRadius: '4px', border: '1px solid', fontSize: '11px', fontFamily: 'var(--vc-mono)' },
    btn: { width: '100%', padding: '11px', borderRadius: '6px', border: 'none', background: 'var(--vc-gold)', color: '#1a0e00', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    empty: { color: 'var(--vc-muted)', textAlign: 'center', padding: '40px', fontFamily: 'var(--vc-mono)', fontSize: '12px' },
    badgeGold: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(201,168,76,0.15)', color: 'var(--vc-gold)', border: '1px solid rgba(201,168,76,0.3)' },
    badgeTeal: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(29,232,181,0.1)', color: 'var(--vc-teal)', border: '1px solid rgba(29,232,181,0.25)' },
    badgeBlue: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(77,159,255,0.1)', color: 'var(--vc-blue)', border: '1px solid rgba(77,159,255,0.25)' },
    badgeRed: { fontSize: '9px', fontFamily: 'var(--vc-mono)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,77,106,0.1)', color: 'var(--vc-red)', border: '1px solid rgba(255,77,106,0.25)' },
};