import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AddMemberPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { joiningDate: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { data: res } = await api.post('/members', data);
      toast.success(`Member ${res.data.name} created! Member ID: ${res.data.memberId}`);
      navigate(`/admin/members/${res.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/members')} className="btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="page-header mb-0">
          <h1 className="page-title">Add New Member</h1>
          <p className="page-subtitle">Create a new member account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
          <User size={16} className="text-brand" />
          <h3 className="text-sm font-semibold text-white">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Full Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input" placeholder="Arjun Sharma" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message as string}</p>}
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input {...register('phone', { required: 'Phone is required' })} className="input" placeholder="9876543210" />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message as string}</p>}
          </div>
          <div>
            <label className="label">Email Address</label>
            <input {...register('email')} type="email" className="input" placeholder="member@example.com" />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input {...register('dateOfBirth')} type="date" className="input" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select {...register('gender')} className="input">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Blood Group</label>
            <select {...register('bloodGroup')} className="input">
              <option value="">Select...</option>
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Joining Date *</label>
            <input {...register('joiningDate')} type="date" className="input" />
          </div>
          <div>
            <label className="label">Alternate Phone</label>
            <input {...register('alternatePhone')} className="input" placeholder="Optional" />
          </div>
          <div>
            <label className="label">City</label>
            <input {...register('city')} className="input" placeholder="Mumbai" />
          </div>
          <div>
            <label className="label">Address</label>
            <input {...register('address')} className="input" placeholder="Street address" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Fitness Goal</label>
            <select {...register('fitnessGoal')} className="input">
              <option value="">Select...</option>
              {['Weight Loss','Muscle Gain','Endurance','Flexibility','General Fitness','Sports Performance'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Medical Notes</label>
            <textarea {...register('medicalNotes')} className="input resize-none" rows={2} placeholder="Any injuries, conditions, or restrictions..." />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Internal Notes</label>
            <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Admin notes (not visible to member)..." />
          </div>
        </div>

        <div className="flex items-center gap-2 pb-3 pt-2 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-white">Emergency Contact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Name</label>
            <input {...register('emergencyContact.name')} className="input" placeholder="Contact name" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('emergencyContact.phone')} className="input" placeholder="Contact phone" />
          </div>
          <div>
            <label className="label">Relationship</label>
            <input {...register('emergencyContact.relationship')} className="input" placeholder="e.g., Parent, Spouse" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/admin/members')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : 'Create Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
