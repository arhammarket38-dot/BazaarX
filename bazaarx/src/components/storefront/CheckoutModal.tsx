import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Download,
  Building,
} from 'lucide-react';
import { Order } from '../../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    currentUser,
    cartSubtotal,
    cartGrandTotal,
    appliedCoupon,
    addToast,
    setLastCreatedOrder,
    settings,
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || 'Marcus Vance');
  const [email, setEmail] = useState(currentUser?.email || 'customer@example.com');
  const [phone, setPhone] = useState(currentUser?.addresses[0]?.phone || '+1 212-555-0198');
  const [street, setStreet] = useState(currentUser?.addresses[0]?.street || '742 Evergreen Terrace');
  const [city, setCity] = useState(currentUser?.addresses[0]?.city || 'New York');
  const [state, setState] = useState(currentUser?.addresses[0]?.state || 'NY');
  const [zipCode, setZipCode] = useState(currentUser?.addresses[0]?.zipCode || '10001');

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'STORE_CREDIT'>('CREDIT_CARD');

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: currentUser,
          items: cart,
          shippingAddress: {
            id: 'addr_' + Date.now(),
            type: 'SHIPPING',
            isDefault: true,
            fullName,
            phone,
            street,
            city,
            state,
            zipCode,
            country: 'United States',
          },
          paymentMethod,
          couponCode: appliedCoupon?.code,
          storeCreditUsed: paymentMethod === 'STORE_CREDIT' ? 50 : 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedOrder(data.order);
        setLastCreatedOrder(data.order);
        clearCart();
        setStep(4); // Receipt step
        addToast(`Order ${data.order.orderNumber} placed successfully!`, 'success');
      } else {
        addToast(data.error || 'Failed to place order', 'error');
      }
    } catch {
      addToast('Network error during checkout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
    setCreatedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              {step === 4 ? 'Order Confirmed' : `Step ${step} of 3`}
            </span>
            <h3 className="text-xl font-extrabold">
              {step === 1 && 'Shipping & Customer Address'}
              {step === 2 && 'Delivery Method & Speed'}
              {step === 3 && 'Payment Method & Final Review'}
              {step === 4 && 'Thank You For Your Order!'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Bar */}
        {step < 4 && (
          <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500">
            <div className={`flex-1 p-3 text-center ${step >= 1 ? 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-600' : ''}`}>
              1. Address
            </div>
            <div className={`flex-1 p-3 text-center ${step >= 2 ? 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-600' : ''}`}>
              2. Shipping
            </div>
            <div className={`flex-1 p-3 text-center ${step >= 3 ? 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-600' : ''}`}>
              3. Payment
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800"
                >
                  Continue to Delivery <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Select Shipping Option</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">Standard Insured Ground</span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">
                      {cartSubtotal >= (settings?.freeShippingThreshold || 99)
                        ? 'FREE'
                        : `$${settings?.standardShippingFee || 9.99}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">3-5 Business Days delivery with package insurance.</p>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-xs text-slate-900">Express Next-Day Air</span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">
                      ${settings?.expressShippingFee || 24.99}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Priority 24-hour dispatch via FedEx Express.</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Payment Gateways</h4>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'CREDIT_CARD' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Credit / Debit Card</p>
                    <p className="text-[10px] text-slate-500">Stripe Secure Gateway</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'CASH_ON_DELIVERY' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Cash on Delivery</p>
                    <p className="text-[10px] text-slate-500">Pay upon package arrival</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                  }`}
                >
                  <Building className="w-5 h-5 text-sky-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Wire Bank Transfer</p>
                    <p className="text-[10px] text-slate-500">Direct ACH / Wire transfer</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('STORE_CREDIT')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'STORE_CREDIT' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Store Credit Balance</p>
                    <p className="text-[10px] text-slate-500">Available: ${currentUser?.storeCredit || 150}</p>
                  </div>
                </div>
              </div>

              {/* Order breakdown confirmation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Shipping Address:</span>
                  <span>{street}, {city}, {state} {zipCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cart Items ({cart.length})</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Amount Due:</span>
                  <span>${cartGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  {submitting ? 'Processing Order...' : `Pay & Complete Order ($${cartGrandTotal.toFixed(2)})`}
                </button>
              </div>
            </div>
          )}

          {step === 4 && createdOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200">
                  ORDER #{createdOrder.orderNumber}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">Order Confirmed Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  A confirmation email has been dispatched to <strong className="text-slate-800">{createdOrder.customerEmail}</strong> with your order receipt and tracking link.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 max-w-md mx-auto border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Code:</span>
                  <span className="font-bold text-slate-900">{createdOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-slate-900">3 Business Days</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-slate-900">
                  <span>Grand Total Paid:</span>
                  <span>${createdOrder.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PDF Receipt
                </button>
                <button
                  onClick={handleClose}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
                >
                  Back to Store
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
