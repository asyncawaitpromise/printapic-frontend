import React, { useEffect } from 'react';
import { Camera, Package, Zap, Heart, Star, ArrowRight, Check, DollarSign, User, Menu, X, Info, Mail } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Homepage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to camera page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/camera', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <div className="navbar bg-base-100/95 backdrop-blur-sm shadow-sm fixed top-0 z-50">
        <div className="navbar-start">
          <div className="dropdown">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-ghost lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
            {mobileMenuOpen && (
              <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <Info size={16} /> How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <Zap size={16} /> Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <DollarSign size={16} /> Pricing
                  </a>
                </li>
                <li>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <Mail size={16} /> Contact
                  </Link>
                </li>
                <li>
                  <Link to="/camera" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <Camera size={16} /> Get Started
                  </Link>
                </li>
              </ul>
            )}
          </div>
          <a className="btn btn-ghost text-xl font-bold">Print A Pic</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a href="#how-it-works" className="text-base-content/70 hover:text-base-content">How It Works</a></li>
            <li><a href="#features" className="text-base-content/70 hover:text-base-content">Features</a></li>
            <li><a href="#pricing" className="text-base-content/70 hover:text-base-content">Pricing</a></li>
            <li><Link to="/contact" className="text-base-content/70 hover:text-base-content">Contact</Link></li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="hidden lg:flex gap-2">
            <Link to="/signin" className="btn btn-ghost gap-2">
              <User size={18} />
              Sign In
            </Link>
            <Link to="/camera" className="btn btn-primary gap-2">
              <Camera size={18} />
              Get Started
            </Link>
          </div>
          <div className="lg:hidden">
            <Link to="/signin" className="btn btn-ghost btn-sm gap-1">
              <User size={16} />
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 pt-16">
        <div className="hero-content text-center max-w-6xl px-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 px-4">
              Magical Photo Customization & 
              <span className="text-primary"> Sticker Printing</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-base-content/70 mb-8 max-w-3xl mx-auto px-4">
              Use our token-based system to customize photos with magic and print high-quality stickers. 
              Just 2 tokens to enhance any photo with magic, and 400 tokens to print and ship beautiful 
              stickers right to your door!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link to="/camera" className="btn btn-primary btn-md sm:btn-lg gap-2 w-full sm:w-auto">
                <Camera size={20} />
                Get Started with Tokens
              </Link>
              <button className="btn btn-outline btn-md sm:btn-lg gap-2 w-full sm:w-auto">
                <Package size={20} />
                View Examples
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 text-xs sm:text-sm text-base-content/60 px-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-warning fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span>Token-based pricing</span>
              <span className="hidden sm:inline">•</span>
              <span>Magic photo enhancement</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-base-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Our simple token system makes it easy to customize photos and order stickers. 
              Use tokens for exactly what you need, when you need it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign size={32} className="text-primary" />
                </div>
                <h3 className="card-title justify-center text-2xl mb-3">1. Buy Tokens</h3>
                <p className="text-base-content/70">
                  Purchase tokens to power your creations. $10 gets you 1,000 tokens - 
                  enough for hundreds of magic customizations or multiple printed stickers.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Zap size={32} className="text-secondary" />
                </div>
                <h3 className="card-title justify-center text-2xl mb-3">2. Customize with Magic</h3>
                <p className="text-base-content/70">
                  Upload your photo and use just 2 tokens to let our magic enhance it - 
                  remove backgrounds, adjust colors, add effects, and more!
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-accent" />
                </div>
                <h3 className="card-title justify-center text-2xl mb-3">3. Print & Ship</h3>
                <p className="text-base-content/70">
                  Use 400 tokens to turn your customized photo into a premium sticker 
                  and have it shipped directly to you. Quality guaranteed!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Print A Pic?</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Our token-based system gives you complete control over your spending while delivering 
              professional results every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Token-Based Pricing</h3>
                <p className="text-base-content/70">
                  Pay only for what you use. No subscriptions, no waste. 2 tokens for magic customization, 400 for printing.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Zap size={24} className="text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Magic Photo Enhancement</h3>
                <p className="text-base-content/70">
                  Advanced magic removes backgrounds, enhances colors, and optimizes your photos for just 2 tokens.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Check size={24} className="text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-base-content/70">
                  Weather-resistant vinyl stickers with UV-resistant inks that last years, not months.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
                <p className="text-base-content/70">
                  Your printed stickers ship within 24 hours. Most orders arrive within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Check size={24} className="text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Flexible Sizing</h3>
                <p className="text-base-content/70">
                  Choose from multiple sticker sizes to fit laptops, water bottles, cars, or anywhere you want.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Heart size={24} className="text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">100% Guarantee</h3>
                <p className="text-base-content/70">
                  Not happy with your results? We'll refund your tokens or remake your order for free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-base-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Token Pricing</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Buy tokens once, use them as you need. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h3 className="text-2xl font-bold mb-2">Starter Pack</h3>
                <div className="text-4xl font-bold text-primary mb-4">$10</div>
                <div className="text-2xl font-semibold text-secondary mb-4">1,000 Tokens</div>
                <p className="text-base-content/70 mb-6">Perfect for trying us out</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-secondary" /> 500 magic customizations (2 tokens each)</li>
                  <li className="flex items-center gap-2"><Package size={16} className="text-primary" /> 2 printed stickers (400 tokens each)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Mix and match as you like</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Tokens never expire</li>
                </ul>
                <button className="btn btn-outline btn-block">Buy 1,000 Tokens</button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg border-2 border-primary">
              <div className="card-body text-center">
                <div className="badge badge-primary badge-lg absolute -top-3 left-1/2 transform -translate-x-1/2">Best Value</div>
                <h3 className="text-2xl font-bold mb-2">Creator Pack</h3>
                <div className="text-4xl font-bold text-primary mb-4">$25</div>
                <div className="text-2xl font-semibold text-secondary mb-4">2,750 Tokens</div>
                <p className="text-base-content/70 mb-6">10% bonus tokens included!</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-secondary" /> 1,375 magic customizations</li>
                  <li className="flex items-center gap-2"><Package size={16} className="text-primary" /> 6 printed stickers</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Bonus 250 tokens FREE</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Priority support</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Tokens never expire</li>
                </ul>
                <button className="btn btn-primary btn-block">Buy 2,750 Tokens</button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h3 className="text-2xl font-bold mb-2">Pro Pack</h3>
                <div className="text-4xl font-bold text-primary mb-4">$50</div>
                <div className="text-2xl font-semibold text-secondary mb-4">6,000 Tokens</div>
                <p className="text-base-content/70 mb-6">20% bonus tokens included!</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-secondary" /> 3,000 magic customizations</li>
                  <li className="flex items-center gap-2"><Package size={16} className="text-primary" /> 15 printed stickers</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Bonus 1,000 tokens FREE</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Premium support</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Tokens never expire</li>
                </ul>
                <button className="btn btn-outline btn-block">Buy 6,000 Tokens</button>
              </div>
            </div>
          </div>

          {/* Token Usage Examples */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="card bg-primary/5 border border-primary/20">
              <div className="card-body">
                <h3 className="text-2xl font-bold text-center mb-6">How to Use Your Tokens</h3>
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
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Creating?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators using our token-based system to customize photos and create 
              amazing stickers. Buy tokens once, use them whenever inspiration strikes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/camera" className="btn btn-neutral btn-lg gap-2">
                <DollarSign size={20} />
                Buy Your First Tokens
                <ArrowRight size={20} />
              </Link>
              <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                See Examples
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <Heart size={32} className="text-primary" />
          <p className="font-bold text-lg">Print A Pic</p>
          <p>Magical photo customization and sticker printing since 2024</p>
          <p>Copyright © 2024 - All rights reserved</p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a href="/help" className="link link-hover">Help</a>
            <a className="link link-hover">Privacy Policy</a>
            <a className="link link-hover">Terms of Service</a>
            <Link to="/contact" className="link link-hover">Contact</Link>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default Homepage;