import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Zap, Shield, Clock, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

const stats = [
  { value: '500+', label: 'Happy Members' },
  { value: '3', label: 'Expert Trainers' },
  { value: '5★', label: 'Google Rating' },
  { value: '8+', label: 'Years Experience' },
];

const facilities = [
  { icon: Zap, title: 'Cardio Zone', desc: 'State-of-the-art treadmills, bikes and ellipticals' },
  { icon: Shield, title: 'Free Weights', desc: 'Complete set of dumbbells up to 50kg' },
  { icon: Award, title: 'Group Classes', desc: 'Yoga, Zumba, HIIT and more every day' },
  { icon: Clock, title: 'Steam & Sauna', desc: 'Relax and recover with our steam room' },
  { icon: Users, title: 'Personal Training', desc: 'One-on-one sessions with certified trainers' },
  { icon: Star, title: 'Nutrition Bar', desc: 'Fresh protein shakes and healthy snacks' },
];

const testimonials = [
  { name: 'Rahul M.', text: 'Lost 15kg in 4 months! The trainers are amazing and the facility is top-notch.', rating: 5 },
  { name: 'Priya S.', text: 'Best gym in Mumbai. Clean, modern, and the staff is incredibly helpful.', rating: 5 },
  { name: 'Aditya K.', text: 'The personal training sessions completely transformed my physique. Highly recommend!', rating: 5 },
];

export default function HomePage() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    api.get('/membership-plans?active=true').then(r => setPlans(r.data.data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/85 to-dark-900/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-brand text-xs font-medium mb-6">
              <Zap size={12} />
              Mumbai's Premier Fitness Destination
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              Build The Body<br />
              <span className="text-gradient">You Deserve.</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              World-class equipment, expert trainers, and a community that pushes you to be your best. Your transformation starts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary btn-lg group">
                Join Now — Start Today
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/memberships" className="btn-secondary btn-lg">
                Explore Plans
              </Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 glass border-t border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-brand">{value}</p>
                  <p className="text-gray-400 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-24 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">World-Class Amenities</p>
            <h2 className="text-4xl font-bold text-white">Everything You Need to <span className="text-gradient">Succeed</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilities.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 group hover:border-brand/30 hover:shadow-glow-sm transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <Icon size={22} className="text-brand" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      {plans.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">Pricing</p>
              <h2 className="text-4xl font-bold text-white">Simple, Transparent <span className="text-gradient">Pricing</span></h2>
              <p className="text-gray-400 mt-4">No hidden fees. Cancel anytime.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan._id} className={`card p-6 flex flex-col ${plan.isPopular ? 'border-brand shadow-glow' : ''}`}>
                  {plan.isPopular && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand text-black text-xs font-bold mb-4 self-start">
                      <Star size={10} /> Most Popular
                    </div>
                  )}
                  <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.durationLabel}</p>
                  <div className="mb-5">
                    <span className="text-4xl font-black text-white">{formatCurrency(plan.price)}</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features?.map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle size={14} className="text-brand flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className={`btn w-full justify-center ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}>
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/memberships" className="text-brand hover:text-brand-light text-sm font-medium flex items-center gap-1 justify-center">
                View all plans <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-4xl font-bold text-white">What Our Members <span className="text-gradient">Say</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-brand fill-brand" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <p className="text-white font-medium text-sm">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
            Ready to Start Your <span className="text-gradient">Journey?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">Join hundreds of members who have already transformed their lives.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary btn-lg">
              Join Now <ChevronRight size={18} />
            </Link>
            <Link to="/contact" className="btn-secondary btn-lg">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
