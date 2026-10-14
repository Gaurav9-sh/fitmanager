import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Calendar, Activity } from 'lucide-react';

export default function MemberAttendance() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.memberId) return;
    api.get(`/attendance/member/${user.memberId}?limit=50`)
      .then(r => setRecords(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.memberId]);

  const duration = (a: any) => {
    if (!a.checkOutTime) return null;
    const mins = Math.round((new Date(a.checkOutTime).getTime() - new Date(a.checkInTime).getTime()) / 60000);
    return `${Math.floor(mins/60)}h ${mins%60}m`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">{records.length} visits recorded</p>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-500 gap-2">
          <Calendar size={32} />
          <p>No attendance records yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(a => (
            <div key={a._id} className="card p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <Activity size={15} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{a.date}</p>
                <p className="text-xs text-gray-500">
                  Check-in: {new Date(a.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {a.checkOutTime && ` · Check-out: ${new Date(a.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
              <div className="text-right">
                {duration(a) && <p className="text-xs text-brand font-medium">{duration(a)}</p>}
                <p className="text-xs text-gray-600 capitalize">{a.method?.replace('_', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
