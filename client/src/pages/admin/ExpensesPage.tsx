import { useEffect, useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatCurrency, capitalize } from '../../lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['rent', 'salary', 'electricity', 'water', 'internet', 'equipment_purchase', 'equipment_maintenance', 'marketing', 'cleaning', 'insurance', 'software', 'miscellaneous', 'other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'rent', amount: '', date: new Date().toISOString().split('T')[0], description: '', vendor: '', paymentMethod: 'cash' });
  const [page] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get('/expenses', { params: { page, limit: 20 } }),
      api.get('/expenses/summary'),
    ]).then(([r, s]) => {
      setExpenses(r.data.data); setTotal(r.data.pagination?.total || 0);
      setSummary(s.data.data);
    }).catch(() => { }).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.date) { toast.error('Title, amount and date required'); return; }
    setSaving(true);
    try {
      await api.post('/expenses', { ...form, amount: parseFloat(form.amount) });
      toast.success('Expense recorded!'); setShowForm(false); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{total} total records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/reports/export/csv?type=expenses`, '_blank')} className="btn-secondary btn-sm"><Download size={14} /></button>
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Expense</button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="kpi-card">
            <p className="text-xs text-gray-500">Total This Month</p>
            <p className="text-xl font-bold text-white">{formatCurrency(summary.grandTotal || 0)}</p>
          </div>
          {summary.byCategory?.slice(0, 3).map((c: any) => (
            <div key={c._id} className="kpi-card">
              <p className="text-xs text-gray-500 capitalize">{c._id?.replace('_', ' ')}</p>
              <p className="text-xl font-bold text-white">{formatCurrency(c.total)}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4">Record Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Monthly Rent" /></div>
            <div><label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{capitalize(c)}</option>)}
              </select>
            </div>
            <div><label className="label">Amount (₹) *</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label className="label">Vendor</label><input className="input" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Vendor name (optional)" /></div>
            <div><label className="label">Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                {['cash', 'upi', 'card', 'bank_transfer', 'other'].map(m => <option key={m} value={m}>{capitalize(m)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="label">Description</label><input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional details..." /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Expense'}</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Vendor</th><th>Method</th><th></th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>) :
              expenses.map(exp => (
                <tr key={exp._id}>
                  <td className="text-sm text-white font-medium">{exp.title}</td>
                  <td><span className="badge badge-pending capitalize">{exp.category?.replace('_', ' ')}</span></td>
                  <td className="text-sm font-bold text-brand">{formatCurrency(exp.amount)}</td>
                  <td className="text-xs text-gray-400">{formatDate(exp.date)}</td>
                  <td className="text-sm text-gray-400">{exp.vendor || '—'}</td>
                  <td className="text-xs text-gray-500 capitalize">{exp.paymentMethod?.replace('_', ' ')}</td>
                  <td><button onClick={() => handleDelete(exp._id)} className="btn-ghost btn-sm text-red-400 hover:text-red-300"><Trash2 size={13} /></button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
