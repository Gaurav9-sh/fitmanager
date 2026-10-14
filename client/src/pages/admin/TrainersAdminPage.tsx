import { useEffect, useState } from 'react';
import { Star, Dumbbell, Plus } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function TrainersAdminPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', experience: '', specialties: '', qualifications: '', bio: '', salary: '' });

  const fetch = () => api.get('/trainers').then(r => { setTrainers(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return; }
    setSaving(true);
    try {
      await api.post('/trainers', {
        ...form,
        experience: parseInt(form.experience) || 0,
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: form.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        salary: form.salary ? parseFloat(form.salary) : undefined,
      });
      toast.success('Trainer created!');
      setShowForm(false);
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Trainers</h1>
          <p className="page-subtitle">Manage your coaching team</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Trainer</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4">Add New Trainer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Trainer name" /></div>
            <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="9876543210" /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div><label className="label">Experience (years)</label><input type="number" className="input" value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))} /></div>
            <div><label className="label">Monthly Salary (₹)</label><input type="number" className="input" value={form.salary} onChange={e => setForm(f => ({...f, salary: e.target.value}))} /></div>
            <div><label className="label">Specialties (comma-separated)</label><input className="input" value={form.specialties} onChange={e => setForm(f => ({...f, specialties: e.target.value}))} placeholder="Strength, Yoga, HIIT" /></div>
            <div className="sm:col-span-2"><label className="label">Qualifications (comma-separated)</label><input className="input" value={form.qualifications} onChange={e => setForm(f => ({...f, qualifications: e.target.value}))} placeholder="ACE CPT, NASM CES" /></div>
            <div className="sm:col-span-2"><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Add Trainer'}</button>
          </div>
        </div>
      )}

      {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-56 rounded-xl" />)}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map(trainer => (
            <div key={trainer._id} className="card p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center text-brand text-xl font-black flex-shrink-0">{trainer.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold">{trainer.name}</h3>
                  <p className="text-brand text-xs">{trainer.specialties?.[0]}</p>
                  <div className="flex items-center gap-1 mt-0.5">{trainer.rating && <><Star size={11} className="text-brand fill-brand" /><span className="text-xs text-white">{trainer.rating}</span></>}</div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-400 mb-4">
                <p>📞 {trainer.phone}</p>
                <p>⏳ {trainer.experience} years experience</p>
                <p>👥 {trainer.assignedMembers?.length || 0} assigned members</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {trainer.specialties?.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-brand/10 text-brand border border-brand/20">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
