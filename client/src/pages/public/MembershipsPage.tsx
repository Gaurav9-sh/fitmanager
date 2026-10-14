import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

export default function MembershipsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/membership-plans?active=true')
      .then(r => setPlans(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">Membership Plans</p>
          <h1 className="text-5xl font-black mb-4">Choose Your <span className="text-gradient">Plan</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            All plans include access to our main gym floor, changing rooms, and water station. Upgrade anytime.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-80 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`card p-7 flex flex-col transition-all duration-300 hover:shadow-card-hover ${
                  plan.isPopular ? 'border-brand shadow-glow ring-1 ring-brand/30' : 'hover:border-brand/30'
                }`}
              >
                {plan.isPopular && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black bg-brand rounded-full px-3 py-1 self-start mb-5">
                    <Star size={10} fill="currentColor" /> MOST POPULAR
                  </div>
                )}
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <p className="text-gray-500 text-sm capitalize">{plan.category?.replace('_', ' ')} · {plan.durationLabel}</p>
                </div>
                {plan.description && (
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{plan.description}</p>
                )}
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-500 text-sm ml-2">/ {plan.durationLabel}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features?.map((f: string) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle size={15} className="text-brand flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`btn w-full justify-center ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 card p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Not Sure Which Plan?</h3>
          <p className="text-gray-400 mb-6">Visit us for a free trial day and speak with our team.</p>
          <Link to="/contact" className="btn-primary btn-lg inline-flex">
            Book a Free Visit <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
