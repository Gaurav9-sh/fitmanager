import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Activity, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      const user = JSON.parse(localStorage.getItem('fm_user') || '{}');
      if (user.role === 'member') {
        navigate('/portal/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
      toast.success(`Welcome back, ${user.name}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const fillDemo = (role: 'admin' | 'staff' | 'trainer') => {
    const creds = {
      admin: { email: 'admin@fitmanager.com', password: 'Admin@123' },
      staff: { email: 'staff@fitmanager.com', password: 'Staff@123' },
      trainer: { email: 'karan.trainer@fitmanager.com', password: 'Trainer@123' },
    };
    setValue('email', creds[role].email);
    setValue('password', creds[role].password);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/70 to-dark-900/20" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Activity size={20} className="text-black" />
            </div>
            <span className="text-white font-bold text-xl">Fit<span className="text-brand">Manager</span></span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Your fitness journey<br />
              <span className="text-gradient">starts here.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-sm">
              Manage your gym like a pro. Track members, payments, attendance, and growth in one place.
            </p>
            <div className="mt-8 flex gap-6">
              {[{ v: '500+', l: 'Members' }, { v: '5★', l: 'Rating' }, { v: '3', l: 'Expert Trainers' }].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-brand">{v}</p>
                  <p className="text-gray-400 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="max-w-sm w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={14} />
            Back to website
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Activity size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-lg">Fit<span className="text-brand">Manager</span></span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

          {/* Demo buttons */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'staff', 'trainer'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-brand/30 text-brand hover:bg-brand/10 transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand hover:text-brand-light transition-colors font-medium">
              Register as member
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
