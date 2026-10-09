import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, ShoppingBag, User, Package, ShieldCheck, 
  Trash2, Edit3, Plus, ArrowLeft, CheckCircle2 
} from 'lucide-react';

const ADMIN_SECRET = "IN1511RNB2008";

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    title: "Women Floral Printed Kurti",
    description: "Pure cotton soft floral printed kurti for festive and daily wear.",
    category: "Fashion",
    price: 299,
    mrp: 899,
    deliveryFee: 49,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=60",
    upiId: "barijanmart@upi"
  },
  {
    id: "p2",
    title: "Men Casual Cotton Shirt",
    description: "Slim fit breathable denim-style casual cotton shirt.",
    category: "Fashion",
    price: 349,
    mrp: 999,
    deliveryFee: 49,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60",
    upiId: "barijanmart@upi"
  },
  {
    id: "p3",
    title: "Running Sports Shoes",
    description: "Lightweight cushioned mesh running shoes with firm sole grip.",
    category: "Footwear",
    price: 499,
    mrp: 1499,
    deliveryFee: 69,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60",
    upiId: "barijanmart@upi"
  },
  {
    id: "p4",
    title: "Wireless Bluetooth Earbuds",
    description: "True wireless earbuds with 30hrs total playtime and fast charging.",
    category: "Electronics",
    price: 599,
    mrp: 1999,
    deliveryFee: 59,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=60",
    upiId: "barijanmart@upi"
  }
];

export default function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('bm_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('bm_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('bm_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [checkoutAddress, setCheckoutAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [enteredUtr, setEnteredUtr] = useState('');
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const [adminTab, setAdminTab] = useState('products');
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({
    title: '',
    description: '',
    category: 'Fashion',
    price: '',
    mrp: '',
    deliveryFee: '49',
    image: '',
    upiId: 'barijanmart@upi'
  });

  useEffect(() => {
    localStorage.setItem('bm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bm_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bm_orders', JSON.stringify(orders));
  }, [orders]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authPhone || !authPassword) return alert("Kripya mobile number aur password bharein!");

    if (authMode === 'register') {
      const exists = users.find(u => u.phone === authPhone);
      if (exists) {
        alert("Yeh mobile number pehle se registered hai! Login karein.");
        setAuthMode('login');
        return;
      }
      const role = authPassword === ADMIN_SECRET ? 'admin' : 'customer';
      const newUser = {
        name: authName || 'User ' + authPhone.slice(-4),
        phone: authPhone,
        password: authPassword,
        role: role,
        address: '',
        city: '',
        pincode: '',
        avatar: ''
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setActiveModal(null);
      if (role === 'admin') setCurrentTab('admin');
    } else if (authMode === 'login') {
      const user = users.find(u => u.phone === authPhone);
      if (!user) return alert("Account nahi mila! Register karein.");
      if (user.password !== authPassword) return alert("Galat Password!");
      
      const updatedUser = { 
        ...user, 
        role: authPassword === ADMIN_SECRET ? 'admin' : user.role 
      };
      setCurrentUser(updatedUser);
      setActiveModal(null);
      if (updatedUser.role === 'admin') setCurrentTab('admin');
    } else if (authMode === 'forgot') {
      const userIndex = users.findIndex(u => u.phone === authPhone);
      if (userIndex === -1) return alert("Mobile number registered nahi hai!");
      const updated = [...users];
      updated[userIndex].password = authPassword;
      setUsers(updated);
      alert("Password successfully badal gaya! Ab login karein.");
      setAuthMode('login');
    }
  };

  const handleImageFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.title || !prodForm.price || !prodForm.image) {
      return alert("Title, Price aur Photo zaroori hain!");
    }

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? { ...prodForm, id: editingProductId } : p));
      setEditingProductId(null);
    } else {
      const newP = {
        ...prodForm,
        id: 'p_' + Date.now(),
        price: Number(prodForm.price),
        mrp: Number(prodForm.mrp || prodForm.price * 2),
        deliveryFee: Number(prodForm.deliveryFee || 49)
      };
      setProducts([newP, ...products]);
    }

    setProdForm({
      title: '', description: '', category: 'Fashion', price: '', mrp: '', deliveryFee: '49', image: '', upiId: 'barijanmart@upi'
    });
    setAdminTab('products');
  };

  const triggerBuyNow = (product) => {
    setSelectedProduct(product);
    if (currentUser) {
      setCheckoutAddress({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        pincode: currentUser.pincode || ''
      });
    }
    setActiveModal('checkout');
  };

  const handlePlaceOrder = (viaIntent = false) => {
    if (!checkoutAddress.name || !checkoutAddress.phone || !checkoutAddress.address) {
      return alert("Delivery address pura bharein!");
    }
    if (!viaIntent && !enteredUtr) {
      return alert("12-digit UPI UTR bharein ya direct UPI App se pay karein!");
    }

    const newOrder = {
      orderId: 'BM' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customerName: checkoutAddress.name,
      customerPhone: checkoutAddress.phone,
      fullAddress: `${checkoutAddress.address}, ${checkoutAddress.city} - ${checkoutAddress.pincode}`,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.image,
      productPrice: selectedProduct.price,
      deliveryFeePaid: selectedProduct.deliveryFee,
      utr: viaIntent ? 'Direct UPI Intent' : enteredUtr,
      status: 'Order Placed'
    };

    setOrders([newOrder, ...orders]);
    setLastOrderDetails(newOrder);
    setEnteredUtr('');
    setActiveModal('success');
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col relative shadow-xl pb-20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-lg text-slate-700 hover:bg-slate-100">
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-fuchsia-600">Barijan Mart</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' && (
            <span className="bg-fuchsia-100 text-fuchsia-700 font-bold text-xs px-2.5 py-1 rounded-full border border-fuchsia-200">
              ADMIN
            </span>
          )}
          <button 
            onClick={() => currentUser ? setCurrentTab('account') : setActiveModal('auth')}
            className="w-8 h-8 rounded-full overflow-hidden bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center text-fuchsia-600 font-bold"
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="user" className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 font-bold overflow-hidden">
                    {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{currentUser?.name || "Guest User"}</h3>
                    <p className="text-xs text-slate-400">{currentUser?.phone || "Login required"}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><X size={20} /></button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button 
                  onClick={() => { setCurrentTab('home'); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'home' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}
                >
                  <ShoppingBag size={18} /> Home / Shop
                </button>
                <button 
                  onClick={() => { setCurrentTab('orders'); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'orders' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}
                >
                  <Package size={18} /> My Orders
                </button>
                <button 
                  onClick={() => { setCurrentTab('account'); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'account' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}
                >
                  <User size={18} /> My Account
                </button>
                {currentUser?.role === 'admin' ? (
                  <button 
                    onClick={() => { setCurrentTab('admin'); setSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'admin' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}
                  >
                    <ShieldCheck size={18} /> Admin Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => { setAuthMode('login'); setActiveModal('auth'); setSidebarOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:text-fuchsia-600"
                  >
                    <ShieldCheck size={18} /> Login as Admin
                  </button>
                )}
              </div>
            </div>

            {currentUser && (
              <button 
                onClick={() => { setCurrentUser(null); setSidebarOpen(false); }}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* HOME */}
      {currentTab === 'home' && (
        <main className="p-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search kurtis, shirts, shoes, earbuds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 shadow-2xs"
            />
          </div>

          <div className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-2xl p-4 text-white shadow-md">
            <span className="bg-white/20 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Barijan Mart Dhamaka</span>
            <h2 className="text-xl font-black mt-1">Mega Wholesale Sale</h2>
            <p className="text-xs text-white/90 mt-0.5">Pay Delivery Fee Advance • Remaining on COD</p>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Fashion', 'Footwear', 'Electronics', 'Grocery'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-fuchsia-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Products for you</h3>
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 line-clamp-1">{p.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-extrabold text-sm text-slate-900">₹{p.price}</span>
                        <span className="text-2xs text-slate-400 line-through">₹{p.mrp}</span>
                        <span className="text-2xs font-bold text-emerald-600">
                          {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                        </span>
                      </div>
                      <div className="mt-1.5 inline-block bg-fuchsia-50 text-fuchsia-700 text-2xs font-bold px-2 py-0.5 rounded-md">
                        🚚 Delivery: ₹{p.deliveryFee}
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerBuyNow(p)}
                      className="w-full mt-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* MY ORDERS */}
      {currentTab === 'orders' && (
        <main className="p-4 flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800">My Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <Package size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">Abhi tak koi order nahi kiya hai.</p>
              <button onClick={() => setCurrentTab('home')} className="mt-3 text-xs text-fuchsia-600 font-bold">Shopping Karein</button>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.orderId} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-fuchsia-600">Order #{o.orderId}</span>
                  <span className="text-2xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md">{o.status}</span>
                </div>
                <div className="flex gap-3 mt-2.5">
                  <img src={o.productImage} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{o.productTitle}</h4>
                    <p className="text-2xs text-slate-500 mt-0.5">Paid Advance Delivery: <span className="font-bold text-emerald-600">₹{o.deliveryFeePaid}</span></p>
                    <p className="text-2xs text-slate-700 font-bold mt-0.5">COD to Pay at Doorstep: ₹{o.productPrice}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      )}

      {/* MY ACCOUNT */}
      {currentTab === 'account' && (
        <main className="p-4 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800">My Profile & Address</h2>
          {currentUser ? (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="relative w-16 h-16 rounded-full overflow-hidden bg-fuchsia-50 border-2 border-fuchsia-500 flex items-center justify-center cursor-pointer">
                                    {currentUser.avatar ? (
                    <img src={currentUser.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-fuchsia-600" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageFileChange(e, (data) => setCurrentUser({ ...currentUser, avatar: data }))} 
                  />
                </label>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500">{currentUser.phone}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Saved Delivery Address</h4>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Full Address (House, Village, Post)"
                    value={currentUser.address || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="City / District"
                      value={currentUser.city || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, city: e.target.value })}
                      className="px-3 py-2 text-xs border rounded-xl"
                    />
                    <input 
                      type="text" 
                      placeholder="PIN Code"
                      value={currentUser.pincode || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, pincode: e.target.value })}
                      className="px-3 py-2 text-xs border rounded-xl"
                    />
                  </div>
                  <button 
                    onClick={() => alert("Address successfully saved!")}
                    className="mt-2 w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border p-4">
              <p className="text-sm text-slate-600 mb-3">Login karein.</p>
              <button onClick={() => setActiveModal('auth')} className="px-5 py-2 bg-fuchsia-600 text-white text-xs font-bold rounded-xl">Login Karein</button>
            </div>
          )}
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {currentTab === 'admin' && currentUser?.role === 'admin' && (
        <main className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Admin Panel</h2>
            <button onClick={() => setCurrentTab('home')} className="text-xs text-fuchsia-600 font-bold">Store</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-2xl border text-center">
              <span className="text-2xs text-slate-400 block font-bold">Orders</span>
              <span className="text-base font-extrabold text-slate-900">{orders.length}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border text-center">
              <span className="text-2xs text-slate-400 block font-bold">Fees</span>
              <span className="text-base font-extrabold text-emerald-600">
                ₹{orders.reduce((sum, o) => sum + Number(o.deliveryFeePaid || 0), 0)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border text-center">
              <span className="text-2xs text-slate-400 block font-bold">COD</span>
              <span className="text-base font-extrabold text-fuchsia-600">
                ₹{orders.reduce((sum, o) => sum + Number(o.productPrice || 0), 0)}
              </span>
            </div>
          </div>

          <div className="flex border-b border-slate-200">
            {['products', 'add', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={`flex-1 py-2 text-xs font-bold uppercase ${adminTab === tab ? 'border-b-2 border-fuchsia-600 text-fuchsia-600' : 'text-slate-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {adminTab === 'products' && (
            <div className="flex flex-col gap-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4>
                      <p className="text-2xs text-slate-500">₹{p.price} • Fee: ₹{p.deliveryFee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingProductId(p.id); setProdForm(p); setAdminTab('add'); }} className="p-2 text-slate-600"><Edit3 size={16} /></button>
                    <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'add' && (
            <form onSubmit={handleSaveProduct} className="bg-white p-4 rounded-2xl border flex flex-col gap-3">
              <input type="text" placeholder="Product Title" value={prodForm.title} onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <textarea placeholder="Description" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Price ₹" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="px-2 py-2 text-xs border rounded-xl" />
                <input type="number" placeholder="MRP ₹" value={prodForm.mrp} onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })} className="px-2 py-2 text-xs border rounded-xl" />
                <input type="number" placeholder="Fee ₹" value={prodForm.deliveryFee} onChange={(e) => setProdForm({ ...prodForm, deliveryFee: e.target.value })} className="px-2 py-2 text-xs border rounded-xl" />
              </div>
              <label className="flex items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50">
                <span className="text-xs text-fuchsia-600 font-bold">Select Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (data) => setProdForm({ ...prodForm, image: data }))} />
              </label>
              <input type="text" placeholder="UPI ID" value={prodForm.upiId} onChange={(e) => setProdForm({ ...prodForm, upiId: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{editingProductId ? 'Update' : 'Publish'}</button>
            </form>
          )}

          {adminTab === 'orders' && (
            <div className="flex flex-col gap-2">
              {orders.map((o) => (
                <div key={o.orderId} className="bg-white p-3.5 rounded-2xl border text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-fuchsia-600">#{o.orderId}</span>
                    <span className="text-emerald-600 font-extrabold">Paid: ₹{o.deliveryFeePaid}</span>
                  </div>
                  <p><span className="font-bold">Customer:</span> {o.customerName} ({o.customerPhone})</p>
                  <p><span className="font-bold">Address:</span> {o.fullAddress}</p>
                  <p><span className="font-bold">Product:</span> {o.productTitle} (COD: ₹{o.productPrice})</p>
                  <p className="text-2xs bg-slate-100 p-1 rounded font-mono">UTR: {o.utr}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* CHECKOUT MODAL */}
      {activeModal === 'checkout' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] overflow-y-auto p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-800">Checkout</h3>
              <button onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="Full Name" value={checkoutAddress.name} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, name: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <input type="tel" placeholder="Phone Number" value={checkoutAddress.phone} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, phone: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <textarea placeholder="Address" value={checkoutAddress.address} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, address: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border text-center">
              <p className="text-xs text-slate-600 mb-2">Advance Fee: <span className="font-bold text-slate-900">₹{selectedProduct.deliveryFee}</span></p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=${selectedProduct.upiId || 'barijanmart@upi'}&pn=BarijanMart&am=${selectedProduct.deliveryFee}&cu=INR`} alt="QR" className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border mb-3" />
              <div className="grid grid-cols-3 gap-2 w-full">
                <a href={`phonepe://pay?pa=${selectedProduct.upiId || 'barijanmart@upi'}&pn=BarijanMart&am=${selectedProduct.deliveryFee}&cu=INR`} className="py-2 bg-indigo-600 text-white rounded-xl text-2xs font-bold">PhonePe</a>
                <a href={`tez://upi/pay?pa=${selectedProduct.upiId || 'barijanmart@upi'}&pn=BarijanMart&am=${selectedProduct.deliveryFee}&cu=INR`} className="py-2 bg-blue-600 text-white rounded-xl text-2xs font-bold">GPay</a>
                <a href={`paytmmp://pay?pa=${selectedProduct.upiId || 'barijanmart@upi'}&pn=BarijanMart&am=${selectedProduct.deliveryFee}&cu=INR`} className="py-2 bg-sky-500 text-white rounded-xl text-2xs font-bold">Paytm</a>
              </div>
            </div>

            <button onClick={() => handlePlaceOrder(true)} className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl">Paid via UPI ➔ Place Order</button>
            <div className="flex gap-2">
              <input type="text" placeholder="Or Enter UTR" value={enteredUtr} onChange={(e) => setEnteredUtr(e.target.value)} className="flex-1 px-3 py-2 text-xs border rounded-xl" />
              <button onClick={() => handlePlaceOrder(false)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {activeModal === 'success' && lastOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center flex flex-col items-center">
            <CheckCircle2 size={54} className="text-emerald-500 mb-2" />
            <h3 className="font-extrabold text-slate-900 text-lg">Order Placed!</h3>
            <p className="text-xs text-slate-500 mt-1">Order #{lastOrderDetails.orderId}</p>
            <div className="bg-slate-50 w-full p-3 rounded-2xl border text-xs my-3 text-left">
              <p><span className="font-bold">Advance Paid:</span> ₹{lastOrderDetails.deliveryFeePaid}</p>
              <p><span className="font-bold">COD:</span> ₹{lastOrderDetails.productPrice}</p>
            </div>
            <button onClick={() => { setActiveModal(null); setCurrentTab('orders'); }} className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">View My Orders</button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {activeModal === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-800 uppercase">{authMode}</h3>
              <button onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-2.5">
              {authMode === 'register' && <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />}
              <input type="tel" placeholder="Mobile Number" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <input type="password" placeholder="Password (Admin: IN1511RNB2008)" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{authMode === 'login' ? 'Login' : authMode === 'register' ? 'Register' : 'Update'}</button>
            </form>
            <div className="flex justify-between text-2xs text-slate-500 pt-1">
              {authMode === 'login' ? (
                <>
                  <button onClick={() => setAuthMode('forgot')}>Forgot Password?</button>
                  <button onClick={() => setAuthMode('register')} className="text-fuchsia-600 font-bold">New Account</button>
                </>
              ) : (
                <button onClick={() => setAuthMode('login')} className="text-fuchsia-600 font-bold mx-auto">Back to Login</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-2 z-20">
        <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center ${currentTab === 'home' ? 'text-fuchsia-600' : 'text-slate-400'}`}>
          <ShoppingBag size={20} />
          <span className="text-2xs font-semibold mt-0.5">Home</span>
        </button>
        <button onClick={() => setCurrentTab('orders')} className={`flex flex-col items-center ${currentTab === 'orders' ? 'text-fuchsia-600' : 'text-slate-400'}`}>
          <Package size={20} />
          <span className="text-2xs font-semibold mt-0.5">Orders</span>
        </button>
        {currentUser?.role === 'admin' ? (
          <button onClick={() => setCurrentTab('admin')} className={`flex flex-col items-center ${currentTab === 'admin' ? 'text-fuchsia-600' : 'text-slate-400'}`}>
            <ShieldCheck size={20} />
            <span className="text-2xs font-semibold mt-0.5">Admin</span>
          </button>
        ) : (
          <button onClick={() => setCurrentTab('account')} className={`flex flex-col items-center ${currentTab === 'account' ? 'text-fuchsia-600' : 'text-slate-400'}`}>
            <User size={20} />
            <span className="text-2xs font-semibold mt-0.5">Account</span>
          </button>
        )}
      </nav>

    </div>
  );
                    }
                
                  
                  
