import React, { useState } from 'react';
import { Zap, Package, Check, DollarSign, CreditCard, ArrowLeft } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('creator');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: 10,
      tokens: 1000,
      popular: false,
      features: [
        '500 magic customizations (2 tokens each)',
        '2 printed stickers (400 tokens each)',
        'Mix and match as you like',
        'Tokens never expire'
      ]
    },
    {
      id: 'creator',
      name: 'Creator Pack',
      price: 25,
      tokens: 2750,
      bonus: 250,
      popular: true,
      features: [
        '1,375 magic customizations',
        '6 printed stickers',
        'Bonus 250 tokens FREE',
        'Priority support',
        'Tokens never expire'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      price: 50,
      tokens: 6000,
      bonus: 1000,
      popular: false,
      features: [
        '3,000 magic customizations',
        '15 printed stickers',
        'Bonus 1,000 tokens FREE',
        'Premium support',
        'Tokens never expire'
      ]
    }
  ];

  const handlePurchase = (planId) => {
    const plan = plans.find(p => p.id === planId);
    // Simulate purchase process
    alert(`Purchasing ${plan.name} for $${plan.price} - This would integrate with a payment processor!`);
  };

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm gap-2 mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple Token Pricing</h1>
            <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto">
              Buy tokens once, use them as you need. No subscriptions, no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow ${
                  plan.popular ? 'border-2 border-primary' : ''
                }`}
              >
                {plan.popular && (
                  <div className="badge badge-primary badge-lg absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Best Value
                  </div>
                )}
                
                <div className="card-body text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">${plan.price}</div>
                  <div className="text-lg sm:text-2xl font-semibold text-secondary mb-4">
                    {plan.tokens.toLocaleString()} Tokens
                  </div>
                  {plan.bonus && (
                    <div className="text-sm text-success font-medium mb-4">
                      +{plan.bonus} bonus tokens included!
                    </div>
                  )}
                  
                  <ul className="text-left space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    className={`btn btn-block gap-2 ${
                      plan.popular ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    <CreditCard size={16} />
                    Buy {plan.tokens.toLocaleString()} Tokens
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Token Usage Guide */}
          <div className="card bg-primary/5 border border-primary/20 mb-8">
            <div className="card-body">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">How to Use Your Tokens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Zap size={24} className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold">Magic Photo Customization</div>
                    <div className="text-2xl font-bold text-secondary">2 Tokens</div>
                    <div className="text-sm text-base-content/70">Remove backgrounds, enhance colors, add effects</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Print & Ship Sticker</div>
                    <div className="text-2xl font-bold text-primary">400 Tokens</div>
                    <div className="text-sm text-base-content/70">High-quality vinyl sticker delivered to you</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl sm:text-2xl font-bold mb-6">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div className="collapse collapse-arrow bg-base-200">
                  <input type="radio" name="faq-accordion" defaultChecked />
                  <div className="collapse-title text-lg font-medium">
                    Do tokens expire?
                  </div>
                  <div className="collapse-content">
                    <p>No! Your tokens never expire. Buy once and use them whenever you want to create magic or order stickers.</p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-base-200">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium">
                    Can I mix magic customizations and sticker orders?
                  </div>
                  <div className="collapse-content">
                    <p>Absolutely! Use your tokens however you want. You could do 100 magic customizations and then order 1 sticker, or any combination that fits your needs.</p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-base-200">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium">
                    What payment methods do you accept?
                  </div>
                  <div className="collapse-content">
                    <p>We accept all major credit cards, PayPal, Apple Pay, and Google Pay for secure and convenient payments.</p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-base-200">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium">
                    Can I get a refund?
                  </div>
                  <div className="collapse-content">
                    <p>Yes! We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us for a full refund.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Pricing; 