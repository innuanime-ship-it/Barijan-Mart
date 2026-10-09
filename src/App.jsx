import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, ShoppingBag, User, Package, ShieldCheck, 
  Trash2, Edit3, ArrowLeft, CheckCircle2, UploadCloud, Truck, Printer, Eye, EyeOff, FileText
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
  }
];

export default function App() {
  const [products, setProducts] = useState(() => { const saved = localStorage.getItem('bm_products'); return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS; });
  const [users, setUsers] = useState(() => { const saved = localStorage.getItem('bm_users'); return saved ? JSON.parse(saved) : []; });
  const [currentUser, setCurrentUser] = useState(() => { const saved = localStorage.getItem('bm_current_user'); return saved ? JSON.parse(saved) : null; });
  const [orders, setOrders] = useState(() => { const saved = localStorage.getItem('bm_orders'); return saved ? JSON.parse(saved) : []; });
  const [cart, setCart] = useState(() => { const saved = localStorage.getItem('bm_cart'); return saved ? JSON.parse(saved) : []; });

  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

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

  const handleImageFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => callback(reader.result); reader.readAsDataURL(file); }
  };

  const openProductDetail = (prod) => { setSelectedProduct(prod); setSelectedSize(prod.sizes?.[0] || 'Standard'); setActiveModal('detail'); };

  const addToCart = (product, size) => {
    const sizeToUse = size || selectedSize || product.sizes?.[0] || 'Standard';
    const cartKey = `${product.id}-${sizeToUse}`;
    const existing = cart.find(item => item.cartKey === cartKey);
    if (existing) setCart(cart.map(item => item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item));
    else setCart([...cart, { ...product, cartKey, selectedSize: sizeToUse, quantity: 1 }]);
    alert(`${product.title} (${sizeToUse}) Cart me add ho gaya!`);
  };

  const removeFromCart = (cartKey) => setCart(cart.filter(item => item.cartKey !== cartKey));

  const startCheckout = (singleProd = null) => {
    if (singleProd) setSelectedProduct({ ...singleProd, selectedSize: selectedSize || singleProd.sizes?.[0] || 'Standard', quantity: 1 });
    else setSelectedProduct(null);
    setIsEditingAddress(!currentUser?.address); setEnteredUtr(''); setPaymentScreenshot(''); setActiveModal('checkout');
  };

  const getCheckoutItems = () => selectedProduct ? [selectedProduct] : cart;
  const totalDeliveryFee = getCheckoutItems().reduce((sum, item) => sum + (Number(item.deliveryFee || 49) * (item.quantity || 1)), 0);
  const totalProductPrice = getCheckoutItems().reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
  const activeUpiId = getCheckoutItems()[0]?.upiId || 'barijanmart@upi';
  const customQrImage = getCheckoutItems()[0]?.qrImage || '';

  const handlePlaceOrder = () => {
    if (!checkoutAddress.name || !checkoutAddress.phone || !checkoutAddress.address) return alert("Delivery address pura bharein!");
    if (!/^[0-9]{10}$/.test(checkoutAddress.phone)) return alert("Phone number theek 10 digit ka hona chahiye!");
    if (!enteredUtr.trim() && !paymentScreenshot) return alert("12-digit UTR number dalein YA payment screenshot upload karein!");

    const items = getCheckoutItems();
    const newOrder = {
      orderId: 'BM' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      customerName: checkoutAddress.name, customerPhone: checkoutAddress.phone,
      fullAddress: `${checkoutAddress.address}${checkoutAddress.city ? ', ' + checkoutAddress.city : ''}${checkoutAddress.pincode ? ' - ' + checkoutAddress.pincode : ''}`,
      items: items.map(i => ({ title: i.title, price: i.price, quantity: i.quantity || 1, image: i.image, size: i.selectedSize || 'Standard' })),
      totalPrice: totalProductPrice, deliveryFeePaid: totalDeliveryFee,
      utr: enteredUtr.trim() || 'N/A (Screenshot Attached)', screenshot: paymentScreenshot || null,
      status: 'Order Placed', estimatedDelivery: '2-4 Days'
    };
    setOrders([newOrder, ...orders]); setLastOrderDetails(newOrder);
    if (!selectedProduct) setCart([]);
    setEnteredUtr(''); setPaymentScreenshot(''); setActiveModal('success');
  };

  const updateOrderStatus = (orderId, newStatus) => setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
  const updateOrderDeliveryTime = (orderId, newTime) => setOrders(orders.map(o => o.orderId === orderId ? { ...o, estimatedDelivery: newTime } : o));
  const deleteOrder = (orderId) => {
    if (window.confirm("Kya aap sach me is order ko hamesha ke liye delete karna chahte hain?")) {
      setOrders(orders.filter(o => o.orderId !== orderId));
      if (selectedOrderForInvoice?.orderId === orderId) setActiveModal(null);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.title || !prodForm.price || !prodForm.image) return alert("Title, Price aur Photo zaroori hain!");
    const sizeArray = typeof prodForm.sizes === 'string' ? prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : ["Standard"];
    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? { ...prodForm, sizes: sizeArray, id: editingProductId } : p));
      setEditingProductId(null);
    } else {
      setProducts([{ ...prodForm, id: 'p_' + Date.now(), price: Number(prodForm.price), mrp: Number(prodForm.mrp || prodForm.price * 2), deliveryFee: Number(prodForm.deliveryFee || 49), sizes: sizeArray }, ...products]);
    }
    setProdForm({ title: '', description: '', category: 'Fashion', price: '', mrp: '', deliveryFee: '49', sizes: 'S, M, L, XL', fabric: '', color: '', productType: '', expiry: '', weight: '', warranty: '', image: '', upiId: 'barijanmart@upi', qrImage: '' });
    setAdminTab('products');
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authPhone || !authPassword) return alert("Mobile number aur password dalein!");
    if (!/^[0-9]{10}$/.test(authPhone)) return alert("Mobile number theek 10 digit ka hona chahiye!");

    if (authMode === 'register') {
      if (users.find(u => u.phone === authPhone)) return alert("Mobile number pehle se registered hai! Login karein.");
      const role = authPassword === ADMIN_SECRET ? 'admin' : 'customer';
      const newUser = { name: authName || 'User ' + authPhone.slice(-4), phone: authPhone, password: authPassword, role };
      setUsers([...users, newUser]); setCurrentUser(newUser); setActiveModal(null);
      if (role === 'admin') setCurrentTab('admin');
    } else if (authMode === 'login') {
      const user = users.find(u => u.phone === authPhone);
      if (!user) return alert("Account nahi mila! Naya banayein.");
      if (user.password !== authPassword) return alert("Galat Password!");
      const updatedUser = { ...user, role: authPassword === ADMIN_SECRET ? 'admin' : user.role };
      setCurrentUser(updatedUser); setActiveModal(null);
      if (updatedUser.role === 'admin') setCurrentTab('admin');
    }
  };

  const filteredProducts = products.filter(p => (selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()) && p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col relative shadow-xl pb-20 print:shadow-none print:pb-0 print:bg-white">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-lg text-slate-700 hover:bg-slate-100"><Menu size={24} /></button>
          <h1 className="text-xl font-extrabold tracking-tight text-fuchsia-600">Barijan Mart</h1>
        </div>
        <button onClick={() => currentUser ? setCurrentTab('account') : setActiveModal('auth')} className="w-8 h-8 rounded-full overflow-hidden bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center text-fuchsia-600 font-bold">
          {currentUser?.avatar ? <img src={currentUser.avatar} alt="user" className="w-full h-full object-cover" /> : <User size={18} />}
        </button>
      </header>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex print:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 font-bold overflow-hidden">
                    {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{currentUser?.name || "Guest"}</h3>
                    <p className="text-xs text-slate-400">{currentUser?.phone || "Login required"}</p>
                  </div>
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

      {/* HOME TAB */}
      {currentTab === 'home' && (
        <main className="p-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Fashion', 'Footwear', 'Grocery', 'Electronics'].map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-fuchsia-600 text-white' : 'bg-white text-slate-600 border'}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => openProductDetail(p)} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs flex flex-col justify-between cursor-pointer">
                <img src={p.image} alt={p.title} className="w-full aspect-square object-cover bg-slate-100" />
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 line-clamp-1">{p.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-extrabold text-sm text-slate-900">₹{p.price}</span>
                      <span className="text-2xs text-slate-400 line-through">₹{p.mrp}</span>
                    </div>
                    <div className="mt-1.5 inline-block bg-fuchsia-50 text-fuchsia-700 text-2xs font-bold px-2 py-0.5 rounded-md">🚚 Fee: ₹{p.deliveryFee}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProductDetail(p); }} className="mt-3 py-1.5 w-full bg-fuchsia-600 text-white text-2xs font-bold rounded-lg">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* FULL PRODUCT DETAIL SCREEN */}
      {activeModal === 'detail' && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto print:hidden">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md px-4 py-3 border-b flex items-center justify-between z-10">
            <button onClick={() => setActiveModal(null)} className="p-1 rounded-full"><ArrowLeft size={22} className="text-slate-800" /></button>
            <span className="font-bold text-xs text-slate-600 uppercase">{selectedProduct.category}</span>
            <button onClick={() => { addToCart(selectedProduct, selectedSize); }}><ShoppingBag size={20} className="text-slate-700" /></button>
          </div>
          <div className="flex-1 pb-24">
            <img src={selectedProduct.image} alt="" className="w-full aspect-square object-cover bg-slate-100" />
            <div className="p-4 flex flex-col gap-3">
              <h1 className="text-base font-extrabold text-slate-900 leading-snug">{selectedProduct.title}</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">₹{selectedProduct.price}</span>
                <span className="text-sm text-slate-400 line-through">₹{selectedProduct.mrp}</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{Math.round(((selectedProduct.mrp - selectedProduct.price) / selectedProduct.mrp) * 100)}% OFF</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-2xs font-bold px-2.5 py-1 rounded-lg w-fit">
                <Truck size={14} className="text-amber-700" /> Advance Delivery Fee: ₹{selectedProduct.deliveryFee}
              </div>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="border-t pt-3">
                  <span className="text-xs font-bold text-slate-800 block mb-2">Select Size:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((sz) => (
                      <button key={sz} onClick={() => setSelectedSize(sz)} className={`min-w-10 h-10 px-3 rounded-xl border text-xs font-bold transition-all ${selectedSize === sz ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>{sz}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <h3 className="text-xs font-extrabold text-slate-900 mb-2.5 uppercase">Product Details</h3>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
                  {selectedProduct.fabric && <div><span className="text-2xs text-slate-400 block font-bold">Fabric</span><span className="font-semibold text-slate-800">{selectedProduct.fabric}</span></div>}
                  {selectedProduct.color && <div><span className="text-2xs text-slate-400 block font-bold">Color</span><span className="font-semibold text-slate-800">{selectedProduct.color}</span></div>}
                  {selectedProduct.productType && <div><span className="text-2xs text-slate-400 block font-bold">Type</span><span className="font-semibold text-slate-800">{selectedProduct.productType}</span></div>}
                  {selectedProduct.expiry && <div><span className="text-2xs text-slate-400 block font-bold">Expiry Date</span><span className="font-semibold text-emerald-700">{selectedProduct.expiry}</span></div>}
                  {selectedProduct.weight && <div><span className="text-2xs text-slate-400 block font-bold">Net Quantity</span><span className="font-semibold text-slate-800">{selectedProduct.weight}</span></div>}
                  {selectedProduct.warranty && <div><span className="text-2xs text-slate-400 block font-bold">Warranty</span><span className="font-semibold text-slate-800">{selectedProduct.warranty}</span></div>}
                </div>
              </div>
              <div className="border-t pt-3"><h3 className="text-xs font-extrabold text-slate-900 mb-1.5 uppercase">Description</h3><p className="text-xs text-slate-600">{selectedProduct.description}</p></div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t p-3 grid grid-cols-2 gap-2 shadow-2xl z-20">
            <button onClick={() => addToCart(selectedProduct, selectedSize)} className="py-3 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">Add to cart</button>
            <button onClick={() => { setActiveModal(null); startCheckout(selectedProduct); }} className="py-3 bg-fuchsia-600 text-white font-bold text-xs rounded-xl shadow-md">Buy now</button>
          </div>
        </div>
      )}

      {/* CART TAB */}
      {currentTab === 'cart' && (
        <main className="p-4 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800">Shopping Cart ({cart.length})</h2>
          {cart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">Cart khali hai.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.cartKey} className="bg-white p-3 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                      <p className="text-2xs text-fuchsia-600 font-bold">Size: {item.selectedSize}</p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">₹{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartKey)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
              <div className="bg-white p-4 rounded-2xl border flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-xs text-slate-600"><span>Total COD Due:</span><span className="font-bold">₹{cart.reduce((s, i) => s + (i.price * i.quantity), 0)}</span></div>
                <div className="flex justify-between text-xs text-slate-600"><span>Advance Delivery Fee:</span><span className="font-bold text-emerald-600">₹{cart.reduce((s, i) => s + (i.deliveryFee * i.quantity), 0)}</span></div>
                <button onClick={() => startCheckout(null)} className="w-full mt-2 py-3 bg-fuchsia-600 text-white font-bold text-xs rounded-xl shadow-xs">Checkout All Products</button>
              </div>
            </div>
          )}
        </main>
      )}
            {/* CHECKOUT MODAL */}
      {activeModal === 'checkout' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 print:hidden">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b"><h3 className="font-bold text-sm text-slate-800">Checkout & Delivery</h3><button onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-extrabold text-slate-500 uppercase">Delivery Details</span>
                <button onClick={() => setIsEditingAddress(!isEditingAddress)} className="flex items-center gap-1 text-xs text-fuchsia-600 font-bold"><Edit3 size={14} /> {isEditingAddress ? 'Done' : 'Change'}</button>
              </div>
              {isEditingAddress ? (
                <div className="flex flex-col gap-2 mt-2">
                  <input type="text" placeholder="Full Name" value={checkoutAddress.name} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, name: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                  <input type="tel" maxLength={10} placeholder="10-digit Phone Number" value={checkoutAddress.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if(val.length <= 10) setCheckoutAddress({ ...checkoutAddress, phone: val }); }} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                  <textarea placeholder="Full Address" value={checkoutAddress.address} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, address: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="City" value={checkoutAddress.city} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, city: e.target.value })} className="px-3 py-2 text-xs border rounded-xl bg-white" />
                    <input type="text" placeholder="PIN Code" value={checkoutAddress.pincode} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, pincode: e.target.value })} className="px-3 py-2 text-xs border rounded-xl bg-white" />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">{checkoutAddress.name || 'Name not set'} • <span className="font-normal text-slate-600">{checkoutAddress.phone || 'Phone not set'}</span></p>
                  <p className="mt-1 text-slate-600">{checkoutAddress.address || 'Address not added yet'}{checkoutAddress.city ? `, ${checkoutAddress.city}` : ''}{checkoutAddress.pincode ? ` - ${checkoutAddress.pincode}` : ''}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
              <span className="text-2xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full mb-1">Advance Delivery Fee</span>
              <p className="text-xs text-slate-600 mb-2">Advance pay karein: <span className="font-extrabold text-slate-900">₹{totalDeliveryFee}</span>. COD: ₹{totalProductPrice}</p>
              <img src={customQrImage || `https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} alt="UPI QR" className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border mb-2 object-contain" />
              <div className="grid grid-cols-3 gap-2 w-full mt-3">
                <a href={`phonepe://pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} className="py-2 bg-indigo-600 text-white rounded-xl text-2xs font-bold">PhonePe</a>
                <a href={`tez://upi/pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} className="py-2 bg-blue-600 text-white rounded-xl text-2xs font-bold">GPay</a>
                <a href={`paytmmp://pay?pa=${activeUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`} className="py-2 bg-sky-500 text-white rounded-xl text-2xs font-bold">Paytm</a>
              </div>
            </div>

            <div className="bg-fuchsia-50/60 p-3.5 rounded-2xl border border-fuchsia-100 flex flex-col gap-2.5">
              <span className="text-2xs font-extrabold text-fuchsia-800 uppercase">Payment Proof (Mandatory: UTR ya Screenshot)</span>
              <div>
                <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-fuchsia-300 rounded-xl cursor-pointer bg-white">
                  <UploadCloud size={16} className="text-fuchsia-600" />
                  <span className="text-xs text-fuchsia-700 font-bold">{paymentScreenshot ? 'Screenshot Attached ✓' : 'Upload Payment Screenshot'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (data) => setPaymentScreenshot(data))} />
                </label>
                {paymentScreenshot && <img src={paymentScreenshot} className="w-12 h-12 rounded-lg object-cover border mt-2" />}
              </div>
              <div className="text-center text-2xs text-fuchsia-700 font-bold uppercase">YA</div>
              <input type="text" placeholder="Enter 12-digit UPI UTR" value={enteredUtr} onChange={(e) => setEnteredUtr(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
            </div>

            <button onClick={handlePlaceOrder} className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md">Verify Payment & Place Order</button>
          </div>
        </div>
      )}

      {/* CUSTOMER ORDERS TAB */}
      {currentTab === 'orders' && (
        <main className="p-4 flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800">My Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <Package size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">Abhi koi order nahi hai.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.orderId} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-xs font-extrabold text-fuchsia-600">Order #{o.orderId}</span>
                  <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700">{o.status}</span>
                </div>
                <div className="my-2 p-2 bg-slate-50 rounded-xl flex items-center gap-2 border text-2xs">
                  <Truck size={14} className="text-fuchsia-600" />
                  <span className="text-slate-500">Delivery Status / Time:</span>
                  <span className="font-bold text-slate-800">{o.estimatedDelivery || "In Transit"}</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {o.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-center">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 text-xs"><p className="font-semibold text-slate-800 line-clamp-1">{item.title}</p><p className="text-2xs text-slate-500">Size: <b className="text-slate-700">{item.size}</b> • Qty: {item.quantity} • ₹{item.price}</p></div>
                    </div>
                  ))}
                  <div className="border-t pt-2 text-2xs text-slate-600 flex justify-between"><span>Paid Fee: <b className="text-emerald-600">₹{o.deliveryFeePaid}</b></span><span>COD Due: <b className="text-slate-900">₹{o.totalPrice}</b></span></div>
                </div>
              </div>
            ))
          )}
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {currentTab === 'admin' && currentUser?.role === 'admin' && (
        <main className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between"><h2 className="text-base font-black text-slate-900">Admin Control Panel</h2></div>
          <div className="flex border-b border-slate-200">
            {['products', 'add', 'orders'].map((tab) => (
              <button key={tab} onClick={() => setAdminTab(tab)} className={`flex-1 py-2 text-xs font-bold uppercase ${adminTab === tab ? 'border-b-2 border-fuchsia-600 text-fuchsia-600' : 'text-slate-400'}`}>
                {tab === 'products' ? 'Products' : tab === 'add' ? '+ Add Product' : 'Orders'}
              </button>
            ))}
          </div>

          {adminTab === 'products' && (
            <div className="flex flex-col gap-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3"><img src={p.image} className="w-12 h-12 rounded-xl object-cover" /><div><h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4><p className="text-2xs text-slate-500">[{p.category}] ₹{p.price}</p></div></div>
                  <div className="flex items-center gap-1"><button onClick={() => { setEditingProductId(p.id); setProdForm(p); setAdminTab('add'); }} className="p-2 text-slate-600"><Edit3 size={16} /></button><button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 text-red-500"><Trash2 size={16} /></button></div>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'add' && (
            <form onSubmit={handleSaveProduct} className="bg-white p-4 rounded-2xl border flex flex-col gap-3">
              <div>
                <span className="text-2xs font-bold text-slate-600 block mb-1">Product Category:</span>
                <select value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-semibold"><option value="Fashion">Fashion / Clothes</option><option value="Footwear">Footwear / Shoes</option><option value="Grocery">Grocery / Food</option><option value="Electronics">Electronics</option></select>
              </div>
              <input type="text" placeholder="Product Title" value={prodForm.title} onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <textarea placeholder="Description" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Price ₹" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="px-2 py-2 text-xs border rounded-xl" />
                <input type="number" placeholder="MRP ₹" value={prodForm.mrp} onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })} className="px-2 py-2 text-xs border rounded-xl" />
                <input type="number" placeholder="Fee ₹" value={prodForm.deliveryFee} onChange={(e) => setProdForm({ ...prodForm, deliveryFee: e.target.value })} className="px-2 py-2 text-xs border rounded-xl" />
              </div>
              
              {prodForm.category === 'Fashion' && (
                <div className="bg-fuchsia-50 p-3 rounded-xl border border-fuchsia-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Fabric" value={prodForm.fabric || ''} onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })} className="px-2.5 py-1.5 text-xs bg-white border rounded-lg" /><input type="text" placeholder="Color" value={prodForm.color || ''} onChange={(e) => setProdForm({ ...prodForm, color: e.target.value })} className="px-2.5 py-1.5 text-xs bg-white border rounded-lg" /></div>
                  <input type="text" placeholder="Type (e.g. Brief, Kurti)" value={prodForm.productType || ''} onChange={(e) => setProdForm({ ...prodForm, productType: e.target.value })} className="px-2.5 py-1.5 text-xs bg-white border rounded-lg" />
                  <input type="text" placeholder="Sizes (S, M, L, XL)" value={prodForm.sizes || ''} onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })} className="px-2.5 py-1.5 text-xs bg-white border rounded-lg" />
                </div>
              )}
              {prodForm.category === 'Grocery' && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Expiry Date" value={prodForm.expiry || ''} onChange={(e) => setProdForm({ ...prodForm, expiry: e.target.value })} className="px-2.5 py-1.5 text-xs bg-white border rounded-lg" />
                  <input type="text" placeholder="Net Weight" value={prodForm.weight || ''} onChange={(e) => setProdForm({ ...prodForm, weight: e.target.value })} className="px-2.5 py-1.5 text-xs bg-white border rounded-lg" />
                </div>
              )}

              <label className="flex items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50"><span className="text-xs text-fuchsia-600 font-bold">Select Photo</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (data) => setProdForm({ ...prodForm, image: data }))} /></label>
              <label className="flex items-center justify-center p-2.5 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50"><span className="text-xs text-slate-700 font-bold">Custom QR Code</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (data) => setProdForm({ ...prodForm, qrImage: data }))} /></label>
              <input type="text" placeholder="UPI ID" value={prodForm.upiId} onChange={(e) => setProdForm({ ...prodForm, upiId: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{editingProductId ? 'Update' : 'Publish'}</button>
            </form>
          )}

          {adminTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <div key={o.orderId} className="bg-white p-3.5 rounded-2xl border text-xs flex flex-col gap-2 shadow-xs cursor-pointer" onClick={() => { setSelectedOrderForInvoice(o); setActiveModal('order_invoice'); }}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-fuchsia-600">#{o.orderId}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteOrder(o.orderId); }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                  <p><span className="font-bold">Customer:</span> {o.customerName} ({o.customerPhone})</p>
                  <p><span className="font-bold">Address:</span> {o.fullAddress}</p>
                  <p className="text-2xs bg-slate-100 p-1.5 rounded font-mono">UTR: {o.utr}</p>
                  
                  <div className="bg-slate-50 p-2.5 rounded-xl border mt-2 flex flex-col gap-2" onClick={(e)=>e.stopPropagation()}>
                    <span className="text-2xs font-bold text-slate-700 uppercase">Change Live Status:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                        <button key={st} onClick={() => updateOrderStatus(o.orderId, st)} className={`py-1.5 px-1 text-3xs font-extrabold rounded-lg border text-center ${o.status === st ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-white text-slate-700'}`}>{st}</button>
                      ))}
                    </div>
                    <input type="text" placeholder="Delivery Time (e.g. Kal 4 PM tak)" value={o.estimatedDelivery || ''} onChange={(e) => updateOrderDeliveryTime(o.orderId, e.target.value)} className="w-full px-2 py-1 bg-white border rounded-lg text-xs mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* FULL PRINTABLE INVOICE MODAL (Admin) */}
      {activeModal === 'order_invoice' && selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-white print:block">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-y-auto max-h-[90vh] print:max-h-full print:rounded-none print:shadow-none p-5 relative">
            <div className="flex justify-between items-center pb-3 border-b mb-4 print:hidden">
              <h3 className="font-extrabold text-sm text-slate-900">Order Details / Invoice</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-1.5 bg-blue-50 text-blue-600 rounded-full"><Printer size={18} /></button>
                <button onClick={() => setActiveModal(null)} className="p-1.5 bg-slate-100 rounded-full text-slate-700"><X size={18} /></button>
              </div>
            </div>

            {/* Printable Content Starts Here */}
            <div className="print:p-4">
              <div className="text-center mb-5 border-b border-dashed pb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">BARIJAN MART</h2>
                <p className="text-xs text-slate-500 mt-1">Order Receipt</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-5">
                <div><span className="text-2xs text-slate-400 block font-bold uppercase">Order ID</span><span className="font-bold text-slate-900">#{selectedOrderForInvoice.orderId}</span></div>
                <div className="text-right"><span className="text-2xs text-slate-400 block font-bold uppercase">Date & Time</span><span className="font-bold text-slate-900">{selectedOrderForInvoice.date}</span></div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border mb-5">
                <h4 className="text-xs font-extrabold text-slate-900 mb-2 uppercase border-b pb-1">Customer Details</h4>
                <p className="font-bold text-slate-800 text-sm mb-1">{selectedOrderForInvoice.customerName}</p>
                <p className="text-xs text-slate-600 mb-1">📞 {selectedOrderForInvoice.customerPhone}</p>
                <p className="text-xs text-slate-600 leading-tight">🏠 {selectedOrderForInvoice.fullAddress}</p>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-extrabold text-slate-900 mb-2 uppercase border-b pb-1">Order Items</h4>
                {selectedOrderForInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-2 border-b border-slate-100 last:border-0">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-2xs text-slate-5
                      00 mt-0.5">Size: <b className="text-slate-800">{item.size}</b> | Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right font-bold text-xs text-slate-900">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border mb-5">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2 uppercase border-b pb-1">Payment & Status</h4>
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">Advance Delivery Fee (Paid):</span><span className="font-bold text-emerald-600">₹{selectedOrderForInvoice.deliveryFeePaid}</span></div>
              <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">COD Due Amount:</span><span className="font-black text-slate-900 text-sm">₹{selectedOrderForInvoice.totalPrice}</span></div>
              <p className="text-2xs text-slate-500 mt-2 font-mono break-all">UTR/Ref: {selectedOrderForInvoice.utr}</p>
              {selectedOrderForInvoice.screenshot && (
                <div className="mt-2 print:hidden">
                  <span className="text-2xs font-bold text-slate-500 block mb-1">Payment Screenshot:</span>
                  <img src={selectedOrderForInvoice.screenshot} onClick={() => setPreviewScreenshotUrl(selectedOrderForInvoice.screenshot)} className="w-24 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 shadow-sm" />
                </div>
              )}
            </div>

            <div className="text-center text-2xs text-slate-400 mt-8 print:mt-12 font-bold uppercase tracking-widest border-t pt-4">
              Thank You for shopping with Barijan Mart!
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t flex justify-center print:hidden">
            <button onClick={() => deleteOrder(selectedOrderForInvoice.orderId)} className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl"><Trash2 size={16} /> Delete Order</button>
          </div>
        </div>
      </div>
    )}

    {/* OTHER MODALS (Auth, Success, Screenshot Preview) */}
    {activeModal === 'success' && lastOrderDetails && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center">
          <CheckCircle2 size={54} className="text-emerald-500 mb-2 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-lg">Order Placed!</h3>
          <button onClick={() => { setActiveModal(null); setCurrentTab('orders'); }} className="w-full mt-4 py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">View My Orders</button>
        </div>
      </div>
    )}

    {activeModal === 'auth' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
        <div className="bg-white w-full max-w-xs rounded-3xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b"><h3 className="font-bold text-sm text-slate-800 uppercase">{authMode}</h3><button onClick={() => setActiveModal(null)}><X size={18} /></button></div>
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-2.5">
            {authMode === 'register' && <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />}
            <input type="tel" maxLength={10} placeholder="10-digit Mobile Number" value={authPhone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if(val.length <= 10) setAuthPhone(val); }} className="w-full px-3 py-2 text-xs border rounded-xl" />
            
            <div className="relative flex items-center">
              <input type={showPassword ? "text" : "password"} placeholder="Enter Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full pl-3 pr-9 py-2 text-xs border rounded-xl" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 text-slate-400 focus:outline-none">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-fuchsia-600 text-white font-bold text-xs rounded-xl">{authMode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <div className="flex justify-center mt-1 text-2xs text-fuchsia-600 font-bold"><button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'New Account? Register' : 'Back to Login'}</button></div>
        </div>
      </div>
    )}
    
    {/* FULL SCREEN SCREENSHOT PREVIEW */}
    {previewScreenshotUrl && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 print:hidden" onClick={() => setPreviewScreenshotUrl(null)}>
        <button className="absolute top-4 right-4 text-white"><X size={24} /></button>
        <img src={previewScreenshotUrl} className="max-w-full max-h-[85vh] object-contain" />
      </div>
    )}

    {/* BOTTOM NAV */}
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-2 z-20 print:hidden">
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
          
              
  
    
