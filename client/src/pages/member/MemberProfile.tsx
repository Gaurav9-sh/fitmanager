import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function MemberProfile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, reset, handleSubmit } = useForm();

  useEffect(() => {
    if (!user?.memberId) return;
    api.get(`/members/${user.memberId}`).then(r => {
      const m = r.data.data?.member;
      reset({ name: m.name, phone: m.phone, email: m.email, city: m.city, address: m.address, fitnessGoal: m.fitnessGoal, bloodGroup: m.bloodGroup, dateOfBirth: m.dateOfBirth?.split('T')[0] });
    }).catch(() => { }).finally(() => setLoading(false));
  }, [user?.memberId]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put(`/members/${user?.memberId}`, data);
      toast.success('Profile updated!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>;

  return (
    <div className="max-w-lg space-y-5 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div><label className="label">Full Name</label><input {...register('name', { required: true })} className="input" /></div>
        <div><label className="label">Phone</label><input {...register('phone')} className="input" /></div>
        <div><label className="label">Email</label><input {...register('email')} type="email" className="input" /></div>
        <div><label className="label">Date of Birth</label><input {...register('dateOfBirth')} type="date" className="input" /></div>
        <div><label className="label">City</label><input {...register('city')} className="input" /></div>
        <div><label className="label">Address</label><input {...register('address')} className="input" /></div>
        <div><label className="label">Fitness Goal</label>
          <select {...register('fitnessGoal')} className="input">
            {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div><label className="label">Blood Group</label>
          <select {...register('bloodGroup')} className="input">
            <option value="">Select...</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
