// src/pages/parent/SubscriptionPage.tsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const PLANS = [
  { id: 'free',    name: 'Free',    price: '$0',     period: '',      features: ['1 child', '3 words/day', 'Basic badges', 'Limited reports'],                 current: false },
  { id: 'family',  name: 'Family',  price: '$9.99',  period: '/mo',   features: ['Up to 3 children', 'Full game loop', 'Parent dashboard', 'Weekly reports'],   current: true  },
  { id: 'premium', name: 'Premium', price: '$14.99', period: '/mo',   features: ['1 child', 'Priority AI feedback', 'Advanced analytics', 'All features'],      current: false },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-10">
        <button onClick={() => navigate('/parent')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Subscription</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your VocaQuest plan</p>
        <div className="space-y-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl p-5 ${plan.current ? 'ring-2 ring-indigo-500 shadow-card' : 'shadow-card'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{plan.name}</p>
                  <p className="text-2xl font-black text-indigo-600">{plan.price}<span className="text-sm font-normal text-gray-400">{plan.period}</span></p>
                </div>
                {plan.current && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">Current Plan</span>}
              </div>
              <div className="space-y-1.5 mb-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />{f}
                  </div>
                ))}
              </div>
              {!plan.current && <Button fullWidth variant={plan.id === 'premium' ? 'primary' : 'secondary'}>Upgrade to {plan.name}</Button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
