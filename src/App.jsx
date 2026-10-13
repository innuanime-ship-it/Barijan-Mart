import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, Package, 
  MapPin, CheckCircle, ArrowLeft, Plus, Minus, Trash2, 
  Clock, ShieldCheck, PhoneCall, ChevronRight, AlertCircle, 
  Share2, LogOut, Check, Sparkles, Truck, QrCode, Camera, Lock, Zap, Edit3, ExternalLink
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

const isValidIndianMobile = (num) => {
  const clean = (num || '').replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(clean);
};

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
    name: '', phone: '', password: '', village: ''
  });

  const [loginForm, setLoginForm] = useState({
    name: '', phone: '', password: ''
  });

  const [forgotForm, setForgotForm] = useState({
    name: '', phone: '', village: '', newPassword: '', confirmPassword: ''
  });

  const [profileAddress, setProfileAddress] = useState({
    street: currentUser?.street || '',
    landmark: currentUser?.landmark || ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('bm_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('bm_wishlist') || '[]'));
  const [myOrders, setMyOrders] = useState([]);

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
    fetchCatalog();
    if (currentUser?.phone) {
      fetchUserOrders(currentUser.phone);
    } else {
      setMyOrders([]);
    }

    const catalogChannel = supabase
      .channel('customer-catalog-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchCatalog();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(catalogChannel);
    };
  }, [currentUser]);

  const fetchCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
        const validIds = new Set(data.map(p => p.id));
        setCart(prev => prev.filter(item => validIds.has(item.id)));
        setWishlist(prev => prev.filter(item => validIds.has(item.id)));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (phone) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setMyOrders(data);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
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

  const handleRegister = (e) => {
    e.preventDefault();
    const cleanPhone = (regForm.phone || '').trim().replace(/\D/g, '');
    
    if (!isValidIndianMobile(cleanPhone)) {
      return alert("Enter a valid 10-digit mobile number!");
    }
    if (!regForm.name.trim() || !regForm.password || !regForm.village) {
      return alert("Kripya sabhi details bharein aur gaon select karein!");
    }

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const existing = allUsers.find(u => u.phone === cleanPhone);
    if (existing) {
      return alert("Yeh mobile number pehle se registered hai! Kripya login karein.");
    }

    const newUser = {
      name: regForm.name.trim().toUpperCase(),
      phone: cleanPhone,
      password: regForm.password,
      village: regForm.village,
      street: '',
      landmark: '',
      avatar: null,
      registered_at: new Date().toISOString()
    };

    allUsers.push(newUser);
    localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    localStorage.setItem('bm_current_customer', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setProfileAddress({ street: '', landmark: '' });
    setAuthMode(null);
    alert("Barijan Mart mein registration safal raha!");
  };
    const handleSaveProfileAddress = (e) => {
    e.preventDefault();
    if (!profileAddress.street.trim()) {
      return alert("Ghar / Gali / Ward address bharna anivarya hai!");
    }
    const updated = {
      ...currentUser,
      street: profileAddress.street.trim(),
      landmark: profileAddress.landmark.trim()
    };
    setCurrentUser(updated);
    localStorage.setItem('bm_current_customer', JSON.stringify(updated));

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const idx = allUsers.findIndex(u => u.phone === currentUser.phone);
    if (idx !== -1) {
      allUsers[idx] = updated;
      localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    }
    setIsEditingAddress(false);
    alert("Delivery Address safalta se save ho gaya!");
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 200, 200);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        const updatedUser = { ...currentUser, avatar: compressedBase64 };
        setCurrentUser(updatedUser);
        localStorage.setItem('bm_current_customer', JSON.stringify(updatedUser));

        const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
        const idx = allUsers.findIndex(u => u.phone === currentUser.phone);
        if (idx !== -1) {
          allUsers[idx].avatar = compressedBase64;
          localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
        }
        alert("Profile photo update ho gayi!");
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanName = loginForm.name.trim().toUpperCase();
    const cleanPhone = (loginForm.phone || '').trim().replace(/\D/g, '');

    if (!isValidIndianMobile(cleanPhone)) {
      return alert("Enter a valid 10-digit mobile number!");
    }

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const user = allUsers.find(u => u.phone === cleanPhone && u.name === cleanName && u.password === loginForm.password);
    if (!user) {
      return alert("Registered Name, Mobile number ya Password galat hai!");
    }

    localStorage.setItem('bm_current_customer', JSON.stringify(user));
    setCurrentUser(user);
    setProfileAddress({ street: user.street || '', landmark: user.landmark || '' });
    setAuthMode(null);
    alert(`Welcome back, ${user.name}!`);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const cleanName = forgotForm.name.trim().toUpperCase();
    const cleanPhone = (forgotForm.phone || '').trim().replace(/\D/g, '');
    const cleanVillage = forgotForm.village;

    if (!isValidIndianMobile(cleanPhone)) {
      return alert("Enter a valid 10-digit mobile number!");
    }
    if (!cleanName || !cleanVillage || !forgotForm.newPassword || !forgotForm.confirmPassword) {
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
      return alert("Name, Phone aur Village account se match nahi hue!");
    }

    allUsers[userIndex].password = forgotForm.newPassword;
    localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    alert("Password safalta se badal gaya! Ab naye password se login karein.");
    setAuthMode('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bm_current_customer');
    setMyOrders([]);
  };
    const toggleWishlist = (prod) => {
    if (!currentUser) {
      setAuthMode('register');
      return;
    }
    setWishlist(prev => {
      const exists = prev.find(item => item.id === prod.id);
      if (exists) return prev.filter(item => item.id !== prod.id);
      return [...prev, prod];
    });
  };

  const handleAddToCart = (prod, sizeToUse = null) => {
    if (!currentUser) {
      setAuthMode('register');
      return;
    }
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
    alert("Item Cart mein joda gaya!");
  };

  const handleInitiateBuyNow = (prod) => {
    if (!currentUser) {
      setAuthMode('register');
      return;
    }
    setCheckoutProduct(prod);
    setSelectedSize(prod.sizes?.[0] || 'M');
    setIsCheckoutOpen(true);
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

  const totalProductAmount = getCheckoutItems().reduce((acc, it) => acc + (Number(it.price) * (it.quantity || 1)), 0);
  
  const totalDeliveryFee = getCheckoutItems().reduce((acc, it) => {
    const fee = (it.delivery_fee !== undefined && it.delivery_fee !== null && it.delivery_fee !== '') ? Number(it.delivery_fee) : 0;
    return acc + fee;
  }, 0);

  const primaryUpiId = getCheckoutItems()[0]?.upi_id || 'barijanmart@upi';
  const upiPayUrl = `upi://pay?pa=${primaryUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`;
    const handleExecuteOrder = async () => {
    if (!currentUser) {
      setAuthMode('register');
      return;
    }
    if (!customerLocation) {
      return alert("Kripya 'Allow Location' button dabakar location save karein!");
    }
    if (totalDeliveryFee > 0 && !paymentScreenshot) {
      return alert("Advance Delivery Fee ka payment screenshot upload karna zaroori hai!");
    }
    if (altPhone.trim() && !isValidIndianMobile(altPhone.trim())) {
      return alert("Alternative phone number galat hai! Kripya valid 10-digit number dein.");
    }

    setIsSubmittingOrder(true);
    const newOrderId = 'BM' + Math.floor(100000 + Math.random() * 900000);
    const orderItems = getCheckoutItems();

    const fullDeliveryAddress = `Village: ${currentUser.village}, Street/Ward: ${currentUser.street || 'Not Specified'}${currentUser.landmark ? `, Landmark: ` + currentUser.landmark : ''}, Phone: ${currentUser.phone}${altPhone.trim() ? `, Alt Phone: ` + altPhone.trim() : ''}`;

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
      utr: utrNumber.trim() || null,
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
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative pb-20 select-none">
      <header className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-black text-xs text-white shadow">
                {currentUser?.name ? currentUser.name.charAt(0) : <User size={16} />}
              </div>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">Barijan Mart</h1>
              <p className="text-[10px] text-red-100 font-medium mt-0.5 truncate max-w-[170px]">
                {currentUser ? `📍 ${currentUser.village}` : "⚡ Direct Village Doorstep Delivery"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (!currentUser) setAuthMode('register'); else setActiveTab('wishlist'); }} className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full relative transition shadow-sm">
              <Heart size={17} className={wishlist.length > 0 ? "fill-white text-white" : "text-white"} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow">{wishlist.length}</span>}
            </button>
            <button onClick={() => { if (!currentUser) setAuthMode('register'); else setActiveTab('cart'); }} className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full relative transition shadow-sm">
              <ShoppingCart size={17} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow">{cart.length}</span>}
            </button>
          </div>
        </div>

        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search groceries, clothing, trending items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-xs text-slate-900 shadow-inner outline-none placeholder-slate-400 focus:ring-2 focus:ring-red-400 transition"
          />
        </div>
      </header>

      <div className="bg-gradient-to-r from-red-800 to-rose-900 text-white px-4 py-1.5 flex items-center justify-between text-[11px] shadow-inner">
        <div className="flex items-center gap-1.5 font-bold">
          <PhoneCall size={13} className="text-yellow-300 animate-pulse" />
          <span>Customer Care Support:</span>
        </div>
        <a href="tel:9204184716" className="bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full font-black text-yellow-300 tracking-wider">
          9204184716
        </a>
      </div>
            <main className="p-3.5 flex-1">
        {activeTab === 'product-detail' && selectedProduct && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
            <button 
              onClick={() => setActiveTab('home')} 
              className="mb-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Products
            </button>

            <div className="w-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
              <img 
                src={selectedProduct.images?.[0] || 'https://via.placeholder.com/300'} 
                alt={selectedProduct.title} 
                className="w-full max-h-[480px] object-contain rounded-2xl" 
              />
            </div>

            <div className="mt-4">
              <h2 className="font-black text-lg text-slate-900 leading-snug">{selectedProduct.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs font-bold text-slate-800">Size:</span>
                  {selectedProduct.sizes.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setSelectedSize(s)} 
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                        selectedSize === s ? 'bg-red-700 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-baseline gap-2.5 mt-4">
                <span className="font-black text-2xl text-red-700">₹{selectedProduct.price}</span>
                {selectedProduct.mrp > selectedProduct.price && <span className="text-sm text-slate-400 line-through">₹{selectedProduct.mrp}</span>}
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                  Delivery: {selectedProduct.delivery_fee > 0 ? `₹${selectedProduct.delivery_fee}` : 'Free'}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>{selectedProduct.return_policy || '7 Days Replacement Policy'}</span>
              </div>

              <div className="flex gap-2.5 mt-6">
                <button 
                  onClick={() => handleAddToCart(selectedProduct, selectedSize)} 
                  className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs rounded-xl active:scale-95 transition"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleInitiateBuyNow(selectedProduct)} 
                  className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div>
            <div className="mb-3 p-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/20 rounded-xl"><Truck size={14} className="text-white" /></span>
                <div>
                  <p className="text-[11px] font-black leading-tight">Fixed Villages Delivery</p>
                  <p className="text-[9px] text-red-100">Doorstep delivery with live GPS accuracy</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-lg shadow">Free COD</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition shadow-sm ${
                    selectedCategory === c ? 'bg-red-700 text-white shadow-red-700/20' : 'bg-white text-slate-700 border border-slate-200'
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
                filteredProducts.map(p => {
                  const discountPercent = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group">
                      <div className="relative cursor-pointer overflow-hidden bg-slate-50" onClick={() => { setSelectedProduct(p); setSelectedSize(p.sizes?.[0] || 'M'); setActiveTab('product-detail'); }}>
                        <img src={p.images?.[0] || 'https://via.placeholder.com/200'} alt={p.title} className="w-full h-36 object-contain bg-slate-100 group-hover:scale-105 transition duration-300" />
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            {discountPercent}% OFF
                          </span>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }} 
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-600 active:scale-90 transition"
                        >
                          <Heart size={14} className={wishlist.some(w => w.id === p.id) ? "fill-red-600 text-red-600" : ""} />
                        </button>
                      </div>
                      <div className="p-2.5 flex flex-col flex-1 justify-between">
                        <div onClick={() => { setSelectedProduct(p); setSelectedSize(p.sizes?.[0] || 'M'); setActiveTab('product-detail'); }} className="cursor-pointer">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{p.title}</h3>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="font-black text-sm text-red-700">₹{p.price}</span>
                            {p.mrp > p.price && <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-2.5">
                          <button onClick={() => handleAddToCart(p)} className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-black text-[11px] rounded-lg transition active:scale-95">Cart</button>
                          <button onClick={() => handleInitiateBuyNow(p)} className="flex-1 py-1.5 bg-red-700 hover:bg-red-800 text-white font-black text-[11px] rounded-lg shadow-sm transition active:scale-95">Buy</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
                      {activeTab === 'cart' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><ShoppingCart size={16} className="text-red-700" /> Aapka Cart ({cart.length})</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                <ShoppingCart size={40} className="mx-auto text-slate-300 mb-2" /><p className="text-xs font-bold text-slate-400">Aapka cart khaali hai</p>
                <button onClick={() => setActiveTab('home')} className="mt-4 px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl shadow-md">Shopping Shuru Karein</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <img src={item.images?.[0]} className="w-16 h-16 rounded-xl object-contain bg-slate-100" />
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
                  <div className="flex justify-between text-xs py-1 text-slate-600"><span>Advance Delivery Fee:</span><b className="text-red-700">₹{totalDeliveryFee}</b></div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between text-sm font-black text-slate-900"><span>Total Due (COD):</span><span>₹{totalProductAmount}</span></div>
                  <button onClick={() => { setCheckoutProduct(null); setIsCheckoutOpen(true); }} className="w-full mt-4 py-3 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition">Checkout ({cart.length} Items)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Heart size={16} className="text-red-600 fill-red-600" /> Wishlist</h2>
            {wishlist.length === 0 ? (
              <p className="text-center py-20 text-xs font-bold text-slate-400">Wishlist mein koi product nahi hai.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border p-2.5 shadow-sm">
                    <img src={p.images?.[0]} className="w-full h-28 object-contain rounded-xl bg-slate-50" />
                    <h4 className="font-bold text-xs truncate mt-2">{p.title}</h4>
                    <p className="font-black text-xs text-red-700">₹{p.price}</p>
                    <button onClick={() => handleAddToCart(p)} className="w-full mt-2 py-1.5 bg-red-50 text-red-700 font-extrabold text-[11px] rounded-lg">Move to Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Package size={16} className="text-red-700" /> Mere Orders</h2>
            {!currentUser ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border"><p className="text-xs font-bold text-slate-400">Orders dekhne ke liye pehle Login ya Register karein.</p></div>
            ) : myOrders.filter(o => o.id && o.customer_phone).length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                <Package size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">Aapka koi purana order nahi hai.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myOrders.filter(o => o.id && o.customer_phone).map((o) => {
                  const formattedDate = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently Placed';
                  return (
                    <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start border-b pb-2">
                        <div>
                          <span className="font-black text-xs text-red-700">#{o.id}</span>
                          <p className="text-[10px] text-slate-400">{formattedDate}</p>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700">{o.status || 'Order Placed'}</span>
                      </div>
                      
                      <div className="py-2.5 flex flex-col gap-2">
                        {Array.isArray(o.items) && o.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <img src={it.images?.[0] || 'https://via.placeholder.com/80'} alt={it.title} className="w-12 h-12 rounded-lg object-contain bg-white" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate">{it.title}</h5>
                              <p className="text-[10px] text-slate-500">Size: {it.size || 'Std'} | Qty: {it.quantity || 1}</p>
                            </div>
                            <span className="font-black text-xs text-slate-900">₹{it.price * (it.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-2 flex justify-between text-[11px] text-slate-600">
                        <span>COD Due: <b>₹{o.total_price || 0}</b></span>
                        <span>Adv Paid: <b className="text-red-700">₹{o.delivery_fee_paid || 0}</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-black text-slate-900">User Profile</h2>
            {currentUser ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-200">
                  <div className="relative">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-red-200 border-2 border-red-400 flex items-center justify-center font-black text-lg text-red-700">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-red-700 text-white p-1 rounded-full cursor-pointer shadow">
                      <Camera size={11} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
                    </label>
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-600">📞 {currentUser.phone}</p>
                    <p className="text-xs text-red-700 font-bold mt-0.5">🏡 {currentUser.village}</p>
                  </div>
                </div>

                <label className="text-center p-2.5 border border-dashed border-red-300 rounded-xl text-xs font-bold text-red-700 cursor-pointer bg-red-50/50">
                  {currentUser.avatar ? "Change Profile Photo" : "+ Set Profile Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
                </label>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5"><MapPin size={13} className="text-red-700" /> Saved Delivery Address</span>
                    <button onClick={() => setIsEditingAddress(!isEditingAddress)} className="text-red-700 font-bold text-[11px] flex items-center gap-1">
                      <Edit3 size={12} /> {isEditingAddress ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditingAddress ? (
                    <form onSubmit={handleSaveProfileAddress} className="flex flex-col gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="House No, Ward, Street, Mohalla *" 
                        value={profileAddress.street} 
                        onChange={e => setProfileAddress({ ...profileAddress, street: e.target.value })} 
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Nearby Landmark (e.g. Near Mosque/School)" 
                        value={profileAddress.landmark} 
                        onChange={e => setProfileAddress({ ...profileAddress, landmark: e.target.value })} 
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-white" 
                      />
                      <button type="submit" className="py-2 bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm">Save Address</button>
                    </form>
                  ) : (
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <p><b>Village:</b> {currentUser.village}</p>
                      <p><b>Street / House:</b> {currentUser.street || 'Address add nahi kiya gaya'}</p>
                      {currentUser.landmark && <p><b>Landmark:</b> {currentUser.landmark}</p>}
                    </div>
                  )}
                </div>

                <button onClick={handleLogout} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition">
                  <LogOut size={14} /> Khata Logout Karein
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4">Fast delivery aur live tracking ke liye apna account kholein.</p>
                <div className="flex gap-2">
                  <button onClick={() => setAuthMode('login')} className="flex-1 py-2.5 bg-red-700 text-white font-bold text-xs rounded-xl shadow-md">Login</button>
                  <button onClick={() => setAuthMode('register')} className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md">New Register</button>
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
                  <button onClick={() => { setIsCheckoutOpen(false); setAuthMode('login'); }} className="flex-1 py-2.5 bg-red-700 text-white font-bold text-xs rounded-xl">Login</button>
                  <button onClick={() => { setIsCheckoutOpen(false); setAuthMode('register'); }} className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">New Register</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-slate-900">Delivery Address (Locked):</span>
                    <button onClick={() => { setIsCheckoutOpen(false); setActiveTab('profile'); }} className="text-red-700 text-[10px] font-bold underline">Edit in Profile</button>
                  </div>
                  <p className="text-slate-800 font-medium"><b>Name:</b> {currentUser.name}</p>
                  <p className="text-slate-800 font-medium"><b>Village:</b> {currentUser.village}</p>
                  <p className="text-slate-700 font-medium"><b>Address:</b> {currentUser.street ? `${currentUser.street}${currentUser.landmark ? ', ' + currentUser.landmark : ''}` : 'Address profile mein jodein'}</p>
                  <p className="text-slate-500 mt-1">📞 Registered Mobile: <b className="text-slate-800">{currentUser.phone}</b></p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Alternative Mobile Number (Optional):</label>
                  <input 
                    type="tel" 
                    maxLength={10}
                    placeholder="10-digit Alternative Mobile" 
                    value={altPhone} 
                    onChange={e => setAltPhone(e.target.value.replace(/\D/g, ''))} 
                    className="w-full px-3 py-2 text-xs border rounded-xl" 
                  />
                </div>

                <div className="my-1">
                  {!customerLocation ? (
                    <button
                      type="button"
                      onClick={handleAllowLocation}
                      disabled={locLoading}
                      className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
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
                  <p className="text-[11px] font-bold text-slate-700">
                    Advance Delivery Fee: <b className="text-red-700">₹{totalDeliveryFee}</b> {totalDeliveryFee === 0 && "(Free Delivery)"}
                  </p>

                  {totalDeliveryFee > 0 && (
                    <>
                      <a 
                        href={upiPayUrl}
                        className="mt-2.5 mb-3 w-full py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                        <ExternalLink size={14} /> Pay via PhonePe / GPay / Paytm
                      </a>

                      <p className="text-[10px] text-slate-500 mb-2">Ya neeche diye QR code ko scan karke pay karein:</p>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiPayUrl)}`} 
                        alt="UPI QR" 
                        className="mx-auto w-32 h-32 rounded-lg border p-1 bg-white" 
                      />

                      <label className="block mt-3 text-xs font-bold text-red-700 border-2 border-dashed border-red-300 bg-red-50/50 rounded-xl py-2.5 cursor-pointer">
                        {paymentScreenshot ? "✓ Payment Screenshot Attached" : "Upload Payment Screenshot * (Compulsory)"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                      </label>

                      <input 
                        type="text" 
                        placeholder="Enter 12-digit UTR No (Optional)" 
                        value={utrNumber} 
                        onChange={e => setUtrNumber(e.target.value)} 
                        className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 bg-white rounded-xl text-center font-mono" 
                      />
                    </>
                  )}
                </div>

                <button 
                  onClick={handleExecuteOrder} 
                  disabled={isSubmittingOrder} 
                  className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
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
              maxLength={10}
              placeholder="10-Digit Mobile Number *" 
              value={regForm.phone} 
              onChange={e => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })} 
              className="px-3 py-2 text-xs border rounded-xl font-mono" 
            />
            <input 
              type="password" 
              placeholder="Create Password *" 
              value={regForm.password} 
              onChange={e => setRegForm({ ...regForm, password: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <div>
              <label className="text-[10px] font-bold text-red-700 block mb-1">Select Village (Delivery In These 15 Villages Only):</label>
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
            <button type="submit" className="py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md mt-1">Register Account</button>
            <div className="flex justify-between items-center text-[11px] mt-1">
              <span onClick={() => setAuthMode('login')} className="text-red-700 font-bold cursor-pointer">Login Screen</span>
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
              maxLength={10}
              placeholder="Registered 10-Digit Mobile *" 
              value={loginForm.phone} 
              onChange={e => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '') })} 
              className="px-3 py-2 text-xs border rounded-xl font-mono" 
            />
            <input 
              type="password" 
              placeholder="Password *" 
              value={loginForm.password} 
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} 
              className="px-3 py-2 text-xs border rounded-xl" 
            />
            <button type="submit" className="py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md">Login Karein</button>
            <div className="flex justify-between items-center text-[11px]">
              <span onClick={() => setAuthMode('forgot')} className="text-red-600 font-bold cursor-pointer">Forgot Password?</span>
              <span onClick={() => setAuthMode('register')} className="text-slate-800 font-bold cursor-pointer">New Register</span>
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
              maxLength={10}
              placeholder="Registered 10-Digit Mobile *" 
              value={forgotForm.phone} 
              onChange={e => setForgotForm({ ...forgotForm, phone: e.target.value.replace(/\D/g, '') })} 
              className="px-3 py-2 text-xs border rounded-xl font-mono" 
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
            <button type="submit" className="py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md mt-1">Set New Password</button>
            <div className="flex justify-between items-center text-[11px] mt-1">
              <span onClick={() => setAuthMode('login')} className="text-red-700 font-bold cursor-pointer">Login Screen</span>
              <span onClick={() => setAuthMode(null)} className="text-slate-400 font-bold cursor-pointer">Cancel</span>
            </div>
          </form>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2.5 z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' || activeTab === 'product-detail' ? 'text-red-700 font-bold' : 'text-slate-400'}`}>
          <ShoppingBag size={18} />
          <span className="text-[10px]">Home</span>
        </button>
        <button onClick={() => { if (!currentUser) setAuthMode('register'); else setActiveTab('wishlist'); }} className={`flex flex-col items-center gap-0.5 ${activeTab === 'wishlist' ? 'text-red-700 font-bold' : 'text-slate-400'}`}>
          <Heart size={18} />
          <span className="text-[10px]">Wishlist</span>
        </button>
        <button onClick={() => { if (!currentUser) setAuthMode('register'); else setActiveTab('cart'); }} className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'cart' ? 'text-red-700 font-bold' : 'text-slate-400'}`}>
          <ShoppingCart size={18} />
          {cart.length > 0 && <span className="absolute -top-1 right-2 bg-yellow-400 text-slate-900 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          <span className="text-[10px]">Cart</span>
        </button>
        <button onClick={() => { if (!currentUser) setAuthMode('register'); else setActiveTab('orders'); }} className={`flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-red-700 font-bold' : 'text-slate-400'}`}>
          <Package size={18} />
          <span className="text-[10px]">Orders</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'profile' ? 'text-red-700 font-bold' : 'text-slate-400'}`}>
          <User size={18} />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
          }
            
              
                
                                                                    
      
      
  

        
  
  
  
