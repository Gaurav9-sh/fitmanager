import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusClass, getStatusLabel, formatCurrency, daysUntil } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [expiringDays, setExpiringDays] = useState('');

  const fetch = () => {
    setLoading(true);
    const params: any = {};
    if (filter !== 'all') params.status = filter;
    if (expiringDays) params.expiringDays = expiringDays;
    api.get('/subscriptions', { params })
      .then(r => setSubs(r.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter, expiringDays]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Subscriptions</h1>
        <p className="page-subtitle">Manage member memberships and renewals</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'expired', 'suspended'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setExpiringDays(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === s && !expiringDays ? 'bg-brand text-black' : 'bg-surface-elevated text-gray-400 border border-surface-border hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {['7', '15', '30'].map(d => (
            <button key={d} onClick={() => { setExpiringDays(d); setFilter(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${expiringDays === d ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-surface-elevated text-gray-400 border border-surface-border hover:text-white'}`}>
              Expiring in {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr>
            <th>Member</th><th>Plan</th><th>Start</th><th>End</th><th>Days Left</th><th>Amount</th><th>Type</th><th>Status</th>
          </tr></thead>
          <tbody>
            {loading ? Array.from({length:6}).map((_,i) => <tr key={i}>{Array.from({length:8}).map((_,j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>) :
              subs.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-500">No subscriptions found</td></tr> :
              subs.map(sub => {
                const days = daysUntil(sub.endDate);
                return (
                  <tr key={sub._id}>
                    <td>
                      <Link to={`/admin/members/${sub.member?._id}`} className="flex items-center gap-2 hover:text-brand transition-colors">
                        <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">{sub.member?.name?.charAt(0)}</div>
                        <div><p className="text-white text-sm font-medium">{sub.member?.name}</p><p className="text-gray-500 text-xs">{sub.member?.memberId}</p></div>
                      </Link>
                    </td>
                    <td className="text-sm text-gray-300">{sub.planSnapshot?.name}</td>
                    <td className="text-xs text-gray-400">{formatDate(sub.startDate)}</td>
                    <td className="text-xs text-gray-400">{formatDate(sub.endDate)}</td>
                    <td>
                      {sub.status === 'active' ? (
                        <span className={`text-sm font-medium ${days <= 3 ? 'text-red-400' : days <= 7 ? 'text-orange-400' : days <= 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {days > 0 ? `${days}d` : 'Today'}
                          {days <= 7 && <AlertTriangle size={11} className="inline ml-1" />}
                        </span>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="text-sm text-gray-300">{formatCurrency(sub.finalPrice)}</td>
                    <td><span className={`badge ${sub.isRenewal ? 'badge-partial' : 'badge-pending'}`}>{sub.isRenewal ? 'Renewal' : 'New'}</span></td>
                    <td><span className={`badge ${getStatusClass(sub.status)}`}>{getStatusLabel(sub.status)}</span></td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
