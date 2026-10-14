import { Award, Target, Heart, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative py-24 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">Our Story</p>
            <h1 className="text-5xl font-black mb-6">Built By Fitness Lovers, <span className="text-gradient">For Fitness Lovers</span></h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Founded in 2016, FitManager Gym was born from a passion for helping people achieve their best physical and mental health. What started as a small 2,000 sq ft studio has grown into Mumbai's premier fitness destination.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To make world-class fitness accessible to everyone in our community.' },
              { icon: Heart, title: 'Our Values', desc: 'Integrity, commitment, community, and continuous improvement.' },
              { icon: Users, title: 'Our Community', desc: '500+ members strong and growing every month.' },
              { icon: Award, title: 'Our Achievements', desc: 'Best Gym in Mumbai Award 2022 & 2023.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-brand/15 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {[
              { year: '2016', event: 'FitManager Gym founded with 200 sq mt studio in Andheri West.' },
              { year: '2018', event: 'Expanded to 1000 sq mt. Added group fitness studio and steam room.' },
              { year: '2020', event: 'Launched online coaching programs during pandemic. Reached 300+ members.' },
              { year: '2022', event: 'Opened second floor with dedicated personal training area. Won Best Gym Award.' },
              { year: '2024', event: 'Over 500 active members. Launched FitManager digital management system.' },
            ].map(({ year, event }) => (
              <div key={year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-black text-xs font-bold flex-shrink-0">{year.slice(2)}</div>
                  <div className="w-0.5 flex-1 bg-surface-border mt-2" />
                </div>
                <div className="pb-8">
                  <p className="text-brand font-bold text-sm mb-1">{year}</p>
                  <p className="text-gray-300">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
