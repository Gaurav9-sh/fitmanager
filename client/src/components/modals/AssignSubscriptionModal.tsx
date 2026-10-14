import { useEffect, useState } from 'react';
import { X, UserCheck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

interface Props {
  memberId: string;
  memberName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignSubscriptionModal({ memberId, memberName, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      planId: '',
      startDate: new Date().toISOString().split('T')[0],
      discount: '',
      discountReason: '',
      notes: '',
    },
  });
  const selectedPlanId = watch('planId');
  const selectedPlan = plans.find(p => p._id === selectedPlanId);

  useEffect(() => {
    api.get('/membership-plans').then(r => setPlans(r.data.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/subscriptions', {
        memberId,
        planId: data.planId,
        startDate: data.startDate,
        discount: data.discount ? parseFloat(data.discount) : undefined,
        discountReason: data.discountReason || undefined,
        notes: data.notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-brand" />
            <h3 className="text-white font-semibold">Assign Membership Plan</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">
              {memberName?.charAt(0)}
            </div>
            {memberName}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Membership Plan *</label>
              <select {...register('planId', { required: 'Plan is required' })} className="input">
                <option value="">Select a plan...</option>
                {plans.map(p => (
                  <option key={p._id} value={p._id} className="bg-dark-700">
                    {p.name} — {formatCurrency(p.price)} / {p.durationLabel}
                  </option>
                ))}
              </select>
              {errors.planId && <p className="text-red-400 text-xs mt-1">{errors.planId.message as string}</p>}
            </div>

            {selectedPlan && (
              <div className="p-3 rounded-lg bg-brand/10 border border-brand/20 text-xs space-y-1">
                <p className="text-brand font-semibold">{selectedPlan.name}</p>
                <p className="text-gray-400">{selectedPlan.durationLabel} · {formatCurrency(selectedPlan.price)}</p>
                {selectedPlan.features?.slice(0, 3).map((f: string) => (
                  <p key={f} className="text-gray-500">✓ {f}</p>
                ))}
              </div>
            )}

            <div>
              <label className="label">Start Date *</label>
              <input {...register('startDate', { required: 'Start date is required' })} type="date" className="input" />
            </div>

            <div>
              <label className="label">Discount Amount (₹)</label>
              <input {...register('discount')} type="number" step="0.01" className="input" placeholder="0.00 (optional)" />
            </div>

            {watch('discount') && (
              <div>
                <label className="label">Discount Reason</label>
                <input {...register('discountReason')} className="input" placeholder="e.g., Loyalty discount" />
              </div>
            )}

            <div>
              <label className="label">Notes</label>
              <input {...register('notes')} className="input" placeholder="Optional notes" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading || !selectedPlanId} className="btn-primary flex-1">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Assigning...</> : 'Assign Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
