import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, User, CreditCard, Calendar, Activity, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const portalNav = [
  { to: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/profile', icon: User, label: 'My Profile' },
  { to: '/portal/payments', icon: CreditCard, label: 'Payments' },
  { to: '/portal/attendance', icon: Calendar, label: 'Attendance' },
];

export default function MemberLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-DEFAULT border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/portal/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Activity size={15} className="text-black" />
            </div>
            <span className="text-white font-bold text-sm">Fit<span className="text-brand">Manager</span></span>
            <span className="text-gray-500 text-xs ml-1">• Member Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">Member</p>
            </div>
            <button onClick={() => logout()} className="btn-ghost btn-sm text-gray-400">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-8">
        {/* Subnav */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {portalNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand text-black shadow-glow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
