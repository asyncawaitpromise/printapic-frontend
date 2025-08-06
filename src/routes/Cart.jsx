import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, CreditCard, ArrowLeft } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService.js';
import { orderService } from '../services/orderService.js';
import { PRINT_SIZES, createShippingAddress, ORDER_STATUS_LABELS } from '../types/orderTypes.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({ itemCount: 0, subtotal: 0, tokensCost: 100, items: [] });
  const [shippingAddress, setShippingAddress] = useState(createShippingAddress());
  const [currentStep, setCurrentStep] = useState('cart'); // cart, shipping, payment, confirmation
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [userTokens, setUserTokens] = useState(0);

  // Load cart items and user tokens on mount
  useEffect(() => {
    loadCartData();
    loadUserTokens();
  }, []);

  const loadCartData = () => {
    const totals = cartService.getCartTotals();
    setCartItems(totals.items);
    setCartTotals(totals);
  };

  const loadUserTokens = async () => {
    if (user) {
      try {
        // Get fresh user data from PocketBase
        const userData = await orderService.pb.collection('printapic_users').getOne(user.id);
        setUserTokens(userData.tokens || 0);
      } catch (error) {
        console.error('Error loading user tokens:', error);
      }
    }
  };

  // Handle quantity updates
  const updateQuantity = (cartItemId, newQuantity) => {
    const updatedItems = cartService.updateQuantity(cartItemId, newQuantity);
    loadCartData();
  };

  // Remove item from cart
  const removeItem = (cartItemId) => {
    cartService.removeFromCart(cartItemId);
    loadCartData();
  };

  // Handle shipping form changes
  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate shipping address
  const isShippingValid = () => {
    const required = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'zipCode'];
    return required.every(field => shippingAddress[field].trim() !== '');
  };

  // Process order
  const processOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!isShippingValid()) {
      alert('Please fill in all required shipping fields');
      return;
    }

    if (userTokens < 100) {
      alert(`Insufficient tokens. You have ${userTokens} tokens but need 100 tokens to place an order.`);
      return;
    }

    setIsProcessingOrder(true);
    
    try {
      const result = await orderService.createOrder(cartItems, shippingAddress);
      
      if (result.success) {
        // Clear cart on success
        cartService.clearCart();
        setCartItems([]);
        setCartTotals({ itemCount: 0, subtotal: 0, tokensCost: 100, items: [] });
        
        setOrderResult(result);
        setCurrentStep('confirmation');
        
        // Refresh user tokens
        await loadUserTokens();
      } else {
        alert(`Failed to place order: ${result.error}`);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('An error occurred while processing your order. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Render cart items
  const renderCartItems = () => (
    <div className="space-y-4">
      {cartItems.map((item) => {
        const printSize = PRINT_SIZES[item.size];
        return (
          <div key={item.id} className="bg-base-200 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              {/* Photo preview would go here if we had the photo data */}
              <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center">
                <ShoppingCart size={24} className="text-base-content/50" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold">{printSize.label}</h4>
                <p className="text-sm text-base-content/70">
                  Photo #{item.photoId} • {printSize.dimensions}
                </p>
                <p className="text-sm font-bold text-primary">
                  ${printSize.price.toFixed(2)} each
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-xs btn-circle btn-outline"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  className="btn btn-xs btn-circle btn-outline"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 10}
                >
                  <Plus size={12} />
                </button>
              </div>
              
              <div className="text-right">
                <p className="font-bold">${item.totalPrice.toFixed(2)}</p>
                <button
                  className="btn btn-xs btn-error btn-outline mt-1"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render shipping form
  const renderShippingForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text">First Name *</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={shippingAddress.firstName}
            onChange={(e) => handleShippingChange('firstName', e.target.value)}
            placeholder="John"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Last Name *</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={shippingAddress.lastName}
            onChange={(e) => handleShippingChange('lastName', e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div>
        <label className="label">
          <span className="label-text">Address Line 1 *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={shippingAddress.addressLine1}
          onChange={(e) => handleShippingChange('addressLine1', e.target.value)}
          placeholder="123 Main St"
        />
      </div>
      
      <div>
        <label className="label">
          <span className="label-text">Address Line 2</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={shippingAddress.addressLine2}
          onChange={(e) => handleShippingChange('addressLine2', e.target.value)}
          placeholder="Apt 4B"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">
            <span className="label-text">City *</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={shippingAddress.city}
            onChange={(e) => handleShippingChange('city', e.target.value)}
            placeholder="New York"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">State *</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={shippingAddress.state}
            onChange={(e) => handleShippingChange('state', e.target.value)}
            placeholder="NY"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">ZIP Code *</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={shippingAddress.zipCode}
            onChange={(e) => handleShippingChange('zipCode', e.target.value)}
            placeholder="10001"
          />
        </div>
      </div>
      
      <div>
        <label className="label">
          <span className="label-text">Country</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={shippingAddress.country}
          onChange={(e) => handleShippingChange('country', e.target.value)}
        >
          <option value="US">United States</option>
        </select>
      </div>
    </div>
  );

  // Render payment confirmation
  const renderPaymentConfirmation = () => (
    <div className="space-y-4">
      <div className="alert alert-info">
        <CreditCard size={16} />
        <div>
          <h4 className="font-bold">Payment Method</h4>
          <p className="text-sm">This order will be paid using 100 tokens from your account.</p>
        </div>
      </div>
      
      <div className="bg-base-200 p-4 rounded-lg">
        <h4 className="font-bold mb-2">Token Balance</h4>
        <div className="flex justify-between items-center">
          <span>Current Balance:</span>
          <span className="font-bold">{userTokens} tokens</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Order Cost:</span>
          <span className="font-bold text-error">-100 tokens</span>
        </div>
        <div className="border-t border-base-300 mt-2 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-bold">After Order:</span>
            <span className={`font-bold ${userTokens >= 100 ? 'text-success' : 'text-error'}`}>
              {userTokens - 100} tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render order confirmation
  const renderOrderConfirmation = () => (
    <div className="text-center space-y-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-success">Order Placed Successfully!</h2>
      <p>Your order has been received and is being processed.</p>
      
      {orderResult?.order && (
        <div className="bg-base-200 p-4 rounded-lg text-left">
          <h4 className="font-bold mb-2">Order Details</h4>
          <p><strong>Order ID:</strong> {orderResult.order.id}</p>
          <p><strong>Status:</strong> {ORDER_STATUS_LABELS[orderResult.order.status]}</p>
          <p><strong>Items:</strong> {cartTotals.itemCount} print(s)</p>
          <p><strong>Total Cost:</strong> 100 tokens</p>
        </div>
      )}
      
      <p className="text-sm text-base-content/70">
        You will receive tracking information once your prints are ready to ship.
      </p>
      
      <div className="flex gap-2">
        <button
          className="btn btn-primary flex-1"
          onClick={() => navigate('/gallery')}
        >
          Back to Gallery
        </button>
        <button
          className="btn btn-outline flex-1"
          onClick={() => {
            setCurrentStep('cart');
            setOrderResult(null);
            loadCartData();
          }}
        >
          Place Another Order
        </button>
      </div>
    </div>
  );

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 'cart': return 'Shopping Cart';
      case 'shipping': return 'Shipping Address';
      case 'payment': return 'Payment Confirmation';
      case 'confirmation': return 'Order Confirmed';
      default: return 'Cart';
    }
  };

  // Check if can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 'cart': return cartItems.length > 0;
      case 'shipping': return isShippingValid();
      case 'payment': return userTokens >= 100;
      default: return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
          <p className="mb-4">You need to sign in to access your cart.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              className="btn btn-circle btn-sm"
              onClick={() => currentStep === 'cart' ? navigate('/gallery') : setCurrentStep('cart')}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-bold text-lg">{getStepTitle()}</h1>
          </div>
          
          {currentStep === 'cart' && (
            <div className="text-sm text-base-content/70">
              {cartTotals.itemCount} item{cartTotals.itemCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Progress Steps */}
        {currentStep !== 'confirmation' && (
          <div className="mb-6">
            <ul className="steps w-full">
              <li className={`step ${currentStep === 'cart' || currentStep === 'shipping' || currentStep === 'payment' ? 'step-primary' : ''}`}>
                Cart
              </li>
              <li className={`step ${currentStep === 'shipping' || currentStep === 'payment' ? 'step-primary' : ''}`}>
                Shipping
              </li>
              <li className={`step ${currentStep === 'payment' ? 'step-primary' : ''}`}>
                Payment
              </li>
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          {currentStep === 'cart' && (
            <div>
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={64} className="mx-auto mb-4 text-base-content/30" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-base-content/70 mb-4">
                    Add some photos to your cart to get started
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/gallery')}
                  >
                    Browse Gallery
                  </button>
                </div>
              ) : (
                renderCartItems()
              )}
            </div>
          )}
          
          {currentStep === 'shipping' && renderShippingForm()}
          {currentStep === 'payment' && renderPaymentConfirmation()}
          {currentStep === 'confirmation' && renderOrderConfirmation()}
        </div>

        {/* Order Summary - Show for cart, shipping, and payment steps */}
        {currentStep !== 'confirmation' && cartItems.length > 0 && (
          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items ({cartTotals.itemCount}):</span>
                <span>${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing & Shipping:</span>
                <span>100 tokens</span>
              </div>
              <div className="border-t border-base-300 pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>100 tokens + ${cartTotals.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {currentStep !== 'confirmation' && cartItems.length > 0 && (
          <div className="flex gap-2">
            {currentStep !== 'cart' && (
              <button
                className="btn btn-outline flex-1"
                onClick={() => {
                  if (currentStep === 'shipping') setCurrentStep('cart');
                  else if (currentStep === 'payment') setCurrentStep('shipping');
                }}
              >
                Back
              </button>
            )}
            
            <button
              className="btn btn-primary flex-1"
              onClick={() => {
                if (currentStep === 'cart') setCurrentStep('shipping');
                else if (currentStep === 'shipping') setCurrentStep('payment');
                else if (currentStep === 'payment') processOrder();
              }}
              disabled={!canProceed() || isProcessingOrder}
            >
              {isProcessingOrder ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : currentStep === 'payment' ? (
                'Place Order'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;