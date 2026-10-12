import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, Package, 
  MapPin, CheckCircle, ArrowLeft, Plus, Minus, Trash2, 
  Clock, ShieldCheck, PhoneCall, ChevronRight, AlertCircle, Share2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'cart' | 'wishlist' | 'orders'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart & Wishlist state
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('bm_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('bm_wishlist') || '[]'));
  const [myOrders, setMyOrders] = useState(() => JSON.parse(localStorage.getItem('bm_orders') || '[]'));

  // Checkout modal & 1-Click Location state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null); // Direct buy now
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', pincode: '' });
  const [locationData, setLocationData] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [utr, setUtr] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    localStorage.setItem('bm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('bm_orders', JSON.stringify(myOrders));
  }, [myOrders]);
    // Fetch Products & Listen for Realtime Updates from Admin
  useEffect(() => {
    fetchLiveProducts();

    const channel = supabase
      .channel('customer-products-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchLiveProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click "Allow Location" - Silent GPS Fetcher
  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      alert("Aapke browser/phone mein GPS support uplabdh nahi hai.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationData({
          latitude: lat,
          longitude: lng,
          accuracy: `${Math.round(pos.coords.accuracy)}m`,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          captured_at: new Date().toISOString()
        });
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        alert("Location allow karna zaroori hai taaki delivery boy seedhe aapke ghar aa sake. Kripya permission allow karein.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };
    const toggleWishlist = (prod) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === prod.id);
      if (exists) return prev.filter(item => item.id !== prod.id);
      return [...prev, prod];
    });
  };

  const addToCart = (prod, selectedSize = 'Standard') => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === prod.id && item.size === selectedSize);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { ...prod, size: selectedSize, quantity: 1 }];
    });
    alert("Item Cart mein add ho gaya!");
  };

  const updateCartQty = (id, size, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id && item.size === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const getCheckoutItems = () => {
    if (checkoutProduct) {
      return [{ ...checkoutProduct, quantity: 1, size: checkoutProduct.selectedSize || 'Standard' }];
    }
    return cart;
  };

  const totalProductPrice = getCheckoutItems().reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
  const totalDeliveryFee = getCheckoutItems().reduce((acc, it) => acc + (it.delivery_fee || 49), 0);
  const upiPayable = getCheckoutItems()[0]?.upi_id || 'barijanmart@upi';
    const handleConfirmOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.pincode) {
      return alert("Kripya poora delivery address bharein!");
    }
    if (!locationData) {
      return alert("Kripya 'Allow Location' button dabakar location save karein!");
    }
    if (!utr.trim()) {
      return alert("Kripya delivery fee payment ka 12-digit UTR No enter karein!");
    }

    setIsPlacingOrder(true);
    const newOrderId = 'BM' + Math.floor(100000 + Math.random() * 900000);
    const orderItems = getCheckoutItems();

    const orderPayload = {
      id: newOrderId,
      customer_name: address.name,
      customer_phone: address.phone,
      full_address: `${address.street}, ${address.city} - ${address.pincode}`,
      items: orderItems,
      total_price: totalProductPrice,
      delivery_fee_paid: totalDeliveryFee,
      utr: utr.trim(),
      screenshot: null,
      location: locationData,
      status: 'Order Placed',
      estimated_delivery: '2-4 Days'
    };

    try {
      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) {
        alert("Order place karne mein samasya aayi: " + error.message);
      } else {
        const savedOrder = { ...orderPayload, created_at: new Date().toISOString() };
        setMyOrders(prev => [savedOrder, ...prev]);
        if (!checkoutProduct) setCart([]);
        setCheckoutProduct(null);
        setIsCheckoutOpen(false);
        setUtr('');
        setLocationData(null);
        setActiveTab('orders');
        alert("Badhai ho! Aapka order safalta se darj ho gaya hai.");
      }
    } catch (e) {
      alert("Network error: " + e.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const categories = ['All', 'Fashion', 'Electronics', 'Footwear', 'Groceries', 'Beauty'];
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
    return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative pb-20">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              <span>Barijan Mart</span>
            </h1>
            <p className="text-[10px] text-emerald-200 font-medium">Shudh Desi Quality • Direct Home Delivery</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('wishlist')} className="p-2 bg-white/10 rounded-full relative">
              <Heart size={18} className={wishlist.length > 0 ? "fill-red-400 text-red-400" : "text-white"} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>}
            </button>
            <button onClick={() => setActiveTab('cart')} className="p-2 bg-white/10 rounded-full relative">
              <ShoppingCart size={18} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search in 1000+ items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-xs text-slate-900 shadow-inner outline-none placeholder-slate-400"
          />
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="p-3.5 flex-1">
        {activeTab === 'home' && (
          <div>
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === c ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Product Feed Grid */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {loading ? (
                <div className="col-span-2 text-center py-20 text-xs font-bold text-slate-400">Loading Barijan Mart Products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-xs text-slate-400 font-bold bg-white rounded-2xl p-6 border border-dashed border-slate-300">
                  Koi product uplabdh nahi hai.
                </div>
              ) : (
                filteredProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="relative" onClick={() => setSelectedProduct(p)}>
                      <img src={p.images?.[0] || 'https://via.placeholder.com/200'} alt={p.title} className="w-full h-36 object-cover bg-slate-100 cursor-pointer" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }} 
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm text-slate-600"
                      >
                        <Heart size={14} className={wishlist.some(w => w.id === p.id) ? "fill-red-500 text-red-500" : ""} />
                      </button>
                    </div>
                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                      <div onClick={() => setSelectedProduct(p)} className="cursor-pointer">
                        <h3 className="font-bold text-xs text-slate-900 truncate">{p.title}</h3>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="font-black text-sm text-emerald-800">₹{p.price}</span>
                          {p.mrp > p.price && <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        <button 
                          onClick={() => addToCart(p)} 
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-lg transition"
                        >
                          Cart
                        </button>
                        <button 
                          onClick={() => { setCheckoutProduct(p); setIsCheckoutOpen(true); }} 
                          className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
                {/* Cart View */}
        {activeTab === 'cart' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
              <ShoppingCart size={16} className="text-emerald-700" /> Aapka Shopping Cart ({cart.length})
            </h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                <ShoppingCart size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">Aapka cart khaali hai</p>
                <button onClick={() => setActiveTab('home')} className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md">Shopping Shuru Karein</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <img src={item.images?.[0]} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">Size: {item.size} | ₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateCartQty(item.id, item.size, -1)} className="p-1 bg-slate-100 rounded-md"><Minus size={12} /></button>
                        <span className="text-xs font-black text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.size, 1)} className="p-1 bg-slate-100 rounded-md"><Plus size={12} /></button>
                      </div>
                    </div>
                    <button onClick={() => updateCartQty(item.id, item.size, -item.quantity)} className="text-red-500 p-2"><Trash2 size={16} /></button>
                  </div>
                ))}

                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-2 shadow-sm">
                  <div className="flex justify-between text-xs py-1 text-slate-600"><span>Product Amount:</span><b className="text-slate-900">₹{totalProductPrice}</b></div>
                  <div className="flex justify-between text-xs py-1 text-slate-600"><span>Advance Delivery Fee:</span><b className="text-emerald-700">₹{totalDeliveryFee}</b></div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between text-sm font-black text-slate-900"><span>Total Due (COD):</span><span>₹{totalProductPrice}</span></div>
                  <button onClick={() => { setCheckoutProduct(null); setIsCheckoutOpen(true); }} className="w-full mt-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition">
                    Checkout ({cart.length} Items)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist View */}
        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Heart size={16} className="text-red-500 fill-red-500" /> Wishlist Items</h2>
            {wishlist.length === 0 ? (
              <p className="text-center py-20 text-xs font-bold text-slate-400">Wishlist mein koi product nahi hai.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border p-2.5 shadow-sm">
                    <img src={p.images?.[0]} className="w-full h-28 object-cover rounded-xl" />
                    <h4 className="font-bold text-xs truncate mt-2">{p.title}</h4>
                    <p className="font-black text-xs text-emerald-800">₹{p.price}</p>
                    <button onClick={() => addToCart(p)} className="w-full mt-2 py-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-lg">Move to Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
                {/* My Orders Tracking Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Package size={16} className="text-emerald-700" /> Mere Orders</h2>
            {myOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border"><p className="text-xs font-bold text-slate-400">Aapka koi purana order nahi hai.</p></div>
            ) : (
              <div className="flex flex-col gap-3">
                {myOrders.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div><span className="font-extrabold text-xs text-emerald-800">#{o.id}</span><p className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</p></div>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">{o.status}</span>
                    </div>
                    <div className="py-2.5">
                      {o.items?.map((it, i) => (
                        <div key={i} className="flex justify-between text-xs py-0.5"><span className="text-slate-800 font-medium">{it.title} ({it.size || 'Std'}) x {it.quantity || 1}</span><b>₹{it.price * (it.quantity || 1)}</b></div>
                      ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between text-[11px] text-slate-600"><span>COD Due: <b>₹{o.total_price}</b></span><span>Adv Paid: <b className="text-emerald-700">₹{o.delivery_fee_paid}</b></span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CHECKOUT MODAL WITH COMPULSORY 1-CLICK LOCATION */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="font-black text-sm text-slate-900">Complete Delivery Details</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 font-black text-sm">✕</button>
            </div>

            <div className="flex flex-col gap-2.5">
              <input type="text" placeholder="Full Name *" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <input type="tel" placeholder="Mobile Number *" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <input type="text" placeholder="House / Village / Street Address *" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="City / District *" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="px-3 py-2 text-xs border rounded-xl" />
                <input type="number" placeholder="Pincode *" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} className="px-3 py-2 text-xs border rounded-xl" />
              </div>

              {/* 1-CLICK COMPULSORY LOCATION BUTTON */}
              <div className="my-1">
                {!locationData ? (
                  <button
                    type="button"
                    onClick={handleAllowLocation}
                    disabled={locLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={16} className={locLoading ? "animate-bounce" : ""} />
                    {locLoading ? "Fetching..." : "Allow Location"}
                  </button>
                ) : (
                  <div className="w-full py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl text-center shadow-sm">
                    ✓ Location Saved
                  </div>
                )}
              </div>

              {/* Advance Delivery Payment QR Box */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-700">Advance Delivery Fee: <b className="text-emerald-700">₹{totalDeliveryFee}</b></p>
                <p className="text-[10px] text-slate-500 mb-2">Scan QR & Pay via GPay / PhonePe / Paytm</p>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=${upiPayable}%26pn=BarijanMart%26am=${totalDeliveryFee}%26cu=INR`} 
                  alt="UPI QR" 
                  className="mx-auto w-32 h-32 rounded-lg border p-1 bg-white" 
                />
                <input 
                  type="text" 
                  placeholder="Enter 12-digit UPI Reference / UTR No *" 
                  value={utr} 
                  onChange={e => setUtr(e.target.value)} 
                  className="w-full mt-3 px-3 py-2 text-xs border border-emerald-400 bg-white rounded-xl text-center font-mono font-bold" 
                />
              </div>

              <button 
                onClick={handleConfirmOrder} 
                disabled={isPlacingOrder} 
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
              >
                {isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
            {/* Product Quick-View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selectedProduct.images?.[0]} className="w-full h-56 object-cover rounded-2xl" />
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900">{selectedProduct.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedProduct.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-black text-base text-emerald-800">₹{selectedProduct.price}</span>
                {selectedProduct.mrp > selectedProduct.price && <span className="text-xs text-slate-400 line-through">₹{selectedProduct.mrp}</span>}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-2.5 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl">Add to Cart</button>
                <button onClick={() => { setCheckoutProduct(selectedProduct); setSelectedProduct(null); setIsCheckoutOpen(true); }} className="flex-1 py-2.5 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2.5 z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <ShoppingBag size={18} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setActiveTab('wishlist')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'wishlist' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <Heart size={18} />
          <span className="text-[10px] font-bold">Wishlist</span>
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'cart' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <ShoppingCart size={18} />
          {cart.length > 0 && <span className="absolute -top-1 right-2 bg-amber-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          <span className="text-[10px] font-bold">Cart</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <Package size={18} />
          <span className="text-[10px] font-bold">Orders</span>
        </button>
      </nav>
    </div>
  );
}

      
              
        
              
        
                                  
  
  
  
  
  
  
  
