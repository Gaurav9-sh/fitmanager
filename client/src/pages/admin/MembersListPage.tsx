import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusClass, getStatusLabel } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'active', 'expired', 'pending', 'suspended'];

export default function MembersListPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const limit = 20;
  const pages = Math.ceil(total / limit);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      const { data } = await api.get('/members', { params });
      setMembers(data.data);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchMembers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, status, page]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{total} total members</p>
        </div>
        <Link to="/admin/members/add" className="btn-primary btn-sm self-start sm:self-auto">
          <Plus size={14} /> Add Member
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search by name, phone, email, or member ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${status === s ? 'bg-brand text-black shadow-glow-sm' : 'bg-surface-elevated text-gray-400 hover:text-white border border-surface-border'
                }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Member ID</th>
              <th>Phone</th>
              <th>Joining Date</th>
              <th>Plan</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j}><div className="skeleton h-4 rounded w-full" /></td>
                  ))}
                </tr>
              ))
              : members.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} />
                        <p>No members found</p>
                        {search && <p className="text-xs">Try a different search term</p>}
                      </div>
                    </td>
                  </tr>
                )
                : members.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                          {m.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs text-brand">{m.memberId}</span></td>
                    <td className="text-gray-300">{m.phone}</td>
                    <td className="text-gray-400 text-xs">{formatDate(m.joiningDate)}</td>
                    <td className="text-xs text-gray-300">
                      {m.activeSubscription?.planSnapshot?.name || <span className="text-gray-600">—</span>}
                    </td>
                    <td className="text-xs">
                      {m.activeSubscription?.endDate ? (
                        <span className={
                          new Date(m.activeSubscription.endDate) < new Date(Date.now() + 7 * 86400000)
                            ? 'text-orange-400' : 'text-gray-400'
                        }>
                          {formatDate(m.activeSubscription.endDate)}
                        </span>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(m.status)}`}>{getStatusLabel(m.status)}</span>
                    </td>
                    <td>
                      <Link to={`/admin/members/${m._id}`} className="btn-ghost btn-sm">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`btn-sm px-3 rounded-lg ${p === page ? 'bg-brand text-black' : 'btn-secondary'}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
