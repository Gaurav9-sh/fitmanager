import { useEffect, useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get('/settings').then(r => { setSettings(r.data.data); setForm(r.data.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success('Settings saved!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const update = (field: string, value: any) => setForm((f: any) => ({ ...f, [field]: value }));

  if (loading) return <div className="space-y-4">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your gym details and preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Gym Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-surface-border">
          <Settings size={15} className="text-brand" />
          <h3 className="text-sm font-semibold text-white">Gym Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Gym Name</label><input className="input" value={form.gymName || ''} onChange={e => update('gymName', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Tagline</label><input className="input" value={form.tagline || ''} onChange={e => update('tagline', e.target.value)} placeholder="e.g. Stronger Every Day" /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address || ''} onChange={e => update('address', e.target.value)} /></div>
          <div><label className="label">City</label><input className="input" value={form.city || ''} onChange={e => update('city', e.target.value)} /></div>
          <div><label className="label">State</label><input className="input" value={form.state || ''} onChange={e => update('state', e.target.value)} /></div>
          <div><label className="label">Pincode</label><input className="input" value={form.pincode || ''} onChange={e => update('pincode', e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={e => update('phone', e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email || ''} onChange={e => update('email', e.target.value)} /></div>
          <div><label className="label">Website</label><input className="input" value={form.website || ''} onChange={e => update('website', e.target.value)} /></div>
          <div><label className="label">GST Number</label><input className="input" value={form.gstNumber || ''} onChange={e => update('gstNumber', e.target.value)} /></div>
        </div>
      </div>

      {/* Social */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Social Media</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['instagram', 'facebook', 'youtube', 'twitter'].map(s => (
            <div key={s}><label className="label capitalize">{s}</label>
              <input className="input" value={form.socialMedia?.[s] || ''} onChange={e => update('socialMedia', { ...form.socialMedia, [s]: e.target.value })} placeholder={`@your${s}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Receipt */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Receipt Settings</h3>
        <div>
          <label className="label">Receipt Footer Text</label>
          <textarea className="input resize-none" rows={2} value={form.receiptFooter || ''} onChange={e => update('receiptFooter', e.target.value)} placeholder="Thank you for choosing FitManager Gym!" />
        </div>
      </div>

      {/* Integrations status */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Integration Status</h3>
        <div className="space-y-2">
          {[
            { label: 'Email (SMTP)', key: 'smtpConfigured' },
            { label: 'Payment Gateway (Razorpay)', key: 'razorpayConfigured' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
              <span className="text-sm text-gray-300">{label}</span>
              <span className={`badge ${settings?.[key] ? 'badge-active' : 'badge-expired'}`}>
                {settings?.[key] ? 'Configured' : 'Not Configured'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Configure integrations via environment variables in the server .env file.</p>
      </div>
    </div>
  );
}
