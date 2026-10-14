import { useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

const METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'other'];

interface Props {
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecordPaymentModal({ invoice, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      amount: (invoice.pendingAmount / 100).toFixed(2),
      method: 'cash',
      transactionRef: '',
      notes: '',
      paidAt: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/payments', {
        invoiceId: invoice._id,
        amount: parseFloat(data.amount),
        method: data.method,
        transactionRef: data.transactionRef || undefined,
        notes: data.notes || undefined,
        paidAt: data.paidAt,
      });
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-brand" />
            <h3 className="text-white font-semibold">Record Payment</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5">
          <div className="mb-4 p-3 rounded-lg bg-surface-elevated text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Invoice</span>
              <span className="text-white font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Total Amount</span>
              <span className="text-white">{formatCurrency(invoice.netAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pending Amount</span>
              <span className="text-red-400 font-bold">{formatCurrency(invoice.pendingAmount)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Amount (₹) *</label>
              <input
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Amount must be positive' },
                  max: { value: invoice.pendingAmount / 100, message: `Max amount: ₹${(invoice.pendingAmount / 100).toFixed(2)}` },
                })}
                type="number" step="0.01" className="input"
              />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message as string}</p>}
            </div>

            <div>
              <label className="label">Payment Method *</label>
              <select {...register('method')} className="input">
                {METHODS.map(m => <option key={m} value={m} className="bg-dark-700 capitalize">{m.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Transaction Reference</label>
              <input {...register('transactionRef')} className="input" placeholder="UPI ref, cheque no., etc." />
            </div>

            <div>
              <label className="label">Payment Date *</label>
              <input {...register('paidAt')} type="date" className="input" />
            </div>

            <div>
              <label className="label">Notes</label>
              <input {...register('notes')} className="input" placeholder="Optional notes" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Recording...</> : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
