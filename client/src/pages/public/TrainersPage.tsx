import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../lib/api';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trainers')
      .then(r => setTrainers(r.data.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">Expert Team</p>
          <h1 className="text-5xl font-black mb-4">Meet Your <span className="text-gradient">Trainers</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Certified professionals dedicated to helping you reach your fitness goals safely and effectively.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-96 rounded-xl" />)}
          </div>
        ) : trainers.length === 0 ? (
          <p className="text-center text-gray-500">Trainer profiles coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer._id} className="card overflow-hidden group hover:border-brand/30 transition-all duration-300">
                <div className="h-52 bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center">
                  {trainer.photo ? (
                    <img src={trainer.photo} alt={trainer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-brand/20 flex items-center justify-center text-4xl font-black text-brand">
                      {trainer.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{trainer.name}</h3>
                      <p className="text-brand text-sm">{trainer.specialties?.[0]}</p>
                    </div>
                    {trainer.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="text-brand fill-brand" />
                        <span className="text-white font-bold">{trainer.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">{trainer.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {trainer.specialties?.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-brand/10 text-brand border border-brand/20">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-surface-border flex items-center justify-between text-sm text-gray-500">
                    <span>{trainer.experience} years experience</span>
                    <span>{trainer.qualifications?.length || 0} certifications</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
