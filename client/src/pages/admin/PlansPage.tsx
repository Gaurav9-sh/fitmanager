import { useEffect, useState } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [form, setForm] = useState({ name: '', durationDays: 30, durationLabel: '1 Month', price: '', features: '', category: 'standard', isPopular: false, description: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => api.get('/membership-plans?active=false').then(r => { setPlans(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleToggle = async (plan: any) => {
    try {
      await api.patch(`/membership-plans/${plan._id}/toggle`);
      toast.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
      fetch();
    } catch { toast.error('Failed to toggle plan'); }
  };

  const handleEdit = (plan: any) => {
    setEditPlan(plan);
    setForm({ name: plan.name, durationDays: plan.durationDays, durationLabel: plan.durationLabel, price: (plan.price / 100).toString(), features: plan.features.join('\n'), category: plan.category, isPopular: plan.isPopular, description: plan.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), features: form.features.split('\n').filter(Boolean) };
      if (editPlan) {
        await api.put(`/membership-plans/${editPlan._id}`, payload);
        toast.success('Plan updated');
      } else {
        await api.post('/membership-plans', payload);
        toast.success('Plan created');
      }
      setShowForm(false); setEditPlan(null); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle">Manage your gym's membership offerings</p>
        </div>
        <button onClick={() => { setEditPlan(null); setForm({ name: '', durationDays: 30, durationLabel: '1 Month', price: '', features: '', category: 'standard', isPopular: false, description: '' }); setShowForm(true); }} className="btn-primary btn-sm">
          <Plus size={14} /> Add Plan
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4">{editPlan ? 'Edit Plan' : 'New Plan'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Plan Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Monthly Basic" /></div>
            <div><label className="label">Price (₹) *</label><input type="number" className="input" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="999" /></div>
            <div><label className="label">Duration (days)</label><input type="number" className="input" value={form.durationDays} onChange={e => setForm(f => ({...f, durationDays: +e.target.value}))} /></div>
            <div><label className="label">Duration Label</label><input className="input" value={form.durationLabel} onChange={e => setForm(f => ({...f, durationLabel: e.target.value}))} placeholder="1 Month" /></div>
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                <option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="personal_training">Personal Training</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5"><input type="checkbox" id="popular" checked={form.isPopular} onChange={e => setForm(f => ({...f, isPopular: e.target.checked}))} /><label htmlFor="popular" className="text-sm text-gray-300">Mark as Popular</label></div>
            <div className="sm:col-span-2"><label className="label">Description</label><input className="input" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Short description..." /></div>
            <div className="sm:col-span-2"><label className="label">Features (one per line)</label><textarea className="input resize-none" rows={4} value={form.features} onChange={e => setForm(f => ({...f, features: e.target.value}))} placeholder={"Gym Floor Access\nLocker Room\nGroup Classes"} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Plan'}</button>
          </div>
        </div>
      )}

      {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-xl"/>)}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan._id} className={`card p-5 flex flex-col ${plan.isPopular ? 'border-brand' : ''} ${!plan.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{plan.name}</h3>
                  <p className="text-gray-500 text-xs">{plan.durationLabel} · {plan.category}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleEdit(plan)} className="btn-ghost btn-sm p-1.5"><Edit2 size={14} /></button>
                  <button onClick={() => handleToggle(plan)} className="btn-ghost btn-sm p-1.5">{plan.isActive ? <ToggleRight size={16} className="text-brand" /> : <ToggleLeft size={16} />}</button>
                </div>
              </div>
              <p className="text-3xl font-black text-brand mb-3">{formatCurrency(plan.price)}</p>
              <ul className="space-y-1.5 flex-1">
                {plan.features?.slice(0, 4).map((f: string) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-400"><CheckCircle size={11} className="text-brand flex-shrink-0" />{f}</li>
                ))}
                {plan.features?.length > 4 && <li className="text-xs text-gray-600">+{plan.features.length - 4} more</li>}
              </ul>
              <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
                <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-expired'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                {plan.isPopular && <span className="text-xs text-brand">★ Popular</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
