import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, UserCheck, CreditCard, QrCode, Phone, Mail, MapPin, Calendar, Activity, AlertTriangle, Plus } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatCurrency, getStatusClass, getStatusLabel, daysUntil } from '../../lib/utils';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';
import RecordPaymentModal from '../../components/modals/RecordPaymentModal';
import AssignSubscriptionModal from '../../components/modals/AssignSubscriptionModal';

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchMember = async () => {
    try {
      const { data: res } = await api.get(`/members/${id}`);
      setData(res.data);
    } catch {
      toast.error('Failed to load member');
      navigate('/admin/members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMember(); }, [id]);

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="skeleton h-64 rounded-xl" />
        <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
      </div>
    </div>
  );

  if (!data) return null;
  const { member, subscriptions, invoices, attendanceCount, recentAttendance } = data;

  const activeSub = subscriptions?.find((s: any) =>
    s.status === 'active' && new Date(s.endDate) >= new Date()
  );
  const unpaidInvoices = invoices?.filter((i: any) => ['pending', 'partially_paid', 'overdue'].includes(i.status));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/members')} className="btn-ghost btn-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">{member.name}</h1>
            <p className="text-xs text-gray-500 font-mono">{member.memberId}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowQR(true)} className="btn-secondary btn-sm">
            <QrCode size={14} /> QR Code
          </button>
          <button onClick={() => setShowSub(true)} className="btn-secondary btn-sm">
            <UserCheck size={14} /> Assign Plan
          </button>
          {unpaidInvoices?.length > 0 && (
            <button onClick={() => { setSelectedInvoice(unpaidInvoices[0]); setShowPayment(true); }} className="btn-primary btn-sm">
              <CreditCard size={14} /> Record Payment
            </button>
          )}
          <Link to={`/admin/members/${id}/edit`} className="btn-secondary btn-sm">
            <Edit2 size={14} /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Profile Card */}
        <div className="space-y-4">
          <div className="card p-5">
            {/* Avatar + Status */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center text-black text-3xl font-bold mb-3">
                {member.name?.charAt(0)}
              </div>
              <h2 className="text-white font-semibold text-lg">{member.name}</h2>
              <p className="text-gray-500 text-xs font-mono">{member.memberId}</p>
              <span className={`badge mt-2 ${getStatusClass(member.status)}`}>{getStatusLabel(member.status)}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Visits', value: attendanceCount || 0 },
                { label: 'Subscriptions', value: subscriptions?.length || 0 },
                { label: 'Invoices', value: invoices?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-surface-elevated">
                  <p className="text-lg font-bold text-brand">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2.5 text-sm">
              {member.phone && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={14} className="text-gray-600 flex-shrink-0" />
                  {member.phone}
                </div>
              )}
              {member.email && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={14} className="text-gray-600 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.city && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={14} className="text-gray-600 flex-shrink-0" />
                  {member.city}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar size={14} className="text-gray-600 flex-shrink-0" />
                Joined {formatDate(member.joiningDate, 'long')}
              </div>
            </div>

            {/* Fitness info */}
            {(member.fitnessGoal || member.bloodGroup) && (
              <div className="mt-4 pt-4 border-t border-surface-border space-y-2">
                {member.bloodGroup && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Blood Group</span>
                    <span className="text-white font-medium">{member.bloodGroup}</span>
                  </div>
                )}
                {member.fitnessGoal && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Goal</span>
                    <span className="text-brand font-medium">{member.fitnessGoal}</span>
                  </div>
                )}
                {member.gender && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Gender</span>
                    <span className="text-white capitalize">{member.gender}</span>
                  </div>
                )}
              </div>
            )}

            {/* Assigned Trainer */}
            {member.assignedTrainer && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                <p className="text-xs text-gray-500 mb-2">Assigned Trainer</p>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-elevated">
                  <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 text-sm font-bold">
                    {member.assignedTrainer.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{member.assignedTrainer.name}</p>
                    <p className="text-xs text-gray-500">{member.assignedTrainer.specialties?.[0]}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Subscription */}
          {activeSub ? (
            <div className="card p-5 border-brand/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserCheck size={15} className="text-green-400" />
                  Active Membership
                </h3>
                <span className="badge-active badge">Active</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Plan', value: activeSub.planSnapshot?.name },
                  { label: 'Started', value: formatDate(activeSub.startDate) },
                  { label: 'Expires', value: formatDate(activeSub.endDate) },
                  { label: 'Days Left', value: `${Math.max(0, daysUntil(activeSub.endDate))} days` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-lg bg-surface-elevated">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {daysUntil(activeSub.endDate) <= 7 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle size={13} />
                  Membership expiring soon! Consider renewing.
                </div>
              )}
            </div>
          ) : (
            <div className="card p-5 border-dashed border-orange-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-400">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">No active membership</span>
                </div>
                <button onClick={() => setShowSub(true)} className="btn-primary btn-sm">
                  <Plus size={13} /> Assign Plan
                </button>
              </div>
            </div>
          )}

          {/* Pending Dues */}
          {unpaidInvoices?.length > 0 && (
            <div className="card p-5 border-red-500/20">
              <h3 className="text-sm font-semibold text-red-400 mb-3">Pending Dues</h3>
              <div className="space-y-2">
                {unpaidInvoices.map((inv: any) => (
                  <div key={inv._id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div>
                      <p className="text-sm text-white">{inv.description}</p>
                      <p className="text-xs text-gray-500">{inv.invoiceNumber} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{formatCurrency(inv.pendingAmount)}</p>
                      <button
                        onClick={() => { setSelectedInvoice(inv); setShowPayment(true); }}
                        className="text-xs text-brand hover:text-brand-light"
                      >
                        Pay now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription History */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Subscription History</h3>
            {subscriptions?.length === 0 ? (
              <p className="text-gray-500 text-sm">No subscriptions yet</p>
            ) : (
              <div className="space-y-2">
                {subscriptions?.map((s: any) => (
                  <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                    <div>
                      <p className="text-sm text-white">{s.planSnapshot?.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(s.startDate)} → {formatDate(s.endDate)}
                        {s.isRenewal && <span className="ml-2 text-brand">(Renewal)</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${getStatusClass(s.status)}`}>{getStatusLabel(s.status)}</span>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(s.finalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Payment History</h3>
            {invoices?.length === 0 ? (
              <p className="text-gray-500 text-sm">No payment records</p>
            ) : (
              <div className="space-y-2">
                {invoices?.map((inv: any) => (
                  <div key={inv._id} className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{inv.description}</p>
                        <p className="text-xs text-gray-500 font-mono">{inv.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${getStatusClass(inv.status)}`}>{getStatusLabel(inv.status)}</span>
                        <p className="text-xs text-gray-400 mt-1">{formatCurrency(inv.netAmount)}</p>
                      </div>
                    </div>
                    {inv.payments?.filter((p: any) => p.amount > 0).map((p: any) => (
                      <div key={p._id} className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-surface-border pt-1.5">
                        <span className="capitalize">{p.method} payment</span>
                        <span className="text-green-400">{formatCurrency(p.amount)} · {formatDate(p.paidAt)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Attendance */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Recent Attendance <span className="text-gray-500 font-normal">({attendanceCount} total visits)</span>
            </h3>
            {recentAttendance?.length === 0 ? (
              <p className="text-gray-500 text-sm">No attendance records</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {recentAttendance?.slice(0, 18).map((a: any) => (
                  <div key={a._id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-elevated text-xs">
                    <Activity size={12} className="text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white">{a.date}</p>
                      <p className="text-gray-500">
                        {new Date(a.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {a.checkOutTime && ` – ${new Date(a.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQR && <QRCodeDisplay memberId={id!} memberName={member.name} onClose={() => setShowQR(false)} />}
      {showPayment && selectedInvoice && (
        <RecordPaymentModal
          invoice={selectedInvoice}
          onClose={() => { setShowPayment(false); setSelectedInvoice(null); }}
          onSuccess={() => { setShowPayment(false); fetchMember(); toast.success('Payment recorded!'); }}
        />
      )}
      {showSub && (
        <AssignSubscriptionModal
          memberId={id!}
          memberName={member.name}
          onClose={() => setShowSub(false)}
          onSuccess={() => { setShowSub(false); fetchMember(); toast.success('Membership assigned!'); }}
        />
      )}
    </div>
  );
}
