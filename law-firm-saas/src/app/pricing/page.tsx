'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month';
  description: string;
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 147,
    interval: 'month',
    description: 'Perfect for solo practitioners and small law firms',
    features: [
      'Case & client management',
      'Calendar integration',
      'Document storage',
      'Supabase Auth',
      'Basic support'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'STRIPE_PRICE_BASIC'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 297,
    interval: 'month',
    description: 'Ideal for growing law firms with multiple users',
    features: [
      'All Basic features',
      'Unlimited users',
      'Advanced billing',
      'Contract templates',
      'Automated reminders',
      'Priority support',
      'Advanced analytics'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'STRIPE_PRICE_PRO',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 597,
    interval: 'month',
    description: 'Complete solution for large law firms',
    features: [
      'All Pro features',
      'AI assistant',
      'Custom integrations',
      'Dedicated hosting',
      'Account manager',
      'White-label options',
      '24/7 phone support'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'STRIPE_PRICE_ENTERPRISE'
  }
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showInactiveMessage, setShowInactiveMessage] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'subscription_inactive') {
      setShowInactiveMessage(true);
    }
  }, [searchParams]);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoading(plan.id);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Error creating checkout session. Please try again.');
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your law firm. All plans include secure data storage, 
            regular backups, and GDPR compliance.
          </p>
        </div>

        {/* Inactive Subscription Message */}
        {showInactiveMessage && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Your subscription is inactive
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please renew your subscription to continue accessing your law firm management features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    €{plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{plan.interval}
                  </span>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">What&apos;s included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access 
                to your data until the end of your current billing period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade security measures including encryption, 
                secure data centers, and regular security audits to protect your sensitive legal data.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer a free trial?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day free trial for all new users. No credit card required to start.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
