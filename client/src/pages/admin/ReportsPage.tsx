import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Download, DollarSign, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [financial, setFinancial] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const getDateRange = () => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start = '';
    if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    else if (period === 'quarter') start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
    else if (period === 'year') start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    return { startDate: start, endDate: end };
  };

  const fetch = () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();
    Promise.all([
      api.get('/reports/financial', { params: { startDate, endDate } }),
      api.get('/reports/membership'),
    ]).then(([f, m]) => {
      setFinancial(f.data.data);
      setMembership(m.data.data);
    }).catch(() => toast.error('Failed to load reports'))
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [period]);

  const handleExport = (type: string) => {
    const { startDate, endDate } = getDateRange();
    window.open(`${import.meta.env.VITE_API_URL}/reports/export/csv?type=${type}&startDate=${startDate}&endDate=${endDate}`, '_blank');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Revenue, expenses, and profit analysis</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['month', 'quarter', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${period === p ? 'bg-brand text-black' : 'bg-surface-elevated text-gray-400 border border-surface-border hover:text-white'}`}>
              This {p}
            </button>
          ))}
          <button onClick={() => handleExport('payments')} className="btn-secondary btn-sm"><Download size={13} /> Payments</button>
          <button onClick={() => handleExport('expenses')} className="btn-secondary btn-sm"><Download size={13} /> Expenses</button>
          <button onClick={() => handleExport('members')} className="btn-secondary btn-sm"><Download size={13} /> Members</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : financial && (
        <>
          {/* P&L Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Gross Revenue', value: formatCurrency(financial.totalRevenue), icon: TrendingUp, color: 'text-green-400' },
              { label: 'Refunds', value: formatCurrency(financial.totalRefunds), icon: TrendingDown, color: 'text-red-400' },
              { label: 'Net Revenue', value: formatCurrency(financial.netRevenue), icon: DollarSign, color: 'text-brand' },
              { label: 'Total Expenses', value: formatCurrency(financial.totalExpenses), icon: TrendingDown, color: 'text-orange-400' },
              { label: 'Est. Profit', value: formatCurrency(financial.estimatedProfit), icon: financial.estimatedProfit >= 0 ? TrendingUp : TrendingDown, color: financial.estimatedProfit >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Outstanding Dues', value: formatCurrency(financial.outstanding), icon: AlertCircle, color: 'text-yellow-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="kpi-card">
                <Icon size={18} className={color} />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profit indicator */}
          <div className={`card p-4 border-l-4 ${financial.estimatedProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-black ${financial.estimatedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {financial.estimatedProfit >= 0 ? '📈' : '📉'}
              </div>
              <div>
                <p className="text-white font-semibold">
                  Estimated {financial.estimatedProfit >= 0 ? 'Profit' : 'Loss'}: {formatCurrency(Math.abs(financial.estimatedProfit))}
                </p>
                <p className="text-xs text-gray-400">
                  Net Revenue {formatCurrency(financial.netRevenue)} − Expenses {formatCurrency(financial.totalExpenses)} = {formatCurrency(financial.estimatedProfit)}
                  {' '}• Note: This is an estimate based on recorded transactions only.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Membership Stats */}
      {membership && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Membership Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active Members', value: membership.activeCount, color: 'text-green-400' },
              { label: 'Expired Members', value: membership.expiredCount, color: 'text-red-400' },
              { label: 'Pending Members', value: membership.pendingCount, color: 'text-yellow-400' },
              { label: 'Expiring in 30 Days', value: membership.expiringIn30, color: 'text-orange-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-lg bg-surface-elevated text-center">
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
