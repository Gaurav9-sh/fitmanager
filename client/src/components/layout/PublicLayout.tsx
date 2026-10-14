import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Activity, Menu, X, ChevronRight } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/memberships', label: 'Memberships' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center group-hover:shadow-glow-sm transition-shadow">
                <Activity size={18} className="text-black" />
              </div>
              <span className="text-white font-bold text-lg">
                Fit<span className="text-brand">Manager</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-brand bg-brand/10'
                        : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Join Now <ChevronRight size={14} />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border bg-surface-DEFAULT animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'text-brand bg-brand/10' : 'text-gray-300 hover:text-white hover:bg-surface-elevated'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary btn-sm flex-1 justify-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary btn-sm flex-1 justify-center" onClick={() => setMobileMenuOpen(false)}>
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Content with top padding for fixed nav */}
      <div className="pt-16">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface-DEFAULT mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                  <Activity size={18} className="text-black" />
                </div>
                <span className="text-white font-bold text-lg">Fit<span className="text-brand">Manager</span></span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Mumbai's premium fitness destination. Transform your body and mind with expert guidance and world-class facilities.
              </p>
              <div className="flex gap-3 mt-4">
                {['Instagram', 'Facebook', 'YouTube'].map(s => (
                  <a key={s} href="#" className="text-xs text-gray-500 hover:text-brand transition-colors">{s}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-400 hover:text-brand transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>42 Fitness Avenue, Andheri West</li>
                <li>Mumbai, Maharashtra 400058</li>
                <li className="hover:text-brand transition-colors">+91 98765 43210</li>
                <li className="hover:text-brand transition-colors">info@fitmanagergym.com</li>
              </ul>
              <div className="mt-3">
                <p className="text-xs text-gray-500 font-medium mb-1">Hours</p>
                <p className="text-sm text-gray-400">Mon-Fri: 5:00 AM – 10:00 PM</p>
                <p className="text-sm text-gray-400">Sat: 6:00 AM – 8:00 PM</p>
                <p className="text-sm text-gray-400">Sun: 7:00 AM – 2:00 PM</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">© 2024 FitManager Gym. All rights reserved.</p>
            <Link to="/admin" className="text-xs text-gray-600 hover:text-brand transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
