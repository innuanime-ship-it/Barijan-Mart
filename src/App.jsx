import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, ShoppingBag, User, Package, ShieldCheck, 
  Trash2, Edit3, ArrowLeft, CheckCircle2, UploadCloud, Truck, Printer, Eye, EyeOff 
} from 'lucide-react';

const ADMIN_SECRET = "IN1511RNB2008";

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

  const handleFile = (e, cb) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => cb(r.result); r.readAsDataURL(file); }
  };

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
    if (!checkoutAddress.name || !checkoutAddress.phone || !checkoutAddress.address) return alert("Delivery address pura bharein!");
    if (!/^[0-9]{10}$/.test(checkoutAddress.phone)) return alert("Mobile number 10 digit ka hona chahiye!");
    if (!enteredUtr.trim() && !paymentScreenshot) return alert("12-digit UTR number dalein YA payment screenshot upload karein!");

    const newOrder = {
      orderId: 'BM' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      customerName: checkoutAddress.name, customerPhone: checkoutAddress.phone,
      fullAddress: `${checkoutAddress.address}${checkoutAddress.city ? ', ' + checkoutAddress.city : ''}${checkoutAddress.pincode ? ' - ' + checkoutAddress.pincode : ''}`,
      items: getCheckoutItems().map(i => ({ title: i.title, price: i.price, quantity: i.quantity || 1, image: i.image, size: i.selectedSize || 'Standard' })),
      totalPrice: totalProductPrice, deliveryFeePaid: totalDeliveryFee,
      utr: enteredUtr.trim() || 'N/A (Screenshot Attached)', screenshot: paymentScreenshot || null,
      status: 'Order Placed', estimatedDelivery: '2-4 Days'
    };
    setOrders([newOrder, ...orders]); setLastOrderDetails(newOrder);
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

  const handleAuth = (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(authPhone)) return alert("Mobile number 10 digit ka hona chahiye!");
    if (!authPassword) return alert("Password dalein!");

    if (authMode === 'register') {
      if (users.find(u => u.phone === authPhone)) return alert("Mobile number pehle se registered hai! Login karein.");
      const role = authPassword === ADMIN_SECRET ? 'admin' : 'customer';
      const u = { name: authName || 'User ' + authPhone.slice(-4), phone: authPhone, password: authPassword, role };
      setUsers([...users, u]); setCurrentUser(u); setActiveModal(null);
      if (role === 'admin') setCurrentTab('admin');
    } else {
      const u = users.find(x => x.phone === authPhone);
      if (!u) return alert("Account nahi mila! Register karein.");
      if (u.password !== authPassword) return alert("Galat Password!");
      const updated = { ...u, role: authPassword === ADMIN_SECRET ? 'admin' : u.role };
      setCurrentUser(updated); setActiveModal(null);
      if (updated.role === 'admin') setCurrentTab('admin');
    }
  };

  const filtered = products.filter(p => (selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()) && p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col relative shadow-xl pb-20 print:shadow-none print:pb-0 print:bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-lg text-slate-700 hover:bg-slate-100"><Menu size={24} /></button>
          <h1 className="text-xl font-extrabold tracking-tight text-fuchsia-600">Barijan Mart</h1>
        </div>
        <button onClick={() => currentUser ? setCurrentTab('account') : setActiveModal('auth')} className="w-8 h-8 rounded-full overflow-hidden bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center text-fuchsia-600 font-bold">
          {currentUser?.avatar ? <img src={currentUser.avatar} alt="u" className="w-full h-full object-cover" /> : <User size={18} />}
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
                  <h3 className="font-bold text-slate-800 text-sm">{currentUser?.name || "Guest"}</h3>
                  <p className="text-xs text-slate-400">{currentUser?.phone || "Login required"}</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button onClick={() => { setCurrentTab('home'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'home' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><ShoppingBag size={18} /> Home</button>
                <button onClick={() => { setCurrentTab('cart'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'cart' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><ShoppingBag size={18} /> Cart ({cart.length})</button>
                <button onClick={() => { setCurrentTab('orders'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'orders' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><Package size={18} /> My Orders</button>
                {currentUser?.role === 'admin' ? (
                  <button onClick={() => { setCurrentTab('admin'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${currentTab === 'admin' ? 'bg-fuchsia-50 text-fuchsia-600' : 'text-slate-600'}`}><ShieldCheck size={18} /> Admin Dashboard</button>
                ) : (
                  <button onClick={() => { setAuthMode('login'); setActiveModal('auth'); setSidebarOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600"><ShieldCheck size={18} /> Admin Login</button>
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
                  {selectedProduct.warranty && <div><span className="text-2xs text-slate-400 block font-bold">Warranty</span><span className="font-semibold tex
                    text-slate-800">{selectedProduct.warranty}</span></div>}
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

      {/* CUSTOMER ORDERS */}
      {currentTab === 'orders' && (
        <main className="p-4 flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800">My Orders ({orders.length})</h2>
          {orders.map((o) => (
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

      {/* ADMIN */}
      {currentTab === 'admin' && currentUser?.role === 'admin' && (
        <main className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center"><h2 className="text-base font-black text-slate-900">Admin Control</h2><button onClick={() => setCurrentTab('home')} className="text-xs text-fuchsia-600 font-bold">Store</button></div>
          <div className="flex border-b">
            {['products', 'add', 'orders'].map((t) => (
              <button key={t} onClick={() => setAdminTab(t)} className={`flex-1 py-2 text-xs font-bold uppercase ${adminTab === t ? 'border-b-2 border-fuchsia-600 text-fuchsia-600' : 'text-slate-400'}`}>{t}</button>
            ))}
          </div>

          {adminTab === 'products' && (
            <div className="flex flex-col gap-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded-lg object-cover" /><div><h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4><p className="text-2xs text-slate-500">₹{p.price}</p></div></div>
                  <div className="flex gap-1"><button onClick={() => { setEditingProductId(p.id); setProdForm(p); setAdminTab('add'); }} className="p-1.5 text-slate-600"><Edit3 size={15} /></button><button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="p-1.5 text-red-500"><Trash2 size={15} /></button></div>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'add' && (
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

          {adminTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <div key={o.orderId} onClick={() => { setSelectedOrderForInvoice(o); setActiveModal('order_invoice'); }} className="bg-white p-3.5 rounded-2xl border text-xs flex flex-col gap-1.5 cursor-pointer shadow-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-fuchsia-600">#{o.orderId}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteOrder(o.orderId); }} className="p-1 text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <p><span className="font-bold">Customer:</span> {o.customerName} ({o.customerPhone})</p>
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
                <p className="font-bold">{selectedOrderForInvoice.customerName}</p>
                <p className="text-slate-600">📞 {selectedOrderForInvoice.customerPhone}</p>
                <p className="text-slate-600">🏠 {selectedOrderForInvoice.fullAddress}</p>
              </div>
              <div className="border-t pt-2">
                {selectedOrderForInvoice.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b text-2xs"><span>{it.title} ({it.size}) × {it.quantity}</span><span className="font-bold">₹{it.price * it.quantity}</span></div>
                ))}
              </div>
              <div className="flex justify-between pt-1"><span>Advance Fee:</span><span className="font-bold text-emerald-600">₹{selectedOrderForInvoice.deliveryFeePaid}</span></div>
              <div className="flex justify-between"><span>COD Due:</span><span className="font-black tex
                text-sm">₹{selectedOrderForInvoice.totalPrice}</span></div>
              <p className="text-2xs font-mono bg-slate-100 p-1 rounded">UTR: {selectedOrderForInvoice.utr}</p>
              {selectedOrderForInvoice.screenshot && (
                <div className="mt-2 print:hidden">
                  <span className="text-2xs font-bold block mb-1">Screenshot:</span>
                  <img src={selectedOrderForInvoice.screenshot} onClick={() => setPreviewScreenshotUrl(selectedOrderForInvoice.screenshot)} className="w-20 h-28 object-cover rounded border cursor-pointer" />
                </div>
              )}
            </div>
            <button onClick={() => deleteOrder(selectedOrderForInvoice.orderId)} className="w-full mt-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl print:hidden flex items-center justify-center gap-1"><Trash2 size={14} /> Delete Order</button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {activeModal === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b"><h3 className="font-bold text-sm uppercase">{authMode}</h3><button onClick={() => setActiveModal(null)}><X size={18} /></button></div>
            <form onSubmit={handleAuth} className="flex flex-col gap-2.5">
              {authMode === 'register' && <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />}
              <input type="tel" maxLength={10} placeholder="10-digit Mobile Number" value={authPhone} onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <div className="relative flex items-center">
                <input type={showPassword ? "text" : "password"} placeholder="Enter Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full pl-3 pr-9 py-2 text-xs border rounded-xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button type="submit" className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{authMode === 'login' ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-2xs text-fuchsia-600 font-bold mx-auto">{authMode === 'login' ? 'New Account? Register' : 'Back to Login'}</button>
          </div>
        </div>
      )}

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
        {currentUser?.role === 'admin' ? (
          <button onClick={() => setCurrentTab('admin')} className={`flex flex-col items-center ${currentTab === 'admin' ? 'text-fuchsia-600' : 'text-slate-400'}`}><ShieldCheck size={20} /><span className="text-2xs font-semibold mt-0.5">Admin</span></button>
        ) : (
          <button onClick={() => setCurrentTab('account')} className={`flex flex-col items-center ${currentTab === 'account' ? 'text-fuchsia-600' : 'text-slate-400'}`}><User size={20} /><span className="text-2xs font-semibold mt-0.5">Account</span></button>
        )}
      </nav>
    </div>
  );
        }
