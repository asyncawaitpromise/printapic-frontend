import React from 'react';
import { Camera, Package, Zap, Heart, Star, ArrowRight, Check } from 'react-feather';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>
          <a className="btn btn-ghost text-xl font-bold">StickerSnap</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a href="#how-it-works" className="text-base-content/70 hover:text-base-content">How It Works</a></li>
            <li><a href="#features" className="text-base-content/70 hover:text-base-content">Features</a></li>
            <li><a href="#pricing" className="text-base-content/70 hover:text-base-content">Pricing</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <a className="btn btn-primary">Start Creating</a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
        <div className="hero-content text-center max-w-6xl">
          <div>
            <h1 className="text-6xl font-bold leading-tight mb-6">
              Turn Any Photo Into 
              <span className="text-primary"> Custom Stickers</span>
            </h1>
            <p className="text-xl text-base-content/70 mb-8 max-w-3xl mx-auto">
              Snap a photo of anything you love and we'll transform it into high-quality, 
              weather-resistant stickers delivered right to your door. Perfect for personalizing 
              your laptop, water bottle, car, or anywhere you want to add some personality!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn btn-primary btn-lg gap-2">
                <Camera size={20} />
                Create Your Stickers
              </button>
              <button className="btn btn-outline btn-lg gap-2">
                <Package size={20} />
                View Examples
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-8 text-sm text-base-content/60">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-warning fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <span>•</span>
              <span>50,000+ happy customers</span>
              <span>•</span>
              <span>Free shipping on orders $25+</span>
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
              Creating your custom stickers is as easy as 1-2-3. Get professional-quality results in just a few clicks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera size={32} className="text-primary" />
                </div>
                <h3 className="card-title justify-center text-2xl mb-3">1. Take a Photo</h3>
                <p className="text-base-content/70">
                  Upload any photo from your device or take a new one. Our AI will automatically 
                  remove backgrounds and enhance your image for the perfect sticker.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Zap size={32} className="text-secondary" />
                </div>
                <h3 className="card-title justify-center text-2xl mb-3">2. Customize</h3>
                <p className="text-base-content/70">
                  Choose your size, quantity, and style. Add text, adjust colors, or use our 
                  templates to make your stickers uniquely yours.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-accent" />
                </div>
                <h3 className="card-title justify-center text-2xl mb-3">3. Receive</h3>
                <p className="text-base-content/70">
                  We print your stickers on premium vinyl and ship them to your door. 
                  Most orders arrive within 3-5 business days.
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
            <h2 className="text-4xl font-bold mb-4">Why Choose StickerSnap?</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              We're not just another sticker company. Here's what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Check size={24} className="text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-base-content/70">
                  Weather-resistant vinyl that lasts years, not months. UV-resistant inks that won't fade.
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
                <h3 className="text-xl font-semibold mb-2">AI Background Removal</h3>
                <p className="text-base-content/70">
                  Our smart AI automatically removes backgrounds and cleans up your images for perfect results.
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
                <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
                <p className="text-base-content/70">
                  Free shipping on orders over $25. Most orders ship within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Check size={24} className="text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Multiple Sizes</h3>
                <p className="text-base-content/70">
                  From tiny laptop stickers to large car decals. Choose from 8 different sizes.
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
                <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
                <p className="text-base-content/70">
                  Bubble-free application with strong adhesive that removes cleanly when needed.
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
                <h3 className="text-xl font-semibold mb-2">100% Guarantee</h3>
                <p className="text-base-content/70">
                  Not happy with your stickers? We'll remake them for free or give you a full refund.
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
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              No hidden fees, no subscriptions. Just great stickers at fair prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h3 className="text-2xl font-bold mb-2">Starter Pack</h3>
                <div className="text-4xl font-bold text-primary mb-4">$12</div>
                <p className="text-base-content/70 mb-6">Perfect for trying us out</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> 10 stickers</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> 2" x 2" size</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> AI background removal</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Standard shipping</li>
                </ul>
                <button className="btn btn-outline btn-block">Get Started</button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg border-2 border-primary">
              <div className="card-body text-center">
                <div className="badge badge-primary badge-lg absolute -top-3 left-1/2 transform -translate-x-1/2">Most Popular</div>
                <h3 className="text-2xl font-bold mb-2">Creator Pack</h3>
                <div className="text-4xl font-bold text-primary mb-4">$28</div>
                <p className="text-base-content/70 mb-6">Best value for creators</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> 50 stickers</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Multiple sizes</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> AI background removal</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Free shipping</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Priority support</li>
                </ul>
                <button className="btn btn-primary btn-block">Choose Creator</button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h3 className="text-2xl font-bold mb-2">Business Pack</h3>
                <div className="text-4xl font-bold text-primary mb-4">$89</div>
                <p className="text-base-content/70 mb-6">For teams and businesses</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> 200 stickers</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> All sizes available</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> AI background removal</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Free expedited shipping</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Dedicated support</li>
                </ul>
                <button className="btn btn-outline btn-block">Choose Business</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Amazing Stickers?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators who trust StickerSnap for their custom sticker needs. 
              Start your first order today and see the difference quality makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-neutral btn-lg gap-2">
                <Camera size={20} />
                Start Creating Now
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                View Gallery
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <Heart size={32} className="text-primary" />
          <p className="font-bold text-lg">StickerSnap</p>
          <p>Turn your memories into stickers since 2024</p>
          <p>Copyright © 2024 - All rights reserved</p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a href="/help" className="link link-hover">Help</a>
            <a className="link link-hover">Privacy Policy</a>
            <a className="link link-hover">Terms of Service</a>
            <a className="link link-hover">Contact</a>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default Homepage;