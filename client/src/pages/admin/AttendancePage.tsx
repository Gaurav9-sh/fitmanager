import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, QrCode, UserCheck, UserX, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const { register, watch, reset } = useForm();
  const searchQuery = watch('search');

  const fetchToday = () => {
    setLoading(true);
    api.get('/attendance/today')
      .then(r => setTodayRecords(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchToday(); }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      api.get(`/members/search/global?q=${searchQuery}`)
        .then(r => setSearchResults(r.data.data))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleCheckin = async (memberId: string, memberName: string) => {
    setCheckinLoading(true);
    try {
      const { data } = await api.post('/attendance/checkin', { memberId, method: 'manual' });
      toast.success(`✅ ${memberName} checked in!`);
      if (data.warning) toast(`⚠️ ${data.warning}`, { icon: '⚠️' });
      setSearchResults([]); reset();
      fetchToday();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleQRScan = async () => {
    if (!qrToken.trim()) { toast.error('Enter a QR token'); return; }
    setQrLoading(true);
    try {
      // Parse token from QR JSON if needed
      let token = qrToken.trim();
      try { const parsed = JSON.parse(token); token = parsed.token || token; } catch {}
      const { data } = await api.post('/attendance/qr-scan', { qrToken: token });
      toast.success(`✅ ${data.member?.name} checked in via QR!`);
      if (data.warning) toast(`⚠️ ${data.warning}`, { icon: '⚠️' });
      setQrToken('');
      fetchToday();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR scan failed');
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{todayRecords.length} check-ins today</p>
        </div>
        <button onClick={fetchToday} className="btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Manual Check-in */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={15} className="text-brand" /> Manual Check-in
          </h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input {...register('search')} className="input pl-9" placeholder="Search by name, phone, or member ID..." autoComplete="off" />
          </div>
          {searching && <p className="text-xs text-gray-500 mt-2">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {searchResults.map(m => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border hover:border-brand/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">{m.name?.charAt(0)}</div>
                    <div>
                      <p className="text-sm text-white font-medium">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.memberId} · {m.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => handleCheckin(m._id, m.name)} disabled={checkinLoading}
                    className={`btn-sm px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${m.status === 'active' ? 'btn-primary' : 'bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25'}`}>
                    {checkinLoading ? <Loader2 size={12} className="animate-spin" /> : <><UserCheck size={12} /> Check In</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Scan */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <QrCode size={15} className="text-brand" /> QR Code Check-in
          </h3>
          <p className="text-xs text-gray-500 mb-3">Enter the QR token from a member's QR code, or scan using a QR reader.</p>
          <div className="flex gap-2">
            <input value={qrToken} onChange={e => setQrToken(e.target.value)} className="input flex-1"
              placeholder="Paste QR token or scan..." onKeyDown={e => e.key === 'Enter' && handleQRScan()} />
            <button onClick={handleQRScan} disabled={qrLoading || !qrToken} className="btn-primary">
              {qrLoading ? <Loader2 size={15} className="animate-spin" /> : 'Scan'}
            </button>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-brand/5 border border-brand/15 text-xs text-gray-400">
            💡 Members can show their QR code from their member portal. Staff can scan or manually enter the token.
          </div>
        </div>
      </div>

      {/* Today's Check-ins */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Today's Check-ins — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : todayRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <UserX size={32} className="mb-2" />
            <p>No check-ins yet today</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {todayRecords.map(record => (
              <div key={record._id} className={`p-3 rounded-lg border transition-colors ${record.membershipWarning ? 'border-orange-500/30 bg-orange-500/5' : 'border-surface-border bg-surface-elevated'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                    {record.member?.name?.charAt(0)}
                  </div>
                  <p className="text-sm text-white font-medium truncate">{record.member?.name}</p>
                </div>
                <p className="text-xs text-gray-500">{record.member?.memberId}</p>
                <p className="text-xs text-green-400 mt-1">
                  In: {new Date(record.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {record.checkOutTime && ` · Out: ${new Date(record.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                {record.membershipWarning && (
                  <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} />{record.membershipWarning}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
