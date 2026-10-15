import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Download } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency, getStatusClass, getStatusLabel } from '../../lib/utils';
import RecordPaymentModal from '../../components/modals/RecordPaymentModal';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetch = () => {
    setLoading(true);
    const params: any = { page, limit: 20 };
    if (statusFilter !== 'all') params.status = statusFilter;
    api.get('/payments', { params })
      .then(r => { setInvoices(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_URL}/reports/export/csv?type=payments`, '_blank');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{total} invoices total</p>
        </div>
        <button onClick={handleExport} className="btn-secondary btn-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-2">
        {['all', 'pending', 'partially_paid', 'paid', 'overdue'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-brand text-black' : 'bg-surface-elevated text-gray-400 border border-surface-border hover:text-white'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead><tr>
            <th>Invoice</th><th>Member</th><th>Description</th><th>Total</th><th>Paid</th><th>Pending</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>) :
              invoices.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-500">No invoices found</td></tr> :
                invoices.map(inv => (
                  <tr key={inv._id}>
                    <td><span className="font-mono text-xs text-brand">{inv.invoiceNumber}</span></td>
                    <td>
                      <Link to={`/admin/members/${inv.member?._id}`} className="text-sm text-white hover:text-brand transition-colors">
                        {inv.member?.name}<br /><span className="text-xs text-gray-500">{inv.member?.memberId}</span>
                      </Link>
                    </td>
                    <td className="text-xs text-gray-400 max-w-[160px] truncate">{inv.description}</td>
                    <td className="text-sm text-gray-300">{formatCurrency(inv.netAmount)}</td>
                    <td className="text-sm text-green-400">{formatCurrency(inv.paidAmount)}</td>
                    <td className={`text-sm font-medium ${inv.pendingAmount > 0 ? 'text-red-400' : 'text-gray-600'}`}>{formatCurrency(inv.pendingAmount)}</td>
                    <td><span className={`badge ${getStatusClass(inv.status)}`}>{getStatusLabel(inv.status)}</span></td>
                    <td>
                      {['pending', 'partially_paid', 'overdue'].includes(inv.status) && (
                        <button onClick={() => setSelectedInvoice(inv)} className="btn-primary btn-sm">
                          <CreditCard size={13} /> Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <RecordPaymentModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} onSuccess={() => { setSelectedInvoice(null); fetch(); toast.success('Payment recorded!'); }} />
      )}
    </div>
  );
}
