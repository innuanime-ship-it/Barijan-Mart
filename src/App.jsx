import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Search, ShoppingBag, User, Package, ShieldCheck, 
  Trash2, Edit3, ArrowLeft, CheckCircle2, UploadCloud, Truck, Printer, Eye, EyeOff, Camera, Ban, Check, KeyRound 
} from 'lucide-react';

const ADMIN_HASH = "3651862dd4c79fbb99a8927e6efe25f8e2551ce55b4d366d62773117363ef5e1";
const SUPER_ADMIN_OVERRIDE_SECRET = 'vitade.poraseta-joki-mola"neta!beta';

const sha256 = async (text) => {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) { return ''; }
};

const DEFAULT_PRODUCTS = [
  {
    id: "p1", title: "Women Floral Printed Kurti", description: "Pure cotton soft floral printed kurti for festive and daily wear.",
    category: "Fashion", price: 299, mrp: 899, deliveryFee: 49, sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Cotton", color: "Multicolor", productType: "Kurti",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=60", upiId: "barijanmart@upi", qrImage: ""
  },
  {
    id: "p2", title: "Boys Shirt classic Lenin", description: "Slim fit breathable casual cotton shirt with premium stitching.",
    category: "Fashion", price: 499, mrp: 599, deliveryFee: 49, sizes: ["M", "L", "XL"],
    fabric: "Cotton Lenin", color: "Grey Check", productType: "Casual Shirt",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60", upiId: "barijanmart@upi", qrImage: ""
  },
  {
    id: "p3", title: "Running Sports Shoes", description: "Lightweight cushioned mesh running shoes with firm grip.",
    category: "Footwear", price: 499, mrp: 1499, deliveryFee: 69, sizes: ["6", "7", "8", "9", "10"],
    color: "Red", productType: "Sports Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60", upiId: "barijanmart@upi", qrImage: ""
  }
];

export default function App() {
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('bm_products') || 'null') || DEFAULT_PRODUCTS);
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('bm_users') || '[]'));
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('bm_current_user') || 'null'));
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('bm_orders') || '[]'));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('bm_cart') || '[]'));

  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState(null);

  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authConfirm, setAuthConfirm] = useState('');
  const [authDob, setAuthDob] = useState('');
  const [loginNeedsDob, setLoginNeedsDob] = useState(false);
  const [authLivePhoto, setAuthLivePhoto] = useState('');
  const [loginNeedsPhoto, setLoginNeedsPhoto] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [superAdminSecretInput, setSuperAdminSecretInput] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [enteredUtr, setEnteredUtr] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const [adminTab, setAdminTab] = useState('products');
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({
    title: '', description: '', category: 'Fashion', price: '', mrp: '', deliveryFee: '49', sizes: 'S, M, L, XL',
    fabric: '', color: '', productType: '', expiry: '', weight: '', warranty: '', image: '', upiId: 'barijanmart@upi', qrImage: ''
  });
    useEffect(() => { localStorage.setItem('bm_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('bm_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { 
    localStorage.setItem('bm_current_user', JSON.stringify(currentUser));
    if (currentUser) setCheckoutAddress({ name: currentUser.name || '', phone: currentUser.phone || '', address: currentUser.address || '', city: currentUser.city || '', pincode: currentUser.pincode || '' });
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('bm_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('bm_cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    if (currentUser) {
      const live = users.find(u => u.phone === currentUser.phone);
      if (live) {
        if (live.isBlocked) {
          alert("Aapka account block kar diya gaya hai!");
          setCurrentUser(null);
        } else if (live.role !== currentUser.role) {
          setCurrentUser(live);
        }
      }
    }
  }, [users]);

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const pl = videoRef.current.play?.();
      if (pl && pl.catch) pl.catch(() => {});
    }
  }, [cameraOn]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const handleFile = (e, cb) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => cb(r.result); r.readAsDataURL(file); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no-camera-api');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
    } catch (err) {
      setCameraError("Camera nahi khul paya. Permission allow karein.");
    }
  };

  const capturePhoto = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return alert("Camera abhi ready nahi hai, 1 second baad dabayein.");
    const size = 320;
    const min = Math.min(v.videoWidth, v.videoHeight);
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    c.getContext('2d').drawImage(v, (v.videoWidth - min) / 2, (v.videoHeight - min) / 2, min, min, 0, 0, size, size);
    const photoData = c.toDataURL('image/jpeg', 0.7);

    const isDuplicate = users.some(u => (u.role === 'super_admin' || u.role === 'collaborator') && u.livePhoto && u.livePhoto === photoData);
    if (isDuplicate) {
      alert("Yeh photo already registered hai! Kripya apni real-time live photo kheechein.");
      return;
    }

    setAuthLivePhoto(photoData);
    stopCamera();
  };

  const closeAuth = () => {
    stopCamera(); setCameraError(''); setAuthLivePhoto(''); setLoginNeedsPhoto(false); setLoginNeedsDob(false); setAuthDob('');
    setAuthPassword(''); setAuthConfirm(''); setShowPassword(false); setActiveModal(null);
  };

  const switchAuthMode = (mode) => {
    stopCamera(); setCameraError(''); setAuthLivePhoto(''); setLoginNeedsPhoto(false); setLoginNeedsDob(false); setAuthDob('');
    setAuthPassword(''); setAuthConfirm(''); setShowPassword(false); setAuthMode(mode);
  };

  const orderOwner = (o) => users.find((u) => u.phone === (o.userPhone || o.customerPhone));
  const ordersOf = (u) => orders.filter((o) => (o.userPhone || o.customerPhone) === u.phone);

  const renderLivePhoto = (photo, cls = 'w-12 h-12') => photo ? (
    <img src={photo} alt="Live" onClick={(e) => { e.stopPropagation(); setPreviewScreenshotUrl(photo); }} className={`${cls} rounded-full object-cover border-2 border-fuchsia-300 cursor-pointer shrink-0`} />
  ) : (
    <div className={`${cls} rounded-full bg-slate-100 border flex items-center justify-center text-slate-400 shrink-0`}><User size={18} /></div>
  );

  const renderLiveCapture = () => (
    <div className="bg-fuchsia-50/60 border border-fuchsia-200 rounded-2xl p-3 flex flex-col items-center gap-2">
      <span className="text-2xs font-extrabold text-fuchsia-800 uppercase text-center">Live Action Photo (Zaroori)</span>
      {authLivePhoto ? (
        <>
          <img src={authLivePhoto} alt="Live" className="w-24 h-24 rounded-full object-cover border-2 border-fuchsia-400" />
          <span className="text-2xs font-bold text-emerald-600">Photo verified ✓</span>
          <button type="button" onClick={() => { setAuthLivePhoto(''); startCamera(); }} className="text-2xs text-fuchsia-600 font-bold underline">Dobara lein</button>
        </>
      ) : cameraOn ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} className="w-40 h-40 rounded-full object-cover bg-black" />
          <button type="button" onClick={capturePhoto} className="px-4 py-2 bg-fuchsia-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"><Camera size={14} /> Photo Kheechein</button>
          <button type="button" onClick={stopCamera} className="text-2xs text-slate-500 font-bold">Cancel</button>
        </>
      ) : (
        <button type="button" onClick={startCamera} className="px-4 py-2 bg-white border-2 border-dashed border-fuchsia-300 text-fuchsia-700 text-xs font-bold rounded-xl flex items-center gap-1.5"><Camera size={14} /> Camera Kholein</button>
      )}
      {cameraError && <p className="text-2xs text-red-600 text-center">{cameraError}</p>}
    </div>
  );

  const openProductDetail = (p) => { setSelectedProduct(p); setSelectedSize(p.sizes?.[0] || 'Standard'); setActiveModal('detail'); };

  const addToCart = (p, sz) => {
    const s = sz || selectedSize || p.sizes?.[0] || 'Standard';
    const key = `${p.id}-${s}`;
    const exists = cart.find(i => i.cartKey === key);
    if (exists) setCart(cart.map(i => i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { ...p, cartKey: key, selectedSize: s, quantity: 1 }]);
    alert(`${p.title} (${s}) cart me add ho gaya!`);
  };

  const removeFromCart = (key) => setCart(cart.filter(i => i.cartKey !== key));

  const startCheckout = (singleProd = null) => {
    if (!currentUser) { setAuthMode('login'); setActiveModal('auth'); alert("Order karne ke liye pehle Login / Register karein."); return; }
    if (singleProd) setSelectedProduct({ ...singleProd, selectedSize: selectedSize || singleProd.sizes?.[0] || 'Standard', quantity: 1 });
    else setSelectedProduct(null);
    setIsEditingAddress(!currentUser?.address); setEnteredUtr(''); setPaymentScreenshot(''); setActiveModal('checkout');
  };

  const getCheckoutItems = () => selectedProduct ? [selectedProduct] : cart;
  const totalDeliveryFee = getCheckoutItems().reduce((s, i) => s + (Number(i.deliveryFee || 49) * (i.quantity || 1)), 0);
  const totalProductPrice = getCheckoutItems().reduce((s, i) => s + (Number(i.price) * (i.quantity || 1)), 0);
  const activeUpiId = getCheckoutItems()[0]?.upiId || 'barijanmart@upi';
  const customQr = getCheckoutItems()[0]?.qrImage || '';

  const handlePlaceOrder = () => {
    if (!currentUser) return alert("Order karne ke liye pehle Login karein!");
    if (!checkoutAddress.name || !checkoutAddress.phone || !checkoutAddress.address) return alert("Delivery address pura bharein!");
    if (!/^[0-9]{10}$/.test(checkoutAddress.phone)) return alert("Mobile number 10 digit ka hona chahiye!");
    if (!enteredUtr.trim() && !paymentScreenshot) return alert("12-digit UTR number dalein YA payment screenshot upload karein!");

    const newOrder = {
      orderId: 'BM' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      userPhone: currentUser.phone, customerName: checkoutAddress.name, customerPhone: checkoutAddress.phone,
      fullAddress: `${checkoutAddress.address}${checkoutAddress.city ? ', ' + checkoutAddress.city : ''}${checkoutAddress.pincode ? ' - ' + checkoutAddress.pincode : ''}`,
      items: getCheckoutItems().map(i => ({ title: i.title, price: i.price, quantity: i.quantity || 1, image: i.image, size: i.selectedSize || 'Standard' })),
      totalPrice: totalProductPrice, deliveryFeePaid: totalDeliveryFee,
      utr: enteredUtr.trim() || 'N/A (Screenshot Attached)', screenshot: paymentScreenshot || null,
      status: 'Order Placed', estimatedDelivery: '2-4 Days'
    };
    setOrders([newOrder, ...orders]); setLastOrderDetails(newOrder);
    const savedAddr = { address: checkoutAddress.address, city: checkoutAddress.city, pincode: checkoutAddress.pincode };
    setUsers(users.map((u) => u.phone === currentUser.phone ? { ...u, ...savedAddr } : u));
    setCurrentUser({ ...currentUser, ...savedAddr });
    if (!selectedProduct) setCart([]);
    setEnteredUtr(''); setPaymentScreenshot(''); setActiveModal('success');
  };

  const deleteOrder = (id) => {
    if (window.confirm("Order delete karein?")) {
      setOrders(orders.filter(o => o.orderId !== id));
      if (selectedOrderForInvoice?.orderId === id) setActiveModal(null);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.title || !prodForm.price || !prodForm.image) return alert("Title, Price aur Photo zaroori hain!");
    const sArray = typeof prodForm.sizes === 'string' ? prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : ["Standard"];
    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? { ...prodForm, sizes: sArray, id: editingProductId } : p));
      setEditingProductId(null);
    } else {
      setProducts([{ ...prodForm, id: 'p_' + Date.now(), price: Number(prodForm.price), mrp: Number(prodForm.mrp || prodForm.price * 2), deliveryFee: Number(prodForm.deliveryFee || 49), sizes: sArray }, ...products]);
    }
    setProdForm({ title: '', description: '', category: 'Fashion', price: '', mrp: '', deliveryFee: '49', sizes: 'S, M, L, XL', fabric: '', color: '', productType: '', expiry: '', weight: '', warranty: '', image: '', upiId: 'barijanmart@upi', qrImage: '' });
    setAdminTab('products');
  };
    const handleAuth = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(authPhone)) return alert("Mobile number 10 digit ka hona chahiye!");
    if (!authPassword) return alert("Password dalein!");
    const today = new Date().toISOString().slice(0, 10);

    const isAdminSecret = (await sha256(authPassword)) === ADMIN_HASH;
    const existingSuperAdmin = users.find(u => u.role === 'super_admin');

    if (authMode === 'register') {
      if (!authName.trim()) return alert("Apna poora naam dalein!");
      if (users.find(u => u.phone === authPhone)) return alert("Mobile number pehle se registered hai! Login karein.");
      if (!authLivePhoto) return alert("Photo lena zaroori hai!");

      let assignedRole = 'customer';
      if (isAdminSecret) {
        assignedRole = !existingSuperAdmin ? 'super_admin' : 'collaborator';
      }

      if (assignedRole === 'customer') {
        if (!authDob) return alert("Date of Birth select karein!");
        if (authDob > today) return alert("Date of Birth invalid hai!");
      }

      const u = { 
        name: authName.trim(), phone: authPhone, 
        password: isAdminSecret ? '' : authPassword, 
        role: assignedRole, dob: authDob || '', livePhoto: authLivePhoto, 
        isBlocked: false, createdAt: new Date().toISOString() 
      };

      setUsers([...users, u]); 
      setCurrentUser(u); 
      closeAuth();
      if (assignedRole === 'super_admin' || assignedRole === 'collaborator') setCurrentTab('admin');
    } else {
      const u = users.find(x => x.phone === authPhone);
      if (!u) return alert("Account nahi mila! Register karein.");
      if (u.isBlocked) return alert("Aapka account admin dwara block kar diya gaya hai!");
      if (!isAdminSecret && u.password !== authPassword) return alert("Galat Password!");

      let finalRole = u.role;
      if (isAdminSecret) {
        if (!existingSuperAdmin || existingSuperAdmin.phone === u.phone) {
          finalRole = 'super_admin';
        } else {
          finalRole = 'collaborator';
        }
      }

      let livePhoto = u.livePhoto || authLivePhoto;
      let dob = u.dob || authDob;

      if ((!livePhoto && !authLivePhoto) || (!dob && !authDob && finalRole === 'customer')) {
        if (!livePhoto) setLoginNeedsPhoto(true);
        if (!dob) setLoginNeedsDob(true);
        return alert("Profile details adhoori hain. Kripya live photo & details provide karein.");
      }

      const updatedUser = { ...u, role: finalRole, livePhoto, dob, password: (finalRole === 'super_admin' || finalRole === 'collaborator') ? '' : u.password };
      setUsers(users.map(x => x.phone === u.phone ? updatedUser : x));
      setCurrentUser(updatedUser); 
      closeAuth();
      if (finalRole === 'super_admin' || finalRole === 'collaborator') setCurrentTab('admin');
    }
  };

  const handleUpgradeToSuperAdmin = () => {
    if (!currentUser) return alert("Pehle login karein!");
    if (currentUser.role !== 'collaborator') {
      return alert("Access Denied! Sirf sub-admin (collaborator) hi super admin ban sakte hain.");
    }
    if (superAdminSecretInput !== SUPER_ADMIN_OVERRIDE_SECRET) {
      return alert("Galat Super Admin Secret Code!");
    }

    const updatedUsers = users.map(u => {
      if (u.phone === currentUser.phone) {
        return { ...u, role: 'super_admin', isBlocked: false };
      }
      if (u.role === 'super_admin') {
        return { ...u, role: 'collaborator' };
      }
      return u;
    });

    setUsers(updatedUsers);
    const me = { ...currentUser, role: 'super_admin', isBlocked: false };
    setCurrentUser(me);
    setSuperAdminSecretInput('');
    alert("Badhaai ho! Aap ab Main Super Admin ban chuke hain.");
  };

  const toggleBlockCollaborator = (phone) => {
    setUsers(users.map(u => u.phone === phone ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  const removeCollaborator = (phone) => {
    if (window.confirm("Kya aap sach me is collaborator ko delete karna chahte hain?")) {
      setUsers(users.filter(u => u.phone !== phone));
    }
  };

  const filtered = products.filter(p => (selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()) && p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const myOrders = currentUser ? ordersOf(currentUser) : [];
  const customers = users.filter(u => u.role === 'customer');
  const allAdmins = users.filter(u => u.role === 'super_admin' || u.role === 'collaborator');
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isCollaborator = currentUser?.role === 'collaborator';
  const hasAdminPanelAccess = isSuperAdmin || isCollaborator;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col relative shadow-xl pb-20 print:shadow-none print:pb-0 print:bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-lg text-slate-700 hover:bg-slate-100"><Menu size={24} /></button>
          <h1 className="text-xl font-extrabold tracking-tight text-fuchsia-600">Barijan Mart</h1>
        </div>
        <button onClick={() => currentUser ? setCurrentTab('account') : setActiveModal('auth')} className="w-8 h-8 rounded-full overflow-hidden bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center text-fuchsia-600 font-bold">
          {currentUser?.livePhoto ? <img src={currentUser.livePhoto} alt="u" className="w-full h-full object-cover" /> : <User size={18} />}
        </button>
      </header>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex print:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    {currentUser?.name || "Guest"}
                    {isSuperAdmin && <span className="bg-amber-100 text-amber-800 text-3xs font-black px-1.5 py-0.5 rounded">MAIN ADMIN</span>}
                    {isCollaborator && <span className="bg-sky-100 text-sky-800 text-3xs font-black px-1.5 py-0.5 rounded">COLLABORATOR</span>}
                  </h3>
                  <p className="text-xs text-slate-400">{currentUser?.phone || "Login required"}</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button onClick={() => { setCurrentTab('home'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'home' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><ShoppingBag size={18} /> Home</button>
                <button onClick={() => { setCurrentTab('cart'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'cart' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><ShoppingBag size={18} /> Cart ({cart.length})</button>
                <button onClick={() => { setCurrentTab('orders'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'orders' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><Package size={18} /> My Orders</button>
                {hasAdminPanelAccess ? (
                  <button onClick={() => { setCurrentTab('admin'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'admin' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><ShieldCheck size={18} /> Admin Panel</button>
                ) : (
                  <button onClick={() => { setAuthMode('login'); setActiveModal('auth'); setSidebarOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600"><ShieldCheck size={18} /> Admin / Staff Login</button>
                )}
              </div>
            </div>
            {currentUser && <button onClick={() => { setCurrentUser(null); setSidebarOpen(false); }} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm">Logout</button>}
          </div>
        </div>
      )}
            {/* HOME */}
      {currentTab === 'home' && (
        <main className="p-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Fashion', 'Footwear', 'Grocery', 'Electronics'].map((c) => (
              <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${selectedCategory === c ? 'bg-fuchsia-600 text-white' : 'bg-white text-slate-600 border'}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <div key={p.id} onClick={() => openProductDetail(p)} className="bg-white rounded-2xl border overflow-hidden shadow-2xs flex flex-col justify-between cursor-pointer">
                <img src={p.image} alt="" className="w-full aspect-square object-cover bg-slate-100" />
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 line-clamp-1">{p.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-extrabold text-sm text-slate-900">₹{p.price}</span>
                      <span className="text-2xs text-slate-400 line-through">₹{p.mrp}</span>
                    </div>
                    <div className="mt-1 bg-fuchsia-50 text-fuchsia-700 text-2xs font-bold px-2 py-0.5 rounded-md inline-block">🚚 Fee: ₹{p.deliveryFee}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProductDetail(p); }} className="mt-2 py-1.5 w-full bg-fuchsia-600 text-white text-2xs font-bold rounded-lg">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* DETAIL MODAL */}
      {activeModal === 'detail' && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto print:hidden">
          <div className="sticky top-0 bg-white px-4 py-3 border-b flex items-center justify-between z-10">
            <button onClick={() => setActiveModal(null)}><ArrowLeft size={22} className="text-slate-800" /></button>
            <span className="font-bold text-xs text-slate-600 uppercase">{selectedProduct.category}</span>
            <button onClick={() => addToCart(selectedProduct, selectedSize)}><ShoppingBag size={20} className="text-slate-700" /></button>
          </div>
          <div className="flex-1 pb-24">
            <img src={selectedProduct.image} alt="" className="w-full aspect-square object-cover bg-slate-100" />
            <div className="p-4 flex flex-col gap-3">
              <h1 className="text-base font-extrabold text-slate-900 leading-snug">{selectedProduct.title}</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">₹{selectedProduct.price}</span>
                <span className="text-sm text-slate-400 line-through">₹{selectedProduct.mrp}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{Math.round(((selectedProduct.mrp - selectedProduct.price)/selectedProduct.mrp)*100)}% OFF</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-2xs font-bold px-2.5 py-1 rounded-lg w-fit">
                <Truck size={14} className="text-amber-700" /> Advance Delivery Fee: ₹{selectedProduct.deliveryFee}
              </div>
              {selectedProduct.sizes && (
                <div className="border-t pt-3">
                  <span className="text-xs font-bold text-slate-800 block mb-2">Select Size:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((sz) => (
                      <button key={sz} onClick={() => setSelectedSize(sz)} className={`min-w-10 h-10 px-3 rounded-xl border text-xs font-bold ${selectedSize === sz ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-slate-50 text-slate-700'}`}>{sz}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-3">
                <h3 className="text-xs font-extrabold text-slate-900 mb-2 uppercase">Product Details</h3>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
                  {selectedProduct.fabric && <div><span className="text-2xs text-slate-400 block font-bold">Fabric</span><span className="font-semibold text-slate-800">{selectedProduct.fabric}</span></div>}
                  {selectedProduct.color && <div><span className="text-2xs text-slate-400 block font-bold">Color</span><span className="font-semibold text-slate-800">{selectedProduct.color}</span></div>}
                  {selectedProduct.productType && <div><span className="text-2xs text-slate-400 block font-bold">Type</span><span className="font-semibold text-slate-800">{selectedProduct.productType}</span></div>}
                  {selectedProduct.expiry && <div><span className="text-2xs text-slate-400 block font-bold">Expiry Date</span><span className="font-semibold text-emerald-700">{selectedProduct.expiry}</span></div>}
                  {selectedProduct.weight && <div><span className="text-2xs text-slate-400 block font-bold">Net Qty</span><span className="font-semibold text-slate-800">{selectedProduct.weight}</span></div>}
                  {selectedProduct.warranty && <div><span className="text-2xs text-slate-400 block font-bold">Warranty</span><span className="font-semibold text-slate-800">{selectedProduct.warranty}</span></div>}
                </div>
              </div>
              <div className="border-t pt-3"><p className="text-xs text-slate-600">{selectedProduct.description}</p></div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t p-3 grid grid-cols-2 gap-2 shadow-2xl z-20">
            <button onClick={() => addToCart(selectedProduct, selectedSize)} className="py-3 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">Add to cart</button>
            <button onClick={() => { setActiveModal(null); startCheckout(selectedProduct); }} className="py-3 bg-fuchsia-600 text-white font-bold text-xs rounded-xl shadow-md">Buy now</button>
          </div>
        </div>
      )}

      {/* CART */}
      {currentTab === 'cart' && (
        <main className="p-4 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800">Shopping Cart ({cart.length})</h2>
          {cart.length === 0 ? <p className="text-xs text-slate-400 text-center py-10">Cart khali hai.</p> : (
            <div className="flex flex-col gap-3">
              {cart.map((i) => (
                <div key={i.cartKey} className="bg-white p-3 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={i.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div><h4 className="text-xs font-bold text-slate-800 line-clamp-1">{i.title}</h4><p className="text-2xs text-fuchsia-600 font-bold">Size: {i.selectedSize} • Qty: {i.quantity}</p><p className="text-xs font-extrabold text-slate-900">₹{i.price * i.quantity}</p></div>
                  </div>
                  <button onClick={() => removeFromCart(i.cartKey)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
              <div className="bg-white p-4 rounded-2xl border flex flex-col gap-1.5 mt-2 text-xs">
                <div className="flex justify-between"><span>COD Due:</span><span className="font-bold">₹{cart.reduce((s, x) => s + (x.price * x.quantity), 0)}</span></div>
                <div className="flex justify-between"><span>Delivery Fee:</span><span className="font-bold text-emerald-600">₹{cart.reduce((s, x) => s + (x.deliveryFee * x.quantity), 0)}</span></div>
                <button onClick={() => startCheckout(null)} className="w-full mt-2 py-3 bg-fuchsia-600 text-white font-bold rounded-xl">Checkout All Products</button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* CHECKOUT */}
      {activeModal === 'checkout' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 print:hidden">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b"><h3 className="font-bold text-sm text-slate-800">Checkout</h3><button onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-extrabold text-slate-500 uppercase">Address</span>
                <button onClick={() => setIsEditingAddress(!isEditingAddress)} className="flex items-center gap-1 text-xs text-fuchsia-600 font-bold"><Edit3 size={14} /> {isEditingAddress ? 'Done' : 'Change'}</button>
              </div>
              {isEditingAddress ? (
                <div className="flex flex-col gap-2">
                  <input type="text" placeholder="Full Name" value={checkoutAddress.name} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, name: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                  <input type="tel" maxLength={10} placeholder="10-digit Phone" value={checkoutAddress.phone} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, phone: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                  <textarea placeholder="Full Address" value={checkoutAddress.address} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, address: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="City" value={checkoutAddress.city} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, city: e.target.value })} className="px-3 py-2 text-xs border rounded-xl bg-white" />
                    <input type="text" placeholder="PIN Code" value={checkoutAddress.pincode} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, pincode: e.target.value })} className="px-3 py-2 text-xs border rounded-xl bg-white" />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-700 font-medium">
                  <p className="font-bold text-slate-900">{checkoutAddress.name || 'Name not set'} • {checkoutAddress.phone || 'Phone not set'}</p>
                  <p className="mt-1 text-slate-600">{checkoutAddress.address || 'Address empty'}{checkoutAddress.city ? `, ${checkoutAddress.city}` : ''}{checkoutAddress.pincode ? ` - ${checkoutAddress.pincode}` : ''}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border text-center">
              <span className="text-2xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full mb-1 inline-block">Advance Fee: ₹{totalDeliveryFee}</span>
              <p className="text-xs text-slate-500 mb-2">COD Due: ₹{totalProductPrice}</p>
              <img src={customQr || `https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} alt="QR" className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border mb-2 object-contain" />
              <div className="grid grid-cols-3 gap-2 w-full mt-2">
                <a href={`phonepe://pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} className="py-2 bg-indigo-600 text-white rounded-xl text-2xs font-bold">PhonePe</a>
                <a href={`tez://upi/pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} className="py-2 bg-blue-600 text-white rounded-xl text-2xs font-bold">GPay</a>
                <a href={`paytmmp://pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} className="py-2 bg-sky-500 text-white rounded-xl text-2xs font-bold">Paytm</a>
              </div>
            </div>

            <div className="bg-fuchsia-50/60 p-3 rounded-2xl border flex flex-col gap-2">
              <span className="text-2xs font-extrabold text-fuchsia-800 uppercase">Payment Proof (Mandatory: UTR ya Screenshot)</span>
              <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-fuchsia-300 rounded-xl cursor-pointer bg-white">
                <UploadCloud size={16} className="text-fuchsia-600" />
                <span className="text-xs text-fuchsia-700 font-bold">{paymentScreenshot ? 'Screenshot Uploaded ✓' : 'Upload Payment Screenshot'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setPaymentScreenshot)} />
              </label>
              <div className="text-center text-2xs font-bold uppercase text-slate-400">YA</div>
              <input type="text" placeholder="Enter 12-digit UPI UTR" value={enteredUtr} onChange={(e) => setEnteredUtr(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
            </div>

            <button onClick={handlePlaceOrder} className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl">Verify Payment & Place Order</button>
          </div>
        </div>
      )}
            {/* ACCOUNT TAB */}
      {currentTab === 'account' && (
        <main className="p-4 flex flex-col gap-4">
          {!currentUser ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400 mb-3">Account dekhne ke liye Login karein.</p>
              <button onClick={() => { setAuthMode('login'); setActiveModal('auth'); }} className="px-6 py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">Login / Register</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-white p-5 rounded-2xl border flex flex-col items-center gap-2 text-center">
                {renderLivePhoto(currentUser.livePhoto, 'w-24 h-24')}
                <h3 className="font-extrabold text-slate-900 text-base mt-1 flex items-center gap-1.5">
                  {currentUser.name}
                  {isSuperAdmin && <span className="bg-amber-100 text-amber-800 text-3xs font-extrabold px-2 py-0.5 rounded-full">MAIN ADMIN</span>}
                  {isCollaborator && <span className="bg-sky-100 text-sky-800 text-3xs font-extrabold px-2 py-0.5 rounded-full">COLLABORATOR</span>}
                </h3>
                <p className="text-xs text-slate-500">📞 {currentUser.phone}</p>
                {currentUser.address && <p className="text-xs text-slate-500">🏠 {currentUser.address}{currentUser.city ? `, ${currentUser.city}` : ''}{currentUser.pincode ? ` - ${currentUser.pincode}` : ''}</p>}
                
                {hasAdminPanelAccess && (
                  <button onClick={() => setCurrentTab('admin')} className="w-full mt-2 py-2 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">Admin Panel Kholein</button>
                )}
                
                <button onClick={() => setCurrentUser(null)} className="w-full mt-1 py-2 rounded-xl border border-red-200 text-red-600 font-semibold text-xs">Logout</button>
              </div>

              {/* ADMIN TEAM & PROFILES SECTION */}
              <div className="bg-white p-4 rounded-2xl border flex flex-col gap-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-fuchsia-600" /> Admin & Staff Team ({allAdmins.length})
                  </h4>
                  <span className="text-3xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">Public Verification</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {allAdmins.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Koi admin abhi registered nahi hai.</p>
                  ) : (
                    allAdmins.map((adm) => (
                      <div key={adm.phone} className={`p-3 rounded-xl border flex items-center gap-3 ${adm.isBlocked ? 'bg-red-50/60 border-red-200' : 'bg-slate-50/70 border-slate-100'}`}>
                        {renderLivePhoto(adm.livePhoto, 'w-12 h-12')}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{adm.name}</span>
                            {adm.role === 'super_admin' ? (
                              <span className="bg-amber-100 text-amber-800 text-3xs font-black px-1.5 py-0.2 rounded shrink-0">FIRST & FINAL ADMIN</span>
                            ) : (
                              <span className="bg-sky-100 text-sky-800 text-3xs font-black px-1.5 py-0.2 rounded shrink-0">COLLABORATOR</span>
                            )}
                          </div>
                          <p className="text-2xs text-slate-500">ID: {adm.phone} {adm.isBlocked && <b className="text-red-600">• BLOCKED</b>}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* SIRF COLLABORATOR (SUB-ADMIN) KO DIKHEGA - CUSTOMERS KO BILKUL NAHI DIKHEGA */}
                {isCollaborator && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-amber-900 text-xs font-extrabold">
                      <KeyRound size={15} /> Super Admin Activation (Sub-Admin Only)
                    </div>
                    <p className="text-3xs text-amber-800">
                      Super Admin banne ke liye master override code dalein:
                    </p>
                    <input 
                      type="password" 
                      placeholder="Enter Secret Override Code" 
                      value={superAdminSecretInput} 
                      onChange={(e) => setSuperAdminSecretInput(e.target.value)} 
                      className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg"
                    />
                    <button 
                      onClick={handleUpgradeToSuperAdmin} 
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-2xs uppercase tracking-wider rounded-lg"
                    >
                      Activate Main Admin Control
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* CUSTOMER ORDERS */}
      {currentTab === 'orders' && (
        <main className="p-4 flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800">My Orders ({myOrders.length})</h2>
          {!currentUser && <p className="text-xs text-slate-400 text-center py-10">Orders dekhne ke liye pehle Login karein.</p>}
          {currentUser && myOrders.length === 0 && <p className="text-xs text-slate-400 text-center py-10">Abhi koi order nahi hai.</p>}
          {myOrders.map((o) => (
            <div key={o.orderId} className="bg-white p-3.5 rounded-2xl border shadow-2xs">
              <div className="flex justify-between pb-2 border-b text-xs"><span className="font-extrabold text-fuchsia-600">#{o.orderId}</span><span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md">{o.status}</span></div>
              <p className="text-2xs text-slate-500 my-1">🚚 Delivery Time: <b className="text-slate-800">{o.estimatedDelivery}</b></p>
              {o.items?.map((it, idx) => (
                <div key={idx} className="flex gap-2.5 items-center my-1"><img src={it.image} className="w-10 h-10 rounded-lg object-cover" /><div className="flex-1 text-xs"><p className="font-semibold text-slate-800 line-clamp-1">{it.title}</p><p className="text-2xs text-slate-500">Size: {it.size} • Qty: {it.quantity}</p></div></div>
              ))}
            </div>
          ))}
        </main>
      )}

      {/* ADMIN CONTROL PANEL */}
      {currentTab === 'admin' && hasAdminPanelAccess && (
        <main className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {isSuperAdmin ? "Super Admin Control" : "Collaborator Dashboard"}
              </h2>
              <p className="text-3xs text-slate-500">{isSuperAdmin ? "Poora control uplabdh hai" : "Limited Access (Orders & Products only)"}</p>
            </div>
            <button onClick={() => setCurrentTab('home')} className="text-xs text-fuchsia-600 font-bold">Store</button>
          </div>

          <div className="flex border-b">
            {['products', ...(isSuperAdmin ? ['add'] : []), 'orders', ...(isSuperAdmin ? ['customers', 'collaborators'] : [])].map((t) => (
              <button key={t} onClick={() => setAdminTab(t)} className={`flex-1 py-2 text-2xs font-bold uppercase ${adminTab === t ? 'border-b-2 border-fuchsia-600 text-fuchsia-600' : 'text-slate-400'}`}>{t}</button>
            ))}
          </div>

          {/* PRODUCTS TAB */}
          {adminTab === 'products' && (
            <div className="flex flex-col gap-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded-lg object-cover" /><div><h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4><p className="text-2xs text-slate-500">₹{p.price}</p></div></div>
                  {isSuperAdmin && (
                    <div className="flex gap-1"><button onClick={() => { setEditingProductId(p.id); setProdForm(p); setAdminTab('add'); }} className="p-1.5 text-slate-600"><Edit3 size={15} /></button><button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="p-1.5 text-red-500"><Trash2 size={15} /></button></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ADD / EDIT PRODUCT */}
          {adminTab === 'add' && isSuperAdmin && (
            <form onSubmit={handleSaveProduct} className="bg-white p-4 rounded-2xl border flex flex-col gap-3">
              <div>
                <span className="text-2xs font-bold text-slate-600 block mb-1">Product Category:</span>
                <select value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-semibold">
                  <option value="Fashion">Fashion / Clothes</option><option value="Footwear">Footwear / Shoes</option><option value="Grocery">Grocery / Food</option><option value="Electronics">Electronics</option>
                </select>
              </div>
              <input type="text" placeholder="Title" value={prodForm.title} onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <textarea placeholder="Description" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Price ₹" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="px-2 py-1.5 text-xs border rounded-xl" />
                <input type="number" placeholder="MRP ₹" value={prodForm.mrp} onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })} className="px-2 py-1.5 text-xs border rounded-xl" />
                <input type="number" placeholder="Fee ₹" value={prodForm.deliveryFee} onChange={(e) => setProdForm({ ...prodForm, deliveryFee: e.target.value })} className="px-2 py-1.5 text-xs border rounded-xl" />
              </div>
              {prodForm.category === 'Fashion' && (
                <div className="bg-fuchsia-50 p-2.5 rounded-xl border flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5"><input type="text" placeholder="Fabric" value={prodForm.fabric || ''} onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })} className="px-2 py-1 text-xs bg-white border rounded" /><input type="text" placeholder="Color" value={prodForm.color || ''} onChange={(e) => setProdForm({ ...prodForm, color: e.target.value })} className="px-2 py-1 text-xs bg-white border rounded" /></div>
                  <input type="text" placeholder="Type (e.g. Kurti, Brief)" value={prodForm.productType || ''} onChange={(e) => setProdForm({ ...prodForm, productType: e.target.value })} className="px-2 py-1 text-xs bg-white border rounded" />
                  <input type="text" placeholder="Sizes (e.g. S, M, L, XL)" value={prodForm.sizes || ''} onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })} className="px-2 py-1 text-xs bg-white border rounded" />
                </div>
              )}
              {prodForm.category === 'Grocery' && (
                <div className="bg-emerald-50 p-2.5 rounded-xl border grid grid-cols-2 gap-1.5">
                  <input type="text" placeholder="Expiry Date" value={prodForm.expiry || ''} onChange={(e) => setProdForm({ ...prodForm, expiry: e.target.value })} className="px-2 py-1 text-xs bg-white border rounded" />
                  <input type="text" placeholder="Net Weight" value={prodForm.weight || ''} onChange={(e) => setProdForm({ ...prodForm, weight: e.target.value })} className="px-2 py-1 text-xs bg-white border rounded" />
                </div>
              )}
              <label className="p-2.5 border-2 border-dashed rounded-xl cursor-pointer text-center text-xs text-fuchsia-600 font-bold bg-slate-50"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, (d) => setProdForm({ ...prodForm, image: d }))} />Select Photo</label>
              
              <label className="p-2 border-2 border-dashed rounded-xl cursor-pointer text-center text-xs text-slate-700 font-bold bg-slate-50"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, (d) => setProdForm({ ...prodForm, qrImage: d }))} />Upload Custom QR</label>
              <input type="text" placeholder="UPI ID" value={prodForm.upiId} onChange={(e) => setProdForm({ ...prodForm, upiId: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <button type="submit" className="w-full py-2 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{editingProductId ? 'Update' : 'Publish'}</button>
            </form>
          )}

          {/* CUSTOMERS TAB */}
          {adminTab === 'customers' && isSuperAdmin && (
            <div className="flex flex-col gap-2">
              <p className="text-2xs text-slate-500 font-semibold">Total Customers: {customers.length}</p>
              {customers.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Abhi koi customer register nahi hua.</p>}
              {customers.map((u) => (
                <div key={u.phone} onClick={() => { setSelectedCustomer(u); setActiveModal('customer_profile'); }} className="bg-white p-3 rounded-2xl border flex items-center gap-3 cursor-pointer">
                  {renderLivePhoto(u.livePhoto, 'w-12 h-12')}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{u.name}</h4>
                    <p className="text-2xs text-slate-500">📞 {u.phone}</p>
                  </div>
                  <span className="text-2xs bg-fuchsia-50 text-fuchsia-700 font-bold px-2 py-0.5 rounded-md">{ordersOf(u).length} orders</span>
                </div>
              ))}
            </div>
          )}

          {/* COLLABORATORS TAB */}
          {adminTab === 'collaborators' && isSuperAdmin && (
            <div className="flex flex-col gap-3">
              <p className="text-2xs text-slate-500 font-semibold">Collaborators Management</p>
              {users.filter(u => u.role === 'collaborator').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Koi collaborator nahi hai.</p>
              ) : (
                users.filter(u => u.role === 'collaborator').map((c) => (
                  <div key={c.phone} className="bg-white p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {renderLivePhoto(c.livePhoto, 'w-12 h-12')}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                        <p className="text-2xs text-slate-500">📞 {c.phone}</p>
                        <span className={`text-3xs font-extrabold px-1.5 py-0.2 rounded inline-block mt-0.5 ${c.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {c.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => toggleBlockCollaborator(c.phone)} 
                        title={c.isBlocked ? "Unblock" : "Block"} 
                        className={`p-2 rounded-xl text-xs font-bold ${c.isBlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                      >
                        {c.isBlocked ? <Check size={16} /> : <Ban size={16} />}
                      </button>
                      <button 
                        onClick={() => removeCollaborator(c.phone)} 
                        title="Delete Collaborator" 
                        className="p-2 rounded-xl bg-red-50 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {adminTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <div key={o.orderId} onClick={() => { setSelectedOrderForInvoice(o); setActiveModal('order_invoice'); }} className="bg-white p-3.5 rounded-2xl border text-xs flex flex-col gap-1.5 cursor-pointer shadow-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-fuchsia-600">#{o.orderId}</span>
                    {isSuperAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); deleteOrder(o.orderId); }} className="p-1 text-red-500"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 bg-fuchsia-50/50 border border-fuchsia-100 rounded-xl p-2">
                    {renderLivePhoto(orderOwner(o)?.livePhoto, 'w-14 h-14')}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">{o.customerName}</p>
                      <p className="text-slate-600">📞 {o.customerPhone}</p>
                      <p className="text-2xs text-slate-500">🏠 {o.fullAddress}</p>
                    </div>
                  </div>
                  <p className="text-2xs text-slate-500">{o.date} • Status: <b>{o.status}</b></p>
                  <div className="flex flex-col gap-1">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2"><img src={it.image} className="w-8 h-8 rounded-md object-cover" /><span className="text-2xs text-slate-700 line-clamp-1">{it.title} ({it.size}) × {it.quantity}</span></div>
                    ))}
                  </div>
                  <p><span className="font-bold">COD:</span> ₹{o.totalPrice} | <span className="text-emerald-600 font-bold">Fee: ₹{o.deliveryFeePaid}</span></p>
                  <p className="text-2xs bg-slate-100 p-1 rounded font-mono">UTR: {o.utr}</p>
                  
                  <div className="bg-slate-50 p-2 rounded-xl border mt-1 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-2xs font-bold text-slate-600 uppercase">Change Status:</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                                          <button key={st} onClick={() => setOrders(orders.map(x => x.orderId === o.orderId ? { ...x, status: st } : x))} className={`py-1 text-3xs font-bold rounded border ${o.status === st ? 'bg-fuchsia-600 text-white' : 'bg-white'}`}>{st}</button>
                      ))}
                    </div>
                    <input type="text" placeholder="Delivery Time" value={o.estimatedDelivery || ''} onChange={(e) => setOrders(orders.map(x => x.orderId === o.orderId ? { ...x, estimatedDelivery: e.target.value } : x))} className="w-full px-2 py-1 bg-white border rounded text-xs mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
            {/* INVOICE MODAL */}
      {activeModal === 'order_invoice' && selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-y-auto max-h-[90vh] p-5 relative print:shadow-none print:max-h-full">
            <div className="flex justify-between items-center pb-3 border-b mb-3 print:hidden">
              <h3 className="font-bold text-sm">Invoice / Form</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-1.5 bg-blue-50 text-blue-600 rounded-full"><Printer size={18} /></button>
                <button onClick={() => setActiveModal(null)} className="p-1.5 bg-slate-100 rounded-full"><X size={18} /></button>
              </div>
            </div>
            <div className="text-center mb-4 border-b pb-2"><h2 className="text-xl font-black">BARIJAN MART</h2><p className="text-2xs text-slate-500">Official Receipt</p></div>
            <div className="text-xs flex flex-col gap-2">
              <div className="flex justify-between"><span>Order: #{selectedOrderForInvoice.orderId}</span><span>{selectedOrderForInvoice.date}</span></div>
              <div className="bg-slate-50 p-2.5 rounded-xl border">
                <div className="flex items-center gap-2.5 mb-1.5">
                  {renderLivePhoto(orderOwner(selectedOrderForInvoice)?.livePhoto, 'w-16 h-16')}
                  <div>
                    <p className="font-bold">{selectedOrderForInvoice.customerName}</p>
                    <p className="text-2xs text-emerald-700 font-bold">Verified Registration Photo</p>
                  </div>
                </div>
                <p className="text-slate-600">📞 {selectedOrderForInvoice.customerPhone}</p>
                <p className="text-slate-600">🏠 {selectedOrderForInvoice.fullAddress}</p>
                {selectedOrderForInvoice.userPhone && <p className="text-2xs text-slate-500">Account: {selectedOrderForInvoice.userPhone}</p>}
              </div>
              <div className="border-t pt-2">
                {selectedOrderForInvoice.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b text-2xs"><span>{it.title} ({it.size}) × {it.quantity}</span><span className="font-bold">₹{it.price * it.quantity}</span></div>
                ))}
              </div>
              <div className="flex justify-between pt-1"><span>Advance Fee:</span><span className="font-bold text-emerald-600">₹{selectedOrderForInvoice.deliveryFeePaid}</span></div>
              <div className="flex justify-between"><span>COD Due:</span><span className="font-black text-sm">₹{selectedOrderForInvoice.totalPrice}</span></div>
              <p className="text-2xs font-mono bg-slate-100 p-1 rounded">UTR: {selectedOrderForInvoice.utr}</p>
              {selectedOrderForInvoice.screenshot && (
                <div className="mt-2 print:hidden">
                  <span className="text-2xs font-bold block mb-1">Screenshot:</span>
                  <img src={selectedOrderForInvoice.screenshot} onClick={() => setPreviewScreenshotUrl(selectedOrderForInvoice.screenshot)} className="w-20 h-28 object-cover rounded border cursor-pointer" />
                </div>
              )}
            </div>
            {isSuperAdmin && (
              <button onClick={() => deleteOrder(selectedOrderForInvoice.orderId)} className="w-full mt-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl print:hidden flex items-center justify-center gap-1"><Trash2 size={14} /> Delete Order</button>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {activeModal === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 flex flex-col gap-3 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b"><h3 className="font-bold text-sm uppercase">{authMode === 'forgot' ? 'Forgot Password' : authMode}</h3><button onClick={closeAuth}><X size={18} /></button></div>
            <form onSubmit={handleAuth} className="flex flex-col gap-2.5">
              {(authMode === 'register' || authMode === 'forgot') && <input type="text" placeholder={authMode === 'forgot' ? 'Registered Full Name' : 'Full Name'} value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />}
              <input type="tel" maxLength={10} placeholder="10-digit Mobile Number" value={authPhone} onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 text-xs border rounded-xl" />
              {(authMode === 'register' || authMode === 'forgot' || (authMode === 'login' && loginNeedsDob)) && (
                <label className="flex flex-col gap-1">
                  <span className="text-2xs font-bold text-slate-500 px-1">Date of Birth</span>
                  <input type="date" max={new Date().toISOString().slice(0, 10)} value={authDob} onChange={(e) => setAuthDob(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                </label>
              )}
              <div className="relative flex items-center">
                <input type={showPassword ? "text" : "password"} placeholder={authMode === 'forgot' ? 'New Password' : 'Enter Password / Admin Code'} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full pl-3 pr-9 py-2 text-xs border rounded-xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {authMode === 'forgot' && <input type={showPassword ? "text" : "password"} placeholder="Confirm New Password" value={authConfirm} onChange={(e) => setAuthConfirm(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />}
              
              {(authMode === 'register' || (authMode === 'login' && loginNeedsPhoto)) && renderLiveCapture()}
              
              <button type="submit" className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{authMode === 'login' ? 'Login' : authMode === 'register' ? 'Register' : 'Reset Password'}</button>
            </form>
            <button onClick={() => switchAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-2xs text-fuchsia-600 font-bold mx-auto">{authMode === 'login' ? 'New Account? Register' : 'Back to Login'}</button>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE MODAL */}
      {activeModal === 'customer_profile' && selectedCustomer && isSuperAdmin && (() => {
        const cu = users.find((x) => x.phone === selectedCustomer.phone) || selectedCustomer;
        const cOrders = ordersOf(cu);
        const regDate = cu.createdAt ? new Date(cu.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-y-auto max-h-[90vh] p-5">
              <div className="flex justify-between items-center pb-3 border-b mb-3">
                <h3 className="font-bold text-sm">Customer Profile</h3>
                <button onClick={() => setActiveModal(null)} className="p-1.5 bg-slate-100 rounded-full"><X size={18} /></button>
              </div>
              <div className="flex flex-col items-center gap-1 mb-3">
                {renderLivePhoto(cu.livePhoto, 'w-24 h-24')}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
                <div><span className="text-2xs text-slate-400 block font-bold">Name</span><span className="font-semibold text-slate-800">{cu.name}</span></div>
                <div><span className="text-2xs text-slate-400 block font-bold">Mobile</span><span className="font-semibold text-slate-800">{cu.phone}</span></div>
                <div><span className="text-2xs text-slate-400 block font-bold">Registered</span><span className="font-semibold text-slate-800">{regDate}</span></div>
                <div><span className="text-2xs text-slate-400 block font-bold">Total Orders</span><span className="font-semibold text-slate-800">{cOrders.length}</span></div>
                <div className="col-span-2"><span className="text-2xs text-slate-400 block font-bold">Saved Address</span><span className="font-semibold text-slate-800">{cu.address ? `${cu.address}${cu.city ? ', ' + cu.city : ''}${cu.pincode ? ` - ${cu.pincode}` : ''}` : 'No address'}</span></div>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 mt-4 mb-2 uppercase">Order History</h4>
              <div className="flex flex-col gap-2">
                {cOrders.length === 0 && <p className="text-xs text-slate-400">Koi order nahi.</p>}
                {cOrders.map((o) => (
                  <div key={o.orderId} onClick={() => { setSelectedOrderForInvoice(o); setActiveModal('order_invoice'); }} className="bg-white border rounded-xl p-2.5 text-xs cursor-pointer">
                    <div className="flex justify-between font-bold"><span className="text-fuchsia-600">#{o.orderId}</span><span className="text-2xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">{o.status}</span></div>
                    <p className="text-2xs text-slate-500 mt-0.5">{o.date} • COD ₹{o.totalPrice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* SCREENSHOT FULL PREVIEW */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 print:hidden" onClick={() => setPreviewScreenshotUrl(null)}>
          <button className="absolute top-4 right-4 text-white"><X size={24} /></button>
          <img src={previewScreenshotUrl} className="max-w-full max-h-[85vh] object-contain" />
        </div>
      )}

      {/* SUCCESS MODAL */}
      {activeModal === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center">
            <CheckCircle2 size={50} className="text-emerald-500 mb-2 mx-auto" />
            <h3 className="font-extrabold text-slate-900 text-lg">Order Placed!</h3>
            <button onClick={() => { setActiveModal(null); setCurrentTab('orders'); }} className="w-full mt-4 py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">View My Orders</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around py-2 z-20 print:hidden">
        <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center ${currentTab === 'home' ? 'text-fuchsia-600' : 'text-slate-400'}`}><ShoppingBag size={20} /><span className="text-2xs font-semibold mt-0.5">Home</span></button>
        <button onClick={() => setCurrentTab('cart')} className={`flex flex-col items-center relative ${currentTab === 'cart' ? 'text-fuchsia-600' : 'text-slate-400'}`}><ShoppingBag size={20} />{cart.length > 0 && <span className="absolute -top-1 right-2 bg-fuchsia-600 text-white text-3xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}<span className="text-2xs font-semibold mt-0.5">Cart</span></button>
        <button onClick={() => setCurrentTab('orders')} className={`flex flex-col items-center ${currentTab === 'orders' ? 'text-fuchsia-600' : 'text-slate-400'}`}><Package size={20} /><span className="text-2xs font-semibold mt-0.5">Orders</span></button>
        {hasAdminPanelAccess ? (
          <button onClick={() => setCurrentTab('admin')} className={`flex flex-col items-center ${currentTab === 'admin' ? 'text-fuchsia-600' : 'text-slate-400'}`}><ShieldCheck size={20} /><span className="text-2xs font-semibold mt-0.5">{isSuperAdmin ? 'Admin' : 'Staff'}</span></button>
        ) : (
          <button onClick={() => setCurrentTab('account')} className={`flex flex-col items-center ${currentTab === 'account' ? 'text-fuchsia-600' : 'text-slate-400'}`}><User size={20} /><span className="text-2xs font-semibold mt-0.5">Account</span></button>
        )}
      </nav>
    </div>
  );
      }

      
                        
      
        
  
      
  

