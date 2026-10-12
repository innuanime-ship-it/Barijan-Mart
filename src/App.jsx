import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, Package, 
  MapPin, CheckCircle, ArrowLeft, Plus, Minus, Trash2, 
  Clock, ShieldCheck, PhoneCall, ChevronRight, AlertCircle, 
  Share2, LogOut, Check, Sparkles, Truck, QrCode, Camera, Lock
} from 'lucide-react';

const ALLOWED_VILLAGES = [
  "UttarTola Nadipar Barijan",
  "DakshinTola Nadipar Barijan",
  "Malitola Barijan",
  "Pashchim Tola Barijan",
  "PaikTola Barijan",
  "Durgapur Barijan",
  "Kudhaila",
  "Rampur",
  "Ruhia",
  "Satbhitta",
  "Shakor",
  "Gopalpur",
  "Kajlamani",
  "Taalbari",
  "Kashibari"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('bm_current_customer') || 'null');
  });
  const [authMode, setAuthMode] = useState(null);
    const [regForm, setRegForm] = useState({
    name: '', phone: '', password: '', village: '', avatar: ''
  });

  const [loginForm, setLoginForm] = useState({
    name: '', phone: '', password: ''
  });

  const [forgotForm, setForgotForm] = useState({
    name: '', phone: '', village: '', newPassword: '', confirmPassword: ''
  });

  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('bm_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('bm_wishlist') || '[]'));
  const [myOrders, setMyOrders] = useState(() => JSON.parse(localStorage.getItem('bm_orders') || '[]'));

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [altPhone, setAltPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    localStorage.setItem('bm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('bm_orders', JSON.stringify(myOrders));
  }, [myOrders]);
    useEffect(() => {
    fetchCatalog();

    const catalogChannel = supabase
      .channel('customer-catalog-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchCatalog();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(catalogChannel);
    };
  }, []);

  const fetchCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Catalog fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      alert("Aapke phone me GPS support uplabdh nahi mila.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomerLocation({
          latitude: lat,
          longitude: lng,
          accuracy: `${Math.round(pos.coords.accuracy)}m`,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          timestamp: new Date().toISOString()
        });
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        alert("Location detect nahi ho payi. Kripya phone ki Location (GPS) ON karein aur dobara Allow par tap karein.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };
    const handleLogin = (e) => {
    e.preventDefault();
    const cleanName = loginForm.name.trim().toUpperCase();
    const cleanPhone = loginForm.phone.trim();
    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');

    const user = allUsers.find(u => u.phone === cleanPhone && u.name === cleanName && u.password === loginForm.password);
    if (!user) {
      return alert("Registered Name, Mobile number ya Password galat hai!");
    }

    localStorage.setItem('bm_current_customer', JSON.stringify(user));
    setCurrentUser(user);
    setAuthMode(null);
    alert(`Welcome back, ${user.name}!`);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const cleanName = forgotForm.name.trim().toUpperCase();
    const cleanPhone = forgotForm.phone.trim();
    const cleanVillage = forgotForm.village;

    if (!cleanName || !cleanPhone || !cleanVillage || !forgotForm.newPassword || !forgotForm.confirmPassword) {
      return alert("Sabhi details bharna anivarya hai!");
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      return alert("New Password aur Confirm Password match nahi hue!");
    }

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const userIndex = allUsers.findIndex(u => 
      u.phone === cleanPhone && 
      u.name === cleanName && 
      u.village === cleanVillage
    );

    if (userIndex === -1) {
      return alert("Di gayi details (Name, Phone aur Village) account se match nahi hui!");
    }

    allUsers[userIndex].password = forgotForm.newPassword;
    localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    alert("Password safalta se badal gaya! Ab naye password se login karein.");
    setAuthMode('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bm_current_customer');
  };
    const toggleWishlist = (prod) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === prod.id);
      if (exists) return prev.filter(item => item.id !== prod.id);
      return [...prev, prod];
    });
  };

  const handleAddToCart = (prod, sizeToUse = null) => {
    const finalSize = sizeToUse || selectedSize || 'Standard';
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === prod.id && item.size === finalSize);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { ...prod, size: finalSize, quantity: 1 }];
    });
    alert("Item Cart mein shamil ho gaya!");
  };

  const updateCartQty = (id, size, change) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id && item.size === size) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleSlipUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h *= maxDim / w;
          w = maxDim;
        } else if (h > maxDim) {
          w *= maxDim / h;
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        setPaymentScreenshot(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getCheckoutItems = () => {
    if (checkoutProduct) {
      return [{ ...checkoutProduct, quantity: 1, size: selectedSize || 'Standard' }];
    }
    return cart;
  };

  const totalProductAmount = getCheckoutItems().reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
  const totalDeliveryFee = getCheckoutItems().reduce((acc, it) => acc + (it.delivery_fee || 49), 0);
  const primaryUpiId = getCheckoutItems()[0]?.upi_id || 'barijanmart@upi';
    const handleExecuteOrder = async () => {
    if (!currentUser) {
      setAuthMode('login');
      return alert("Pehle Login ya Register karein!");
    }
    if (!customerLocation) {
      return alert("Kripya 'Allow Location' button dabakar location save karein!");
    }
    if (!utrNumber.trim()) {
      return alert("Kripya Advance Delivery Fee payment ka 12-digit UTR No enter karein!");
    }

    setIsSubmittingOrder(true);
    const newOrderId = 'BM' + Math.floor(100000 + Math.random() * 900000);
    const orderItems = getCheckoutItems();

    const fullDeliveryAddress = `Village: ${currentUser.village}, Registered No: ${currentUser.phone}${altPhone.trim() ? `, Alt No: ` + altPhone.trim() : ''}`;

    const orderPayload = {
      id: newOrderId,
      customer_name: currentUser.name,
      customer_phone: currentUser.phone,
      alt_phone: altPhone.trim() || null,
      village: currentUser.village,
      avatar: currentUser.avatar || null,
      full_address: fullDeliveryAddress,
      items: orderItems,
      total_price: totalProductAmount,
      delivery_fee_paid: totalDeliveryFee,
      utr: utrNumber.trim(),
      screenshot: paymentScreenshot || null,
      location: customerLocation,
      status: 'Order Placed',
      estimated_delivery: '2-4 Days'
    };

    try {
      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) {
        alert("Order error: " + error.message);
      } else {
        const record = { ...orderPayload, created_at: new Date().toISOString() };
        setMyOrders(prev => [record, ...prev]);
        if (!checkoutProduct) setCart([]);
        setCheckoutProduct(null);
        setIsCheckoutOpen(false);
        setUtrNumber('');
        setPaymentScreenshot(null);
        setCustomerLocation(null);
        setAltPhone('');
        setActiveTab('orders');
        alert("Aapka Barijan Mart order safalta se book ho gaya!");
      }
    } catch (e) {
      alert("Network Error: " + e.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const categories = ['All', 'Fashion', 'Footwear', 'Groceries', 'Beauty', 'Electronics'];
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative pb-20 select-none">
      <header className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full border-2 border-emerald-400 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">BM</div>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight leading-tight">Barijan Mart</h1>
              <p className="text-[10px] text-emerald-200 font-medium">
                {currentUser ? `📍 ${currentUser.village}` : "Barijan & Surrounding Areas"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('wishlist')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full relative transition">
              <Heart size={18} className={wishlist.length > 0 ? "fill-red-400 text-red-400" : "text-white"} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>}
            </button>
            <button onClick={() => setActiveTab('cart')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full relative transition">
              <ShoppingCart size={18} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
            </button>
          </div>
        </div>

        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search items, clothes, products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-xs text-slate-900 shadow-inner outline-none placeholder-slate-400 focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </header>
            <main className="p-3.5 flex-1">
        {activeTab === 'home' && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === c ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {loading ? (
                <div className="col-span-2 text-center py-24 text-xs font-bold text-slate-400">Loading Barijan Mart Products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-xs text-slate-400 font-bold bg-white rounded-2xl p-6 border border-dashed border-slate-300">
                  Koi product uplabdh nahi hai.
                </div>
              ) : (
                filteredProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div className="relative cursor-pointer" onClick={() => { setSelectedProduct(p); setSelectedSize(p.sizes?.[0] || 'M'); }}>
                      <img src={p.images?.[0] || 'https://via.placeholder.com/200'} alt={p.title} className="w-full h-36 object-cover bg-slate-100" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }} 
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm text-slate-600"
                      >
                        <Heart size={14} className={wishlist.some(w => w.id === p.id) ? "fill-red-500 text-red-500" : ""} />
                      </button>
                    </div>
                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                      <div onClick={() => { setSelectedProduct(p); setSelectedSize(p.sizes?.[0] || 'M'); }} className="cursor-pointer">
                        <h3 className="font-bold text-xs text-slate-900 truncate">{p.title}</h3>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="font-black text-sm text-emerald-800">₹{p.price}</span>
                          {p.mrp > p.price && <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        <button onClick={() => handleAddToCart(p)} className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-lg transition">Cart</button>
                        <button onClick={() => { setCheckoutProduct(p); setSelectedSize(p.sizes?.[0] || 'M'); setIsCheckoutOpen(true); }} className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition">Buy</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><ShoppingCart size={16} className="text-emerald-800" /> Aapka Cart ({cart.length})</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                <ShoppingCart size={40} className="mx-auto text-slate-300 mb-2" /><p className="text-xs font-bold text-slate-400">Aapka cart khaali hai</p>
                <button onClick={() => setActiveTab('home')} className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md">Shopping Shuru Karein</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
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
                  <div className="flex justify-between text-xs py-1 text-slate-600"><span>Product Total:</span><b className="text-slate-900">₹{totalProductAmount}</b></div>
                  <div className="flex justify-between text-xs py-1 text-slate-600"><span>Advance Delivery Fee:</span><b className="text-emerald-800">₹{totalDeliveryFee}</b></div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between text-sm font-black text-slate-900"><span>Total Due (COD):</span><span>₹{totalProductAmount}</span></div>
                  <button onClick={() => { setCheckoutProduct(null); setIsCheckoutOpen(true); }} className="w-full mt-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-lg transition">Checkout ({cart.length} Items)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Heart size={16} className="text-red-500 fill-red-500" /> Wishlist</h2>
            {wishlist.length === 0 ? (
              <p className="text-center py-20 text-xs font-bold text-slate-400">Wishlist mein koi product nahi hai.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border p-2.5 shadow-sm">
                    <img src={p.images?.[0]} className="w-full h-28 object-cover rounded-xl" />
                    <h4 className="font-bold text-xs truncate mt-2">{p.title}</h4>
                    <p className="font-black text-xs text-emerald-800">₹{p.price}</p>
                    <button onClick={() => handleAddToCart(p)} className="w-full mt-2 py-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-lg">Move to Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Package size={16} className="text-emerald-800" /> Mere Orders</h2>
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
                    <div className="border-t pt-2 flex justify-between text-[11px] text-slate-600"><span>COD Due: <b>₹{o.total_price}</b></span><span>Adv Paid: <b className="text-emerald-800">₹{o.delivery_fee_paid}</b></span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-black text-slate-900">Aapka Khata (Profile)</h2>
            {currentUser ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500" />
                  <div>
                    <p className="font-black text-sm text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-600">📞 {currentUser.phone}</p>
                    <p className="text-xs text-emerald-800 font-bold mt-0.5">🏡 {currentUser.village}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                  <LogOut size={14} /> Khata Logout Karein
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4">Fast delivery aur live tracking ke liye apna account kholein.</p>
                <div className="flex gap-2">
                  <button onClick={() => setAuthMode('login')} className="flex-1 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl">Login</button>
                  <button onClick={() => setAuthMode('register')} className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">New Register</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
            {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="font-black text-sm text-slate-900">Order Delivery Details</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 font-black text-sm">✕</button>
            </div>

            {!currentUser ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-600 font-bold mb-4">Order place karne ke liye pehle Login ya Register karein!</p>
                <div className="flex gap-2">
                  <button onClick={() => { setIsCheckoutOpen(false); setAuthMode('login'); }} className="flex-1 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl">Login</button>
                  <button onClick={() => { setIsCheckoutOpen(false); setAuthMode('register'); }} className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">New Register</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-600 mt-0.5">🏡 Selected Village: <b className="text-emerald-800">{currentUser.village}</b></p>
                  <p className="text-slate-500 mt-0.5">📞 Registered Mobile: <b className="text-slate-800">{currentUser.phone}</b> (Locked)</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Alternative Mobile Number (Optional):</label>
                  <input 
                    type="tel" 
                    placeholder="Dusra Phone Number (Yadi koi ho)" 
                    value={altPhone} 
                    onChange={e => setAltPhone(e.target.value)} 
                    className="w-full px-3 py-2 text-xs border rounded-xl" 
                  />
                </div>

                <div className="my-1">
                  {!customerLocation ? (
                    <button
                      type="button"
                      onClick={handleAllowLocation}
                      disabled={locLoading}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <MapPin size={16} className={locLoading ? "animate-bounce" : ""} />
                      {locLoading ? "Detecting..." : "Allow Location"}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl text-center shadow-sm">
                      ✓ Location Saved
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[11px] font-bold text-slate-700">Advance Delivery Fee: <b className="text-emerald-800">₹{totalDeliveryFee}</b></p>
                  <p className="text-[10px] text-slate-500 mb-2">Scan QR & Pay via GPay / PhonePe / Paytm</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=${primaryUpiId}%26pn=BarijanMart%26am=${totalDeliveryFee}%26cu=INR`} 
                    alt="UPI QR" 
                    className="mx-auto w-32 h-32 rounded-lg border p-1 bg-white" 
                  />
                  <input 
                    type="text" 
                    placeholder="Enter 12-digit UPI Reference / UTR No *" 
                    value={utrNumber} 
                    onChange={e => setUtrNumber(e.target.value)} 
                    className="w-full mt-3 px-3 py-2 text-xs border border-emerald-400 bg-white rounded-xl text-center font-mono font-bold" 
                  />
                  <label className="block mt-2 text-[10px] text-slate-600 border border-dashed rounded-lg py-1.5 cursor-pointer bg-white">
                    {paymentScreenshot ? "✓ Slip Photo Selected" : "Upload Payment Slip (Optional)"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                  </label>
                </div>

                <button 
                  onClick={handleExecuteOrder} 
                  disabled={isSubmittingOrder} 
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  {isSubmittingOrder ? "Confirming Order..." : "Confirm & Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
            {authMode === 'register' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleRegister} className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col gap-2.5">
            <h3 className="font-black text-sm text-slate-900">New Customer Registration</h3>
            <input 
              type="text" 
              placeholder="Full Name (CAPITAL LETTERS) *" 
              value={regForm.name} 
              onChange={e => setRegForm({ ...regForm, name: e.target.value.toUpperCase() })} 
              className="px-3 py-2 text-xs border rounded-xl font-bold uppercase tracking-wide" 
            />
            <input 
              type="tel" 
              placeholder="Mobile Phone Number *" 
              value={regForm.phone} 
              onChange={e => setRegForm({ ...regForm, phone: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <input 
              type="password" 
              placeholder="Create Password *" 
              value={regForm.password} 
              onChange={e => setRegForm({ ...regForm, password: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <div>
              <label className="text-[10px] font-bold text-emerald-800 block mb-1">Select Village (Delivery In These 15 Villages Only):</label>
              <select 
                value={regForm.village} 
                onChange={e => setRegForm({ ...regForm, village: e.target.value })} 
                className="w-full px-2.5 py-2 text-xs border rounded-xl bg-slate-50 font-medium"
              >
                <option value="">-- Gaon Chunein --</option>
                {ALLOWED_VILLAGES.map((v, i) => (
                  <option key={i} value={v}>{i + 1}. {v}</option>
                ))}
              </select>
            </div>
            <label className="text-center p-2 border border-dashed rounded-xl text-[11px] text-slate-600 cursor-pointer bg-slate-50">
              {regForm.avatar ? "✓ Profile Photo Added" : "+ Profile Photo / Avatar Set Karein"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            <button type="submit" className="py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md mt-1">Register Account</button>
            <div className="flex justify-between items-center text-[11px] mt-1">
              <span onClick={() => setAuthMode('login')} className="text-emerald-800 font-bold cursor-pointer">Login Screen</span>
              <span onClick={() => setAuthMode(null)} className="text-slate-400 font-bold cursor-pointer">Cancel</span>
            </div>
          </form>
        </div>
      )}

      {authMode === 'login' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <h3 className="font-black text-sm text-slate-900">Barijan Mart Customer Login</h3>
            <input 
              type="text" 
              placeholder="Registered Name (CAPITAL) *" 
              value={loginForm.name} 
              onChange={e => setLoginForm({ ...loginForm, name: e.target.value.toUpperCase() })} 
              className="px-3 py-2 text-xs border rounded-xl font-bold uppercase tracking-wide" 
            />
            <input 
              type="tel" 
              placeholder="Registered Mobile Number *" 
              value={loginForm.phone} 
              onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <input 
              type="password" 
              placeholder="Password *" 
              value={loginForm.password} 
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <button type="submit" className="py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md">Login Karein</button>
            <div className="flex justify-between items-center text-[11px]">
              <span onClick={() => setAuthMode('forgot')} className="text-red-500 font-bold cursor-pointer">Forgot Password?</span>
              <span onClick={() => setAuthMode('register')} className="text-emerald-800 font-bold cursor-pointer">New Register</span>
            </div>
            <button type="button" onClick={() => setAuthMode(null)} className="text-xs text-slate-400 font-bold mt-1">Cancel</button>
          </form>
        </div>
      )}

      {authMode === 'forgot' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleForgotPassword} className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col gap-2.5">
            <h3 className="font-black text-sm text-slate-900">Reset Account Password</h3>
            <p className="text-[10px] text-slate-500 leading-tight">Verification ke liye registration ke waqt chuna gaya Gaon, Name aur Phone enter karein:</p>
            <input 
              type="text" 
              placeholder="Registered Name (CAPITAL) *" 
              value={forgotForm.name} 
              onChange={e => setForgotForm({ ...forgotForm, name: e.target.value.toUpperCase() })} 
              className="px-3 py-2 text-xs border rounded-xl font-bold uppercase tracking-wide" 
            />
            <input 
              type="tel" 
              placeholder="Registered Mobile Number *" 
              value={forgotForm.phone} 
              onChange={e => setForgotForm({ ...forgotForm, phone: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <select 
              value={forgotForm.village} 
              onChange={e => setForgotForm({ ...forgotForm, village: e.target.value })} 
              className="w-full px-2.5 py-2 text-xs border rounded-xl bg-slate-50 font-medium"
            >
              <option value="">-- Choose Same Registered Village --</option>
              {ALLOWED_VILLAGES.map((v, i) => (
                <option key={i} value={v}>{i + 1}. {v}</option>
              ))}
            </select>
            <input 
              type="password" 
              placeholder="Create New Password *" 
              value={forgotForm.newPassword} 
              onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <input 
              type="password" 
              placeholder="Confirm New Password *" 
              value={forgotForm.confirmPassword} 
              onChange={e => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <button type="submit" className="py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md mt-1">Set New Password</button>
            <div className="flex justify-between items-center text-[11px] mt-1">
              <span onClick={() => setAuthMode('login')} className="text-emerald-800 font-bold cursor-pointer">Login Screen</span>
              <span onClick={() => setAuthMode(null)} className="text-slate-400 font-bold cursor-pointer">Cancel</span>
            </div>
          </form>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selectedProduct.images?.[0]} className="w-full h-56 object-cover rounded-2xl" />
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900">{selectedProduct.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedProduct.description}</p>
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-bold text-slate-700">Size:</span>
                  {selectedProduct.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedSize === s ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{s}</button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-black text-base text-emerald-800">₹{selectedProduct.price}</span>
                {selectedProduct.mrp > selectedProduct.price && <span className="text-xs text-slate-400 line-through">₹{selectedProduct.mrp}</span>}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { handleAddToCart(selectedProduct, selectedSize); setSelectedProduct(null); }} className="flex-1 py-2.5 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl">Add to Cart</button>
                <button onClick={() => { setCheckoutProduct(selectedProduct); setSelectedProduct(null); setIsCheckoutOpen(true); }} className="flex-1 py-2.5 bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2.5 z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-emerald-800 font-bold' : 'text-slate-400'}`}>
          <ShoppingBag size={18} />
          <span className="text-[10px]">Home</span>
        </button>
        <button onClick={() => setActiveTab('wishlist')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'wishlist' ? 'text-emerald-800 font-bold' : 'text-slate-400'}`}>
          <Heart size={18} />
          <span className="text-[10px]">Wishlist</span>
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'cart' ? 'text-emerald-800 font-bold' : 'text-slate-400'}`}>
          <ShoppingCart size={18} />
          {cart.length > 0 && <span className="absolute -top-1 right-2 bg-amber-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          <span className="text-[10px]">Cart</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-emerald-800 font-bold' : 'text-slate-400'}`}>
          <Package size={18} />
          <span className="text-[10px]">Orders</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'profile' ? 'text-emerald-800 font-bold' : 'text-slate-400'}`}>
          <User size={18} />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
          }
