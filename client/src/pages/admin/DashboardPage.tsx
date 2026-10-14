import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, TrendingUp, Calendar, DollarSign,
  AlertCircle, Clock, Activity, Plus, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../lib/api';
import { formatCurrency, formatDate, getStatusClass, getStatusLabel } from '../../lib/utils';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_COLORS = ['#84cc16', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function KPICard({ label, value, icon: Icon, color, sub, loading }: any) {
  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${color} flex-shrink-0`}>
          <Icon size={20} className="opacity-90" />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-7 w-24" />
          <div className="skeleton h-4 w-32" />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
          {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [planRevenue, setPlanRevenue] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [kpiRes, revRes, attRes, planRes, actRes] = await Promise.all([
        api.get('/dashboard/kpi'),
        api.get('/dashboard/charts/revenue?months=12'),
        api.get('/dashboard/charts/attendance?days=30'),
        api.get('/dashboard/charts/plan-revenue'),
        api.get('/dashboard/recent-activity'),
      ]);
      setKpi(kpiRes.data.data);
      
      // Process revenue chart
      const rev = kpiRes.data; // placeholder
      const revMap = new Map(revRes.data.data.revenue.map((r: any) => [`${r._id.year}-${r._id.month}`, r.total]));
      const expMap = new Map(revRes.data.data.expenses.map((e: any) => [`${e._id.year}-${e._id.month}`, e.total]));
      
      const chartData = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        chartData.push({
          month: MONTH_NAMES[d.getMonth()],
          revenue: Math.round((revMap.get(key) || 0) / 100),
          expenses: Math.round((expMap.get(key) || 0) / 100),
        });
      }
      setRevenueData(chartData);
      
      // Attendance chart
      const attData = attRes.data.data.map((a: any) => ({
        date: a._id.slice(5), // MM-DD
        count: a.count,
      }));
      setAttendanceData(attData);
      
      // Plan revenue
      setPlanRevenue(planRes.data.data.map((p: any) => ({
        name: p._id || 'Unknown',
        value: Math.round(p.total / 100),
        count: p.count,
      })));
      
      setActivity(actRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpiCards = kpi ? [
    { label: 'Total Members', value: kpi.totalMembers, icon: Users, color: 'bg-blue-500/15 text-blue-400' },
    { label: 'Active Members', value: kpi.activeMembers, icon: UserCheck, color: 'bg-green-500/15 text-green-400' },
    { label: 'Expired Memberships', value: kpi.expiredMembers, icon: UserX, color: 'bg-red-500/15 text-red-400' },
    { label: 'New This Month', value: kpi.newMembersThisMonth, icon: TrendingUp, color: 'bg-brand/15 text-brand' },
    { label: 'Present Today', value: kpi.todayAttendance, icon: Calendar, color: 'bg-purple-500/15 text-purple-400' },
    { label: 'Revenue Today', value: formatCurrency(kpi.revenueToday || 0), icon: DollarSign, color: 'bg-brand/15 text-brand' },
    { label: 'Revenue This Month', value: formatCurrency(kpi.revenueThisMonth || 0), icon: TrendingUp, color: 'bg-green-500/15 text-green-400' },
    { label: 'Pending Dues', value: formatCurrency(kpi.pendingDues || 0), icon: AlertCircle, color: 'bg-orange-500/15 text-orange-400' },
    { label: 'Expiring in 7 Days', value: kpi.expiringIn7Days, icon: Clock, color: 'bg-yellow-500/15 text-yellow-400' },
    { label: 'Est. Profit (Month)', value: formatCurrency(kpi.estimatedProfit || 0), icon: Activity, color: 'bg-brand/15 text-brand' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening at your gym.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchDashboard(true)}
            className="btn-secondary btn-sm"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/admin/members/add" className="btn-primary btn-sm">
            <Plus size={14} /> Add Member
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="kpi-card">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <div className="skeleton h-7 w-20" />
                  <div className="skeleton h-4 w-28" />
                </div>
              </div>
            ))
          : kpiCards.map((card) => <KPICard key={card.label} {...card} loading={false} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue & Expenses</h3>
              <p className="text-xs text-gray-500">Last 12 months</p>
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-56 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                <Area type="monotone" dataKey="revenue" stroke="#84cc16" fill="url(#rev)" strokeWidth={2} name="Revenue (₹)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exp)" strokeWidth={2} name="Expenses (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Plan Revenue Pie */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Plan</h3>
          {loading ? (
            <div className="skeleton h-56 rounded-lg" />
          ) : planRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planRevenue} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {planRevenue.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} contentStyle={{ background: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1 mt-2">
            {planRevenue.slice(0, 4).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-gray-400 truncate max-w-[100px]">{p.name}</span>
                </div>
                <span className="text-white font-medium">₹{p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Attendance</h3>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <Link to="/admin/attendance" className="text-xs text-brand hover:text-brand-light flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#84cc16" radius={[3, 3, 0, 0]} name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expiring Soon */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Expiring Memberships</h3>
              <p className="text-xs text-gray-500">Next 7 days</p>
            </div>
            <Link to="/admin/subscriptions?expiring=7" className="text-xs text-brand hover:text-brand-light flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : !activity?.expiringSubscriptions?.length ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
              <UserCheck size={32} className="text-green-500" />
              <p className="text-sm">No memberships expiring soon! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activity.expiringSubscriptions.map((sub: any) => {
                const days = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={sub._id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border hover:border-brand/20 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center text-brand text-xs font-bold">
                        {sub.member?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{sub.member?.name}</p>
                        <p className="text-xs text-gray-500">{sub.member?.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${days <= 2 ? 'text-red-400' : days <= 5 ? 'text-orange-400' : 'text-yellow-400'}`}>
                        {days === 0 ? 'Expires today!' : `${days}d left`}
                      </p>
                      <p className="text-xs text-gray-600">{formatDate(sub.endDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Members */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Members</h3>
            <Link to="/admin/members" className="text-xs text-brand hover:text-brand-light flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {activity?.recentMembers?.map((m: any) => (
                <Link key={m._id} to={`/admin/members/${m._id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-elevated transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                    {m.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate group-hover:text-brand transition-colors">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.memberId}</p>
                  </div>
                  <span className={`badge text-xs ${getStatusClass(m.status)}`}>{getStatusLabel(m.status)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Today's Check-ins</h3>
            <Link to="/admin/attendance" className="text-xs text-brand hover:text-brand-light flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : !activity?.recentAttendance?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
              <Calendar size={28} />
              <p className="text-sm">No check-ins yet today</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {activity.recentAttendance.slice(0, 8).map((a: any) => (
                <div key={a._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-elevated">
                  <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                    {a.member?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{a.member?.name}</p>
                    <p className="text-xs text-gray-500">{a.member?.memberId}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(a.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Member', to: '/admin/members/add', icon: Users, color: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' },
            { label: 'Mark Attendance', to: '/admin/attendance', icon: Calendar, color: 'bg-green-500/15 text-green-400 hover:bg-green-500/25' },
            { label: 'Record Payment', to: '/admin/payments', icon: DollarSign, color: 'bg-brand/15 text-brand hover:bg-brand/25' },
            { label: 'View Reports', to: '/admin/reports', icon: TrendingUp, color: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl ${color} transition-colors cursor-pointer text-center`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
