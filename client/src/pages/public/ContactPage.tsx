import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/enquiries', data);
      setSubmitted(true);
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand text-sm font-semibold uppercase tracking-wider mb-3">Get In Touch</p>
          <h1 className="text-5xl font-black mb-4">Contact <span className="text-gradient">Us</span></h1>
          <p className="text-gray-400 text-lg">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Visit Us</h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Address', value: '42 Fitness Avenue, Andheri West, Mumbai, Maharashtra 400058' },
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: Mail, label: 'Email', value: 'info@fitmanagergym.com' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-brand" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                      <p className="text-gray-200">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-brand" />
                <h3 className="text-white font-semibold">Operating Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { day: 'Monday – Friday', hours: '5:00 AM – 10:00 PM' },
                  { day: 'Saturday', hours: '6:00 AM – 8:00 PM' },
                  { day: 'Sunday', hours: '7:00 AM – 2:00 PM' },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-400">{day}</span>
                    <span className="text-white font-medium">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Thank You!</h3>
                <p className="text-gray-400">Your enquiry has been received. We'll contact you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary btn-sm mt-2">
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Send an Enquiry</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input {...register('name', { required: 'Required' })} className="input" placeholder="Your name" />
                      {errors.name && <p className="text-red-400 text-xs mt-1">Required</p>}
                    </div>
                    <div>
                      <label className="label">Phone *</label>
                      <input {...register('phone', { required: 'Required' })} className="input" placeholder="9876543210" />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">Required</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="label">Interested In</label>
                    <select {...register('interestedIn')} className="input">
                      <option value="">Select...</option>
                      <option>Monthly Membership</option>
                      <option>Quarterly Membership</option>
                      <option>Annual Membership</option>
                      <option>Personal Training</option>
                      <option>General Enquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea
                      {...register('message', { required: 'Required' })}
                      className="input min-h-[100px] resize-none"
                      placeholder="Tell us how we can help..."
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={15} /> Send Enquiry</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
