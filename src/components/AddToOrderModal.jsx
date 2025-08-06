import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'react-feather';
import { PRINT_SIZES } from '../types/orderTypes.js';
import { cartService } from '../services/cartService.js';

const AddToOrderModal = ({ photo, editId, isOpen, onClose, onSuccess }) => {
  const [selectedSize, setSelectedSize] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      // Add to cart
      cartService.addToCart(photo.id, editId, selectedSize, quantity);
      
      // Show success and close modal
      if (onSuccess) {
        onSuccess({
          message: `Added ${quantity} ${PRINT_SIZES[selectedSize].label} print(s) to cart`,
          size: selectedSize,
          quantity
        });
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const updateQuantity = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const selectedPrintSize = PRINT_SIZES[selectedSize];
  const totalPrice = selectedPrintSize.price * quantity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h3 className="font-bold text-lg">Add to Order</h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Photo Preview */}
          <div className="mb-4">
            <div className="aspect-square w-full max-w-[200px] mx-auto mb-2">
              <img 
                src={photo.data} 
                alt="Photo preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <p className="text-sm text-base-content/70 text-center">
              Photo #{photo.id}
            </p>
          </div>
          
          {/* Size Selection */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Select Size</h4>
            <div className="space-y-2">
              {Object.entries(PRINT_SIZES).map(([sizeKey, sizeData]) => (
                <label key={sizeKey} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={sizeKey}
                    checked={selectedSize === sizeKey}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="radio radio-primary mr-3"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{sizeData.label}</div>
                      <div className="text-sm text-base-content/70">{sizeData.dimensions}</div>
                    </div>
                    <div className="font-bold text-primary">
                      ${sizeData.price.toFixed(2)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Quantity Selection */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Quantity</h4>
            <div className="flex items-center justify-center gap-3">
              <button 
                className="btn btn-sm btn-circle btn-outline"
                onClick={() => updateQuantity(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <div className="w-16 text-center">
                <span className="text-lg font-bold">{quantity}</span>
              </div>
              <button 
                className="btn btn-sm btn-circle btn-outline"
                onClick={() => updateQuantity(1)}
                disabled={quantity >= 10}
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-xs text-base-content/60 text-center mt-1">
              Maximum 10 prints per item
            </p>
          </div>
          
          {/* Price Summary */}
          <div className="bg-base-200 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span>{quantity}x {selectedPrintSize.label}</span>
              <span className="font-bold text-lg">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Note about processing */}
          {!editId && (
            <div className="alert alert-warning mb-4">
              <div className="text-sm">
                <strong>Note:</strong> This photo needs to be processed before ordering. 
                Please apply an artistic effect first.
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-base-300">
          <button 
            className="btn btn-outline flex-1"
            onClick={onClose}
            disabled={isAdding}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary flex-1 gap-2"
            onClick={handleAddToCart}
            disabled={isAdding || !editId}
          >
            {isAdding ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToOrderModal;