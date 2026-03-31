import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import stockService from '../services/stockService';

const COLORS = ['#6c63ff', '#4caf50', '#ff6b6b', '#ffa726',
                 '#29b6f6', '#ab47bc', '#26a69a', '#ef5350'];

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
        try {
            const data = await stockService.getAllPrices();
            setPrices(data);
        } catch (err) { console.error(err); }
    };

    const fetchPortfolio = async () => {
        try {
            const data = await stockService.getPortfolio();
            setPortfolio(data);
        } catch (err) { console.error(err); }
    };

    const handleBuy = async () => {
        if (!buyForm.symbol || !buyForm.quantity) {
            setBuyMsg('Symbol aur quantity required!');
            return;
        }
        try {
            const data = await stockService.buyStock(buyForm.symbol, parseInt(buyForm.quantity));
            setBuyMsg(`✓ ${data.message} — ₹${data.totalCost} deducted`);
            setBuyForm({ symbol: '', quantity: '' });
            fetchPortfolio();
        } catch (err) {
            setBuyMsg(err.response?.data?.message || 'Purchase failed!');
        }
    };

    const handleSell = async () => {
        if (!sellForm.symbol || !sellForm.quantity) {
            setSellMsg('Symbol aur quantity required!');
            return;
        }
        try {
            const data = await stockService.sellStock(sellForm.symbol, parseInt(sellForm.quantity));
            setSellMsg(`✓ ${data.message} — ₹${data.totalEarned} credited`);
            setSellForm({ symbol: '', quantity: '' });
            fetchPortfolio();
        } catch (err) {
            setSellMsg(err.response?.data?.message || 'Sale failed!');
        }
    };

    const totalInvested = portfolio.reduce((sum, h) => sum + parseFloat(h.invested), 0);
    const totalValue = portfolio.reduce((sum, h) => sum + parseFloat(h.currentValue), 0);
    const totalPnl = totalValue - totalInvested;

    if (loading) return (
        <div style={styles.container}>
            <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px' }}>Loading...</div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={onBack}>← Back</button>
                <h2 style={styles.title}>📈 Portfolio Dashboard</h2>
                <span style={styles.live}>● LIVE</span>
            </div>

            {portfolio.length > 0 && (
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Total Invested</div>
                        <div style={styles.statValue}>₹{totalInvested.toFixed(2)}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Current Value</div>
                        <div style={styles.statValue}>₹{totalValue.toFixed(2)}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>P&L</div>
                        <div style={{ ...styles.statValue, color: totalPnl >= 0 ? '#4caf50' : '#ff6b6b' }}>
                            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)}
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.tabs}>
                {['market', 'portfolio', 'buy', 'sell'].map(tab => (
                    <button
                        key={tab}
                        style={activeTab === tab ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'market' ? '📊 Market' :
                         tab === 'portfolio' ? '💼 Portfolio' :
                         tab === 'buy' ? '🛒 Buy' : '💸 Sell'}
                    </button>
                ))}
            </div>

            {/* Market Tab */}
            {activeTab === 'market' && (
                <div style={styles.content}>
                    <div style={styles.chartBox}>
                        <p style={styles.chartTitle}>Live Stock Prices (INR)</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prices}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="symbol" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid #333', color: '#fff' }}
                                    formatter={(val) => [`₹${val}`, 'Price']}
                                />
                                <Bar dataKey="price" fill="#6c63ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={styles.priceGrid}>
                        {prices.map((stock) => (
                            <div key={stock.symbol} style={styles.priceCard}>
                                <div style={styles.symbol}>{stock.symbol}</div>
                                <div style={styles.price}>₹{stock.price}</div>
                                <div style={styles.latency}>{stock.latencyMs}ms</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
                <div style={styles.content}>
                    {portfolio.length === 0 ? (
                        <div style={styles.empty}>Koi holdings nahi — Buy tab se kharido!</div>
                    ) : (
                        <>
                            <div style={styles.chartBox}>
                                <p style={styles.chartTitle}>Portfolio Allocation</p>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={portfolio} dataKey="currentValue" nameKey="symbol"
                                            cx="50%" cy="50%" outerRadius={80} label={({ symbol }) => symbol}>
                                            {portfolio.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => [`₹${val}`, 'Value']}
                                            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', color: '#fff' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={styles.holdingsList}>
                                {portfolio.map((h, i) => (
                                    <div key={h.symbol} style={styles.holdingCard}>
                                        <div style={{ ...styles.holdingDot, background: COLORS[i % COLORS.length] }} />
                                        <div style={styles.holdingInfo}>
                                            <div style={styles.holdingSymbol}>{h.symbol}</div>
                                            <div style={styles.holdingDetail}>{h.quantity} shares @ ₹{h.avgCost}</div>
                                        </div>
                                        <div style={styles.holdingRight}>
                                            <div style={styles.holdingValue}>₹{parseFloat(h.currentValue).toFixed(2)}</div>
                                            <div style={{ fontSize: '12px', color: parseFloat(h.pnl) >= 0 ? '#4caf50' : '#ff6b6b' }}>
                                                {parseFloat(h.pnl) >= 0 ? '+' : ''}₹{parseFloat(h.pnl).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Buy Tab */}
            {activeTab === 'buy' && (
                <div style={styles.content}>
                    <div style={styles.buyForm}>
                        <p style={styles.chartTitle}>Stock Kharido</p>
                        <select style={styles.input} value={buyForm.symbol}
                            onChange={e => setBuyForm({ ...buyForm, symbol: e.target.value })}>
                            <option value="">Symbol select karo</option>
                            {prices.map(s => (
                                <option key={s.symbol} value={s.symbol}>{s.symbol} — ₹{s.price}</option>
                            ))}
                        </select>
                        <input style={styles.input} type="number" placeholder="Quantity"
                            value={buyForm.quantity}
                            onChange={e => setBuyForm({ ...buyForm, quantity: e.target.value })} min="1" />
                        {buyForm.symbol && buyForm.quantity && (
                            <div style={styles.estimate}>
                                Estimated: ₹{((prices.find(p => p.symbol === buyForm.symbol)?.price || 0) * parseInt(buyForm.quantity || 0)).toFixed(2)}
                            </div>
                        )}
                        {buyMsg && <p style={{ color: buyMsg.startsWith('✓') ? '#4caf50' : '#ff6b6b', fontSize: '13px' }}>{buyMsg}</p>}
                        <button style={styles.buyBtn} onClick={handleBuy}>Buy Now</button>
                    </div>
                </div>
            )}

            {/* Sell Tab */}
            {activeTab === 'sell' && (
                <div style={styles.content}>
                    <div style={styles.buyForm}>
                        <p style={styles.chartTitle}>Stock Becho</p>
                        {portfolio.length === 0 ? (
                            <div style={styles.empty}>Koi holdings nahi — pehle kharido!</div>
                        ) : (
                            <>
                                <select style={styles.input} value={sellForm.symbol}
                                    onChange={e => setSellForm({ ...sellForm, symbol: e.target.value })}>
                                    <option value="">Symbol select karo</option>
                                    {portfolio.map(h => (
                                        <option key={h.symbol} value={h.symbol}>
                                            {h.symbol} — {h.quantity} shares
                                        </option>
                                    ))}
                                </select>
                                <input style={styles.input} type="number" placeholder="Quantity"
                                    value={sellForm.quantity}
                                    onChange={e => setSellForm({ ...sellForm, quantity: e.target.value })} min="1" />
                                {sellForm.symbol && sellForm.quantity && (
                                    <div style={{ ...styles.estimate, color: '#4caf50' }}>
                                        Estimated Earn: ₹{((prices.find(p => p.symbol === sellForm.symbol)?.price || 0) * parseInt(sellForm.quantity || 0)).toFixed(2)}
                                    </div>
                                )}
                                {sellMsg && <p style={{ color: sellMsg.startsWith('✓') ? '#4caf50' : '#ff6b6b', fontSize: '13px' }}>{sellMsg}</p>}
                                <button style={{ ...styles.buyBtn, background: '#ff6b6b' }} onClick={handleSell}>
                                    Sell Now
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#0f0c29', color: '#fff', fontFamily: 'sans-serif' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    backBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' },
    title: { color: '#fff', fontSize: '20px', margin: 0 },
    live: { color: '#4caf50', fontSize: '12px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px 24px' },
    statCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center' },
    statLabel: { color: '#888', fontSize: '12px', marginBottom: '8px' },
    statValue: { fontSize: '20px', fontWeight: 'bold' },
    tabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 24px' },
    tabActive: { padding: '12px 20px', background: 'none', border: 'none', borderBottom: '2px solid #6c63ff', color: '#fff', cursor: 'pointer', fontSize: '14px' },
    tabInactive: { padding: '12px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#888', cursor: 'pointer', fontSize: '14px' },
    content: { padding: '24px' },
    chartBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' },
    chartTitle: { color: '#888', fontSize: '13px', marginBottom: '12px' },
    priceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' },
    priceCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'center' },
    symbol: { color: '#888', fontSize: '11px', marginBottom: '6px' },
    price: { fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
    latency: { color: '#4caf50', fontSize: '10px' },
    empty: { color: '#888', textAlign: 'center', padding: '40px' },
    holdingsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    holdingCard: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px' },
    holdingDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
    holdingInfo: { flex: 1 },
    holdingSymbol: { fontSize: '14px', fontWeight: 'bold' },
    holdingDetail: { color: '#888', fontSize: '12px' },
    holdingRight: { textAlign: 'right' },
    holdingValue: { fontSize: '14px', fontWeight: 'bold' },
    buyForm: { maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' },
    input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none' },
    estimate: { color: '#6c63ff', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' },
    buyBtn: { padding: '12px', borderRadius: '8px', border: 'none', background: '#6c63ff', color: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold' }
};