import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatDate, formatCurrency, getStatusClass, getStatusLabel } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { CreditCard } from 'lucide-react';

export default function MemberPayments() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.memberId) return;
    api.get(`/payments/member/${user.memberId}`)
      .then(r => setInvoices(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.memberId]);

  const total = invoices.reduce((s, i) => s + i.netAmount, 0);
  const paid = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const pending = invoices.reduce((s, i) => s + i.pendingAmount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Payments</h1>
        <p className="page-subtitle">Your complete payment history</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Billed', value: formatCurrency(total), color: 'text-white' },
          { label: 'Total Paid', value: formatCurrency(paid), color: 'text-green-400' },
          { label: 'Pending', value: formatCurrency(pending), color: pending > 0 ? 'text-red-400' : 'text-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="kpi-card text-center items-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-500 gap-2">
          <CreditCard size={32} />
          <p>No payment records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv._id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-white font-medium">{inv.description}</p>
                  <p className="text-xs text-gray-500 font-mono">{inv.invoiceNumber}</p>
                </div>
                <span className={`badge ${getStatusClass(inv.status)}`}>{getStatusLabel(inv.status)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total: {formatCurrency(inv.netAmount)}</span>
                <div className="text-right">
                  {inv.paidAmount > 0 && <span className="text-green-400">Paid: {formatCurrency(inv.paidAmount)}</span>}
                  {inv.pendingAmount > 0 && <span className="text-red-400 ml-2">Due: {formatCurrency(inv.pendingAmount)}</span>}
                </div>
              </div>
              {inv.payments?.map((p: any) => p.amount > 0 && (
                <div key={p._id} className="mt-2 pt-2 border-t border-surface-border flex justify-between text-xs text-gray-500">
                  <span className="capitalize">{p.method} payment</span>
                  <span className="text-green-400">{formatCurrency(p.amount)} on {formatDate(p.paidAt)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
