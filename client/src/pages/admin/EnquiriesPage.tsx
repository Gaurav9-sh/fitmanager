import { useEffect, useState } from 'react';
import { MessageSquare, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusClass, getStatusLabel } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'not_interested'];

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetch = () => {
    setLoading(true);
    const params: any = {};
    if (filter !== 'all') params.status = filter;
    api.get('/enquiries', { params }).then(r => setEnquiries(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/enquiries/${id}`, { status });
      toast.success('Status updated');
      fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Enquiries</h1>
          <p className="page-subtitle">Manage leads and follow-ups</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-2">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === s ? 'bg-brand text-black' : 'bg-surface-elevated text-gray-400 border border-surface-border hover:text-white'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Interested In</th><th>Message</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>) :
              enquiries.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-gray-500">No enquiries found</td></tr> :
              enquiries.map(enq => (
                <tr key={enq._id}>
                  <td>
                    <p className="text-sm text-white font-medium">{enq.name}</p>
                    <p className="text-xs text-gray-500">{enq.email}</p>
                  </td>
                  <td className="text-sm text-gray-300">{enq.phone}</td>
                  <td className="text-xs text-gray-400">{enq.interestedIn || '—'}</td>
                  <td className="text-xs text-gray-400 max-w-[200px]">
                    <p className="truncate">{enq.message}</p>
                  </td>
                  <td className="text-xs text-gray-500">{formatDate(enq.createdAt, 'relative')}</td>
                  <td>
                    <select
                      value={enq.status}
                      onChange={e => updateStatus(enq._id, e.target.value)}
                      className={`text-xs rounded-lg px-2 py-1 border cursor-pointer focus:outline-none bg-dark-700 ${getStatusClass(enq.status)}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="bg-dark-700 text-white">{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
