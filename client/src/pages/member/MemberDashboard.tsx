import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, CreditCard, Calendar, AlertTriangle, Activity, QrCode } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatCurrency, daysUntil } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!user?.memberId) { setLoading(false); return; }
    api.get(`/members/${user.memberId}`)
      .then(r => setData(r.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user?.memberId]);

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>;

  const member = data?.member;
  const activeSub = data?.subscriptions?.find((s: any) => s.status === 'active' && new Date(s.endDate) >= new Date());
  const unpaidInvoices = data?.invoices?.filter((i: any) => ['pending', 'partially_paid', 'overdue'].includes(i.status));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-brand/10 to-dark-700 border-brand/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center text-black text-2xl font-black flex-shrink-0">
            {member?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Hello, {member?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-400 text-sm">{member?.memberId} · {member?.fitnessGoal || 'Keep pushing!'}</p>
          </div>
          <button onClick={() => setShowQR(true)} className="btn-secondary btn-sm">
            <QrCode size={14} /> My QR
          </button>
        </div>
      </div>

      {/* Membership Status */}
      <div className={`card p-5 ${activeSub ? 'border-green-500/20' : 'border-red-500/20'}`}>
        <div className="flex items-center gap-2 mb-3">
          <UserCheck size={16} className={activeSub ? 'text-green-400' : 'text-red-400'} />
          <h2 className="text-sm font-semibold text-white">Membership Status</h2>
        </div>
        {activeSub ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Plan', value: activeSub.planSnapshot?.name },
                { label: 'Start Date', value: formatDate(activeSub.startDate) },
                { label: 'Expiry Date', value: formatDate(activeSub.endDate) },
                { label: 'Days Remaining', value: `${Math.max(0, daysUntil(activeSub.endDate))} days` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-surface-elevated">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {daysUntil(activeSub.endDate) <= 7 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                <AlertTriangle size={13} />
                Your membership expires soon! Contact the gym to renew.
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle size={16} />
            <div>
              <p className="text-sm font-medium">No active membership</p>
              <p className="text-xs text-gray-500">Please contact the gym to subscribe to a plan.</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Visits', value: data?.attendanceCount || 0, icon: Activity, color: 'text-brand' },
          { label: 'Pending Dues', value: unpaidInvoices?.length ? formatCurrency(unpaidInvoices.reduce((s: number, i: any) => s + i.pendingAmount, 0)) : '₹0', icon: CreditCard, color: unpaidInvoices?.length ? 'text-red-400' : 'text-green-400' },
          { label: 'Subscriptions', value: data?.subscriptions?.length || 0, icon: Calendar, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card text-center items-center">
            <Icon size={20} className={color} />
            <div>
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending dues alert */}
      {unpaidInvoices?.length > 0 && (
        <div className="card p-5 border-red-500/20">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Pending Dues</h3>
          <div className="space-y-2">
            {unpaidInvoices.map((inv: any) => (
              <div key={inv._id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <div>
                  <p className="text-sm text-white">{inv.description}</p>
                  <p className="text-xs text-gray-500">{inv.invoiceNumber}</p>
                </div>
                <p className="text-sm font-bold text-red-400">{formatCurrency(inv.pendingAmount)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Contact the gym reception to clear dues.</p>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Recent Visits</h3>
          <Link to="/portal/attendance" className="text-xs text-brand hover:text-brand-light">View All</Link>
        </div>
        {data?.recentAttendance?.length === 0 ? (
          <p className="text-gray-500 text-sm">No visits recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data?.recentAttendance?.slice(0, 5).map((a: any) => (
              <div key={a._id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-green-400" />
                  <p className="text-sm text-white">{a.date}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(a.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {a.checkOutTime && ` – ${new Date(a.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQR && member && (
        <QRCodeDisplay memberId={member._id} memberName={member.name} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
