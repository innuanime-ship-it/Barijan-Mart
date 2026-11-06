import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, Package, 
  MapPin, CheckCircle, ArrowLeft, Plus, Minus, Trash2, 
  Clock, ShieldCheck, PhoneCall, ChevronRight, AlertCircle, 
  Share2, LogOut, Check, Sparkles, Truck, QrCode, Camera, Lock, Key, Zap, Edit3, 
  ExternalLink, RefreshCw, XCircle, Menu, X, MessageCircle, Instagram, Facebook,
  ChevronDown, ChevronUp, ZoomIn, ZoomOut, CheckCircle2, ChevronRight as RightIcon
} from 'lucide-react';

const isValidIndianMobile = (num) => {
  const clean = (num || '').replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(clean);
};

const getCustomerDeliveryDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + (Number(days) || 2));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function App() {
  const [screenStack, setScreenStack] = useState(['home']);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [lastBackPress, setLastBackPress] = useState(0);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItemPhoto, setSelectedItemPhoto] = useState(null);
    // Live Delivery Area (Districts & Blocks from Seller App)
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  // Social Links Managed by Admin
  const [socialLinks, setSocialLinks] = useState({
    support_phone: '9204184716',
    whatsapp_url: 'https://wa.me/919204184716',
    facebook_url: 'https://facebook.com',
    instagram_url: 'https://instagram.com'
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bm_current_customer') || 'null');
    } catch (e) {
      return null;
    }
  });

  // BPIN Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [isPhoneLocked, setIsPhoneLocked] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [newBpin, setNewBpin] = useState('');

  // Profile Address Form State (Village/House, Ward/Road, District & Block)
  const [addressForm, setAddressForm] = useState({
    villageHouse: currentUser?.villageHouse || currentUser?.village || '',
    wardRoad: currentUser?.wardRoad || currentUser?.wardNo || '',
    panchayat: currentUser?.panchayat || '',
    postOffice: currentUser?.postOffice || '',
    block: currentUser?.block || '',
    district: currentUser?.district || '',
    pincode: currentUser?.pincode || ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Profile Photo Cropper Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const canvasRef = useRef(null);
    // Cart, Wishlist & Orders States
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bm_cart') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bm_wishlist') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [myOrders, setMyOrders] = useState([]);
  const [activeOrderDetail, setActiveOrderDetail] = useState(null);
  const [orderConfirmedData, setOrderConfirmedData] = useState(null);

  // Checkout Extra States
  const [altPhone, setAltPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Return & Replacement Modal State
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [actionType, setActionType] = useState('return');
  const [actionReason, setActionReason] = useState('');
  const [actionImage, setActionImage] = useState(null);
  const [refundMethod, setRefundMethod] = useState('upi');
  const [refundUpi, setRefundUpi] = useState('');
  const [bankDetails, setBankDetails] = useState({ accountNo: '', ifsc: '', holderName: '' });
  const [submittingAction, setSubmittingAction] = useState(false);

  const activeTab = screenStack[screenStack.length - 1] || 'home';

  const navigateTo = (screenName) => {
    setScreenStack(prev => [...prev, screenName]);
    window.history.pushState({ page: 'barijan', screen: screenName }, '');
  };

  const setActiveTab = (screenName) => navigateTo(screenName);
    const goBack = () => {
    if (orderConfirmedData) {
      setOrderConfirmedData(null);
      setScreenStack(['home']);
      return;
    }
    if (activeOrderDetail) {
      setActiveOrderDetail(null);
      return;
    }
    if (isCheckoutOpen) {
      const confirmLeave = window.confirm("⚠️ Kya aap order page se bahar jana chahte hain? Aapka order cancel ho jayega!");
      if (!confirmLeave) return;
      setIsCheckoutOpen(false);
      return;
    }
    if (screenStack.length > 1) {
      setScreenStack(prev => prev.slice(0, prev.length - 1));
    } else {
      setScreenStack(['home']);
    }
  };

  useEffect(() => {
    window.history.pushState({ page: 'barijan' }, '');

    const handlePopState = () => {
      if (orderConfirmedData) {
        setOrderConfirmedData(null);
        setScreenStack(['home']);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (activeOrderDetail) {
        setActiveOrderDetail(null);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (isCheckoutOpen) {
        if (!window.confirm("⚠️ Kya aap order process chhodna chahte hain?")) {
          window.history.pushState({ page: 'barijan' }, '');
          return;
        }
        setIsCheckoutOpen(false);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (cropModalOpen) {
        setCropModalOpen(false);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (selectedOrderForAction) {
        setSelectedOrderForAction(null);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (selectedItemPhoto) {
        setSelectedItemPhoto(null);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      if (activeTab !== 'home') {
        setScreenStack(['home']);
        window.history.pushState({ page: 'barijan' }, '');
        return;
      }
      const now = Date.now();
      if (now - lastBackPress < 2500) {
        window.history.back();
      } else {
        setLastBackPress(now);
        alert("App band karne ke liye ek baar aur back button dabayein.");
        window.history.pushState({ page: 'barijan' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, isCheckoutOpen, isAuthOpen, selectedOrderForAction, selectedItemPhoto, cropModalOpen, activeOrderDetail, orderConfirmedData, lastBackPress]);
    // Profile Photo Cropper Functions
  const handleProfilePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target.result);
      setZoomScale(1);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const drawCroppedAvatar = () => {
    if (!rawImageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.clearRect(0, 0, 300, 300);

      ctx.beginPath();
      ctx.arc(150, 150, 145, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      const baseWidth = image.width;
      const baseHeight = image.height;
      const aspect = baseWidth / baseHeight;
      let drawW, drawH;
      if (aspect > 1) {
        drawH = 300 * zoomScale;
        drawW = drawH * aspect;
      } else {
        drawW = 300 * zoomScale;
        drawH = drawW / aspect;
      }
      const drawX = (300 - drawW) / 2;
      const drawY = (300 - drawH) / 2;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    };
    image.src = rawImageSrc;
  };

  useEffect(() => {
    if (cropModalOpen && rawImageSrc) {
      drawCroppedAvatar();
    }
  }, [cropModalOpen, rawImageSrc, zoomScale]);

  const saveCroppedPhoto = () => {
    if (!canvasRef.current || !currentUser) return;
    const croppedBase64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
    const updatedUser = { ...currentUser, avatar: croppedBase64 };
    setCurrentUser(updatedUser);
    localStorage.setItem('bm_current_customer', JSON.stringify(updatedUser));

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const idx = allUsers.findIndex(u => u.phone === currentUser.phone);
    if (idx !== -1) {
      allUsers[idx] = updatedUser;
      localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    }
    setCropModalOpen(false);
    alert("Profile photo saved!");
  };
    const handlePhoneBoxClick = async () => {
    if (isPhoneLocked) return;
    try {
      if (navigator.credentials && navigator.credentials.get) {
        const cred = await navigator.credentials.get({});
        if (cred && cred.id) {
          const clean = cred.id.replace(/\D/g, '').slice(-10);
          if (isValidIndianMobile(clean)) {
            setAuthPhone(clean);
            setIsPhoneLocked(true);
            return;
          }
        }
      }
    } catch (err) {
      console.log("SIM Hint not triggered, manual typing allowed.");
    }
  };

  const handleReturnPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h *= maxDim / w; w = maxDim; } 
        else if (h > maxDim) { w *= maxDim / h; h = maxDim; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        setActionImage(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    localStorage.setItem('bm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      return exists ? prev.filter(item => item.id !== product.id) : [...prev, product];
    });
  };

  const handleUnlistWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    alert("Product ko wishlist se unlist (remove) kar diya gaya!");
  };
    useEffect(() => {
    fetchCatalog();
    fetchAdminSettings();
    fetchDeliveryAreas();
    if (currentUser?.phone) fetchUserOrders(currentUser.phone);
    else setMyOrders([]);

    const catalogChannel = supabase.channel('customer-catalog-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchCatalog).subscribe();
    const ordersChannel = supabase.channel('customer-orders-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (currentUser?.phone) fetchUserOrders(currentUser.phone);
      }).subscribe();
    const settingsChannel = supabase.channel('admin-settings-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, fetchAdminSettings).subscribe();
    const areasChannel = supabase.channel('customer-areas-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_areas' }, fetchDeliveryAreas).subscribe();

    return () => {
      supabase.removeChannel(catalogChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(areasChannel);
    };
  }, [currentUser]);

  const fetchAdminSettings = async () => {
    try {
      const { data } = await supabase.from('app_settings').select('*').single();
      if (data) setSocialLinks(prev => ({ ...prev, ...data }));
    } catch (err) {}
  };

  const fetchDeliveryAreas = async () => {
    try {
      const { data } = await supabase.from('delivery_areas').select('*').order('district', { ascending: true });
      if (data) setDeliveryAreas(data);
    } catch (err) {}
  };

  const fetchCatalog = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
        const validIds = new Set(data.map(p => p.id));
        setCart(prev => prev.filter(item => validIds.has(item.id)));
        setWishlist(prev => prev.filter(item => validIds.has(item.id)));
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (phone) => {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('customer_phone', phone).order('created_at', { ascending: false });
      if (!error && data) setMyOrders(data);
    } catch (err) {}
  };

  // Delivery Areas Logic
  const allowedDistricts = [...new Set(deliveryAreas.filter(a => a.is_active).map(a => a.district))];
  const allowedBlocksForDistrict = (districtName) => {
    return deliveryAreas.filter(a => a.district === districtName && a.is_active).map(a => a.block);
  };

  const isCustomerAddressDeliverable = () => {
    const userBlock = currentUser?.block;
    const userDistrict = currentUser?.district;
    if (!userBlock || !userDistrict) return true;
    const match = deliveryAreas.find(a => 
      a.district.toLowerCase() === userDistrict.toLowerCase() && 
      a.block.toLowerCase() === userBlock.toLowerCase()
    );
    return match ? match.is_active : true;
  };
    const handleRegisterWithPin = (e) => {
    e.preventDefault();
    const cleanPhone = authPhone.trim().replace(/\D/g, '');
    const cleanName = authName.trim().toUpperCase();

    if (!cleanName) return alert("Kripya apna Pura Naam darj karein!");
    if (!isValidIndianMobile(cleanPhone)) return alert("Galat Mobile Number! Number sirf 6, 7, 8 ya 9 se shuru hona chahiye aur 10 digit ka hona chahiye.");
    if (!/^\d{4}$/.test(authPin.trim())) return alert("Kripya 4-digit ka valid BPIN banayein (Jaise: 1234)!");

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    if (allUsers.find(u => u.phone === cleanPhone)) return alert("Yeh mobile number pehle se registered hai! Kripya 'Login' karein ya PIN reset karein.");

    const newUser = {
      name: cleanName,
      phone: cleanPhone,
      bpin: authPin.trim(),
      villageHouse: '',
      wardRoad: '',
      panchayat: '',
      postOffice: '',
      block: '',
      district: '',
      pincode: '',
      avatar: null,
      registered_at: new Date().toISOString()
    };

    allUsers.push(newUser);
    localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    localStorage.setItem('bm_current_customer', JSON.stringify(newUser));

    setCurrentUser(newUser);
    setIsAuthOpen(false);
    setAuthPin('');
    setAuthPhone('');
    setAuthName('');
    setIsPhoneLocked(false);
    alert("Badhaai ho! Barijan Mart account safalta se ban gaya!");
  };

  const handleLoginWithPin = (e) => {
    e.preventDefault();
    const cleanPhone = authPhone.trim().replace(/\D/g, '');
    if (!isValidIndianMobile(cleanPhone)) return alert("Kripya valid 10-digit mobile number darj karein!");
    if (!/^\d{4}$/.test(authPin.trim())) return alert("Kripya apna 4-digit BPIN enter karein!");

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const user = allUsers.find(u => u.phone === cleanPhone);

    if (!user) return alert("Yeh number registered nahi hai! Kripya pehle 'Naya Khata Banayein' par tap karein.");

    if (user.bpin === authPin.trim()) {
      localStorage.setItem('bm_current_customer', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthOpen(false);
      setAuthPin('');
      setAuthPhone('');
      setIsPhoneLocked(false);
      alert("Swagat hai! Login safal raha.");
    } else {
      alert("Galat BPIN! Agar aap PIN bhool gaye hain toh 'Forgot BPIN' par click karein.");
    }
  };

  const handleForgotPinReset = (e) => {
    e.preventDefault();
    const cleanPhone = authPhone.trim().replace(/\D/g, '');
    const cleanName = authName.trim().toUpperCase();

    if (!cleanName || !isValidIndianMobile(cleanPhone)) return alert("Kripya apna Registered Name aur Sahi Mobile Number darj karein!");
    if (!/^\d{4}$/.test(newBpin.trim())) return alert("Naya BPIN theek 4-digit ka hona chahiye!");

    const allUsers = JSON.parse(localStorage.getItem('bm_registered_users') || '[]');
    const index = allUsers.findIndex(u => u.phone === cleanPhone);

    if (index === -1) return alert("Yeh mobile number database mein nahi mila!");
    if (allUsers[index].name.toUpperCase() !== cleanName) return alert("Registered Naam match nahi hua! Kripya vahi naam dalein jo khata banate waqt dala tha.");

    allUsers[index].bpin = newBpin.trim();
    localStorage.setItem('bm_registered_users', JSON.stringify(allUsers));
    localStorage.setItem('bm_current_customer', JSON.stringify(allUsers[index]));

    setCurrentUser(allUsers[index]);
    setIsAuthOpen(false);
    setAuthPhone('');
    setAuthName('');
    setNewBpin('');
    setAuthPin('');
    setIsPhoneLocked(false);
    alert("Aapka naya BPIN set ho gaya aur Login successful!");
  };
    const handleSaveProfileAddress = (e) => {
    e.preventDefault();
    if (!addressForm.villageHouse || !addressForm.wardRoad || !addressForm.district || !addressForm.block || !addressForm.pincode) {
      return alert("Village/House, Ward/Road, District, Block aur Pincode bharna anivarya hai!");
    }

    const updated = {
      ...currentUser,
      ...addressForm,
      village: addressForm.villageHouse,
      wardNo: addressForm.wardRoad
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

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bm_current_customer');
    setMyOrders([]);
  };

  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setCustomerLocation({ note: "Manual / Default Location", timestamp: new Date().toISOString() });
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: `${Math.round(pos.coords.accuracy)}m`,
          mapsUrl: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
          timestamp: new Date().toISOString()
        });
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setCustomerLocation({ note: "Manual Location Confirmed", timestamp: new Date().toISOString() });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
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
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h *= maxDim / w; w = maxDim; }
        else if (h > maxDim) { w *= maxDim / h; h = maxDim; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        setPaymentScreenshot(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getMinQty = (prod) => Number(prod?.min_quantity || prod?.min_items || 1);

  const isFashionProduct = (prod) => {
    const cat = (prod?.category || '').toLowerCase();
    return cat.includes('fashion') || cat.includes('footwear') || cat.includes('kapde') || cat.includes('shoes');
  };
    const handleAddToCart = (prod) => {
    if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); return; }
    const minQ = getMinQty(prod);
    const hasSize = isFashionProduct(prod) && prod.sizes && prod.sizes.length > 0;
    const finalSize = hasSize ? (selectedSize || prod.sizes[0]) : null;
    const finalColor = selectedColor || prod.color || null;

    setCart(prev => {
      const idx = prev.findIndex(item => item.id === prod.id && item.size === finalSize && item.color === finalColor);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { ...prod, size: finalSize, color: finalColor, quantity: minQ }];
    });
    alert("Item Cart mein joda gaya!");
  };

  const handleInitiateBuyNow = (prod) => {
    if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); return; }
    const minQ = getMinQty(prod);
    const hasSize = isFashionProduct(prod) && prod.sizes && prod.sizes.length > 0;
    const finalSize = hasSize ? (selectedSize || prod.sizes[0]) : null;
    const finalColor = selectedColor || prod.color || null;

    setCheckoutProduct({ ...prod, size: finalSize, color: finalColor, quantity: minQ });
    setIsCheckoutOpen(true);
  };

  const updateCartQty = (id, size, change) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id && item.size === size) {
          const minQ = getMinQty(item);
          const newQty = item.quantity + change;
          if (newQty < minQ && change < 0) {
            alert("Aapko kam se kam minimum requirement jitna order karna hoga!");
            return null;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const getCheckoutItems = () => {
    if (checkoutProduct) {
      return [{ ...checkoutProduct, quantity: checkoutProduct.quantity || getMinQty(checkoutProduct) }];
    }
    return cart;
  };

  const totalProductAmount = getCheckoutItems().reduce((acc, it) => acc + (Number(it.price) * (it.quantity || 1)), 0);
  const totalDeliveryFee = getCheckoutItems().reduce((acc, it) => {
    const fee = (it.delivery_fee !== undefined && it.delivery_fee !== null && it.delivery_fee !== '') ? Number(it.delivery_fee) : 0;
    return acc + fee;
  }, 0);

  const primaryUpiId = getCheckoutItems()[0]?.upi_id || 'Barijanmart@upi';
  const upiPayUrl = `upi://pay?pa=${primaryUpiId}&pn=BarijanMart&am=${totalDeliveryFee}&cu=INR`;
    const handleExecuteOrder = async () => {
    if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); return; }
    
    if (!currentUser.villageHouse || !currentUser.wardRoad || !currentUser.district || !currentUser.block) {
      alert("Kripya profile mein jakar apna pura address aur block select karein!");
      setIsCheckoutOpen(false);
      navigateTo('profile');
      return;
    }

    if (!isCustomerAddressDeliverable()) {
      alert(`⚠️ Maaf kijiye, ${currentUser.block} block (${currentUser.district}) mein abhi delivery uplabdh nahi hai! Kripya apna address update karein.`);
      return;
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
    const dynamicEstDate = `By ${getCustomerDeliveryDate(orderItems[0]?.delivery_days || 2)}`;

    const formattedAddress = `House/Vill: ${currentUser.villageHouse}, Ward/Road: ${currentUser.wardRoad}, Panchayat: ${currentUser.panchayat || 'N/A'}, Block: ${currentUser.block}, Dist: ${currentUser.district} - ${currentUser.pincode}, Phone: ${currentUser.phone}` + (altPhone.trim() ? `, Alt: ${altPhone.trim()}` : '');

    const orderPayload = {
      id: newOrderId,
      customer_name: currentUser.name,
      customer_phone: currentUser.phone,
      alt_phone: altPhone.trim() || null,
      village: currentUser.villageHouse,
      avatar: currentUser.avatar || null,
      full_address: formattedAddress,
      items: orderItems,
      total_price: totalProductAmount,
      delivery_fee_paid: totalDeliveryFee,
      utr: utrNumber.trim() || null,
      screenshot: paymentScreenshot || null,
      location: customerLocation || { note: "Direct Customer Order", timestamp: new Date().toISOString() },
      status: 'Order Placed',
      estimated_delivery: dynamicEstDate
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

        // Full Screen Green Confirmation Screen Trigger
        setOrderConfirmedData(record);
      }
    } catch (e) {
      alert("Network Error: " + e.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Kya aap sach mein yeh order cancel karna chahte hain?")) return;
    try {
      const { error } = await supabase.from('orders').update({ status: 'Cancel Approved' }).eq('id', orderId);
      if (error) throw error;
      setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancel Approved' } : o));
      alert("Aapka order Cancel ho chuka hai (Processing).");
    } catch (err) {
      alert("Order not cancelled: " + err.message);
    }
  };
    const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionReason.trim()) return alert("Kripya poora karan batayein!");
    if (!actionImage) return alert("Kripya product ki photo upload karein!");
    if (actionType === 'return') {
      if (refundMethod === 'upi' && !refundUpi.trim()) return alert("Kripya apna UPI Id ya Number darj karein!");
      if (refundMethod === 'bank' && (!bankDetails.accountNo || !bankDetails.ifsc || !bankDetails.holderName)) {
        return alert("Bank details ke sabhi boxes bharna anivarya hai!");
      }
    }

    setSubmittingAction(true);
    const returnPayload = {
      type: actionType === 'return' ? 'वापस करना है' : 'बदलना है',
      reason: actionReason.trim(),
      product_photo: actionImage,
      refund_method: actionType === 'return' ? refundMethod : null,
      refund_details: actionType === 'return' ? (refundMethod === 'upi' ? { upi: refundUpi.trim() } : bankDetails) : null,
      requested_at: new Date().toISOString()
    };

    try {
      const statusTitle = actionType === 'return' ? 'Return Requested' : 'Replacement Requested';
      const { error } = await supabase.from('orders').update({ status: statusTitle, return_info: returnPayload }).eq('id', selectedOrderForAction.id);
      if (error) throw error;

      setMyOrders(prev => prev.map(o => o.id === selectedOrderForAction.id ? { ...o, status: statusTitle, return_info: returnPayload } : o));
      alert("Request safalta se bhej di gayi hai! BMart Admin iski janch karega.");
      setSelectedOrderForAction(null);
      setActionReason('');
      setActionImage(null);
      setRefundUpi('');
      setBankDetails({ accountNo: '', ifsc: '', holderName: '' });
    } catch (err) {
      alert("Request bhejne me error: " + err.message);
    } finally {
      setSubmittingAction(false);
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
      
      {/* FULL SCREEN GREEN ORDER CONFIRMED SCREEN */}
      {orderConfirmedData && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="my-auto flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-xl ring-8 ring-emerald-50">
              <CheckCircle2 size={54} className="stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Confirmed!</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">Aapka order safalta se book ho gaya hai.</p>
            
            <div className="w-full max-w-xs mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5 text-xs text-left">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-black text-slate-900">#{orderConfirmedData.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Delivery By:</span>
                <span className="font-black text-emerald-700">{orderConfirmedData.estimated_delivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">COD Due:</span>
                <span className="font-black text-slate-900">₹{orderConfirmedData.total_price}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-4">
            <button 
              onClick={() => { setOrderConfirmedData(null); navigateTo('orders'); }}
              className="w-full py-3.5 bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-lg active:scale-95 transition"
            >
              Mere Orders Dekhein
            </button>
            <button 
              onClick={() => { setOrderConfirmedData(null); setScreenStack(['home']); }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* PROFILE PHOTO CROP MODAL */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-3">
            <h3 className="font-black text-sm text-slate-900">Profile Photo Adjust & Crop</h3>
            <p className="text-[10px] text-slate-500 text-center">Photo ko gol frame ke andar barabar adjust karein</p>
            
            <div className="w-48 h-48 rounded-full border-4 border-red-600 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-inner">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            </div>

            <div className="w-full flex items-center gap-2 mt-2 px-2">
              <ZoomOut size={16} className="text-slate-500" />
              <input 
                type="range" min="0.8" max="2.5" step="0.05" 
                value={zoomScale} 
                onChange={e => setZoomScale(parseFloat(e.target.value))} 
                className="w-full accent-red-700 cursor-pointer"
              />
              <ZoomIn size={16} className="text-slate-500" />
            </div>

            <div className="w-full flex gap-2 mt-2">
              <button onClick={() => setCropModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Cancel</button>
              <button onClick={saveCroppedPhoto} className="flex-1 py-2 bg-red-700 text-white rounded-xl font-bold text-xs shadow">Crop & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & LIVE TRACKING TIMELINE MODAL */}
      {activeOrderDetail && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-in slide-in-from-right duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b pb-3 bg-white p-3 rounded-2xl shadow-xs">
              <button onClick={() => setActiveOrderDetail(null)} className="p-1 text-slate-600"><ArrowLeft size={18} /></button>
              <div>
                <h3 className="font-black text-sm text-slate-900">Order Timeline #{activeOrderDetail.id}</h3>
                <p className="text-[10px] text-slate-400">{new Date(activeOrderDetail.created_at).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* LIVE STEP PROGRESS BAR */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-900 mb-3">Live Delivery Status</h4>
              <div className="flex items-center justify-between relative px-2">
                {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                  const currentStatus = activeOrderDetail.status || 'Order Placed';
                  const stepsArray = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
                  const isDone = stepsArray.indexOf(currentStatus) >= idx;
                  const isCancelled = currentStatus.includes('Cancel');

                  return (
                    <div key={idx} className="flex flex-col items-center z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isCancelled ? 'bg-rose-100 text-rose-700' : isDone ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-slate-600 text-center max-w-[60px]">{step}</span>
                    </div>
                  );
                })}
              </div>
              {activeOrderDetail.status_msg && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800">
                  <p className="font-black">BMart Store Note:</p>
                  <p className="mt-0.5">{activeOrderDetail.status_msg}</p>
                </div>
              )}
            </div>

            {/* CLICKABLE ITEM TO JUMP TO PRODUCT PAGE */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase">Items In This Order:</span>
              {(activeOrderDetail.items || []).map((it, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    const matched = products.find(p => p.id === it.id);
                    if (matched) {
                      setSelectedProduct(matched);
                      setActiveOrderDetail(null);
                      navigateTo('product-detail');
                    }
                  }}
                  className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 cursor-pointer active:scale-98 transition"
                >
                  <img src={it.images?.[0] || 'https://via.placeholder.com/60'} alt={it.title} className="w-14 h-14 rounded-xl object-contain bg-white" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                      {it.title} <RightIcon size={12} className="text-slate-400" />
                    </h5>
                    <p className="text-[10px] text-slate-500">Qty: {it.quantity || 1} {it.size ? `| Size: ${it.size}` : ''} {it.color ? `| Color: ${it.color}` : ''}</p>
                    <span className="text-xs font-black text-red-700">₹{it.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 text-xs flex flex-col gap-1.5">
              <span className="font-black text-slate-900">Delivery Address:</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">{activeOrderDetail.full_address}</p>
            </div>
          </div>

          <button onClick={() => setActiveOrderDetail(null)} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs mt-4">Close Details</button>
        </div>
      )}
            {/* 3-Lines Side Drawer Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex backdrop-blur-xs">
          <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="font-black text-base text-red-700">Barijan Mart Menu</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                  <X size={18} />
                </button>
              </div>

              {currentUser && (
                <div className="p-3 bg-red-50 rounded-2xl mb-4 border border-red-100">
                  <p className="font-bold text-xs text-slate-800">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">📞 {currentUser.phone}</p>
                  <p className="text-[10px] text-red-700 font-semibold mt-1">🏡 {currentUser.villageHouse || currentUser.village || 'Address pending in profile'}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button onClick={() => { navigateTo('home'); setIsDrawerOpen(false); }} className="text-left py-2 px-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700">🏠 Home Page</button>
                <button onClick={() => { navigateTo('orders'); setIsDrawerOpen(false); }} className="text-left py-2 px-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700">📦 Mere Orders</button>
                <button onClick={() => { navigateTo('profile'); setIsDrawerOpen(false); }} className="text-left py-2 px-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700">📍 Manage Delivery Address</button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-black text-slate-800 mb-2">Customer Service & Socials</p>
                <div className="flex flex-col gap-2">
                  <a href={"tel:" + socialLinks.support_phone} className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
                    <PhoneCall size={14} className="text-red-700" />
                    <span>Call Care: {socialLinks.support_phone}</span>
                  </a>
                  <a href={socialLinks.whatsapp_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold text-emerald-800">
                    <MessageCircle size={15} className="text-emerald-600" />
                    <span>WhatsApp Official Support</span>
                  </a>
                  <a href={socialLinks.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold text-blue-800">
                    <Facebook size={15} className="text-blue-600" />
                    <span>Facebook Page</span>
                  </a>
                  <a href={socialLinks.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-pink-50 hover:bg-pink-100 rounded-xl text-xs font-bold text-pink-800">
                    <Instagram size={15} className="text-pink-600" />
                    <span>Instagram Profile</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center border-t pt-3">
              Barijan Mart v2.5 • Village Commerce
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setIsDrawerOpen(true)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl active:scale-95 transition">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">Barijan Mart</h1>
              <p className="text-[10px] text-red-100 font-medium mt-0.5 truncate max-w-[150px]">
                {currentUser ? "📍 " + (currentUser.villageHouse || currentUser.village || 'Barijan') : "⚡ Direct Village Doorstep"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); } else navigateTo('wishlist'); }} className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full relative transition shadow-sm">
              <Heart size={17} className={wishlist.length > 0 ? "fill-white text-white" : "text-white"} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow">{wishlist.length}</span>}
            </button>
            <button onClick={() => { if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); } else navigateTo('cart'); }} className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full relative transition shadow-sm">
              <ShoppingCart size={17} />
              {cart.length > 0 && <span className="absolute -top-1 right-2 bg-yellow-400 text-slate-900 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
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

      <main className="p-3.5 flex-1">
        {/* PRODUCT DETAIL SCREEN WITH MULTI-IMAGE, COLOR & FLIPKART DETAILS */}
        {activeTab === 'product-detail' && selectedProduct && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
            <button 
              onClick={() => navigateTo('home')} 
              className="mb-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Products
            </button>

            {/* MULTI-PHOTO SWIPER & THUMBNAILS */}
            <div className="w-full bg-slate-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 p-2">
              <img 
                src={selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0] || 'https://via.placeholder.com/300'} 
                alt={selectedProduct.title} 
                className="w-full max-h-[380px] object-contain rounded-xl transition duration-200" 
              />
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 max-w-full">
                  {selectedProduct.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg object-contain bg-white border-2 cursor-pointer transition ${activeImageIndex === idx ? 'border-red-700 shadow-sm' : 'border-slate-200 opacity-60'}`}
                      alt="thumb" 
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <h2 className="font-black text-lg text-slate-900 leading-snug">{selectedProduct.title}</h2>
              
              {/* COLOR SELECTION (IF ANY) */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">Color: <b className="text-red-700">{selectedColor || selectedProduct.colors[0]}</b></span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 text-xs font-bold rounded-xl border transition ${selectedColor === c ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SIZES ONLY FOR FASHION/FOOTWEAR (NOT FOR HAIR OIL/GROCERIES) */}
              {isFashionProduct(selectedProduct) && selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-bold text-slate-800">Size:</span>
                  {selectedProduct.sizes.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setSelectedSize(s)} 
                      className={"px-3 py-1 rounded-xl text-xs font-bold border transition " + (selectedSize === s ? 'bg-red-700 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* FLIPKART STYLE PRODUCT DETAILS WITH SEE MORE / SEE LESS */}
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2">
                <span className="font-black text-xs text-slate-900">Product details</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {isFashionProduct(selectedProduct) && selectedProduct.fabric && (
                    <div><span className="text-slate-400 block text-[10px]">Fabric / Material</span><b className="text-slate-800">{selectedProduct.fabric}</b></div>
                  )}
                  {selectedProduct.expiry_date && (
                    <div><span className="text-slate-400 block text-[10px]">Expiry Date</span><b className="text-rose-600">{selectedProduct.expiry_date}</b></div>
                  )}
                  {selectedProduct.mfg_date && (
                    <div><span className="text-slate-400 block text-[10px]">Mfg Date</span><b className="text-slate-800">{selectedProduct.mfg_date}</b></div>
                  )}
                </div>
                <p className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-1 ${showFullDetails ? '' : 'line-clamp-2'}`}>
                  {selectedProduct.description}
                </p>
                <button 
                  onClick={() => setShowFullDetails(!showFullDetails)} 
                  className="text-red-700 text-xs font-black flex items-center gap-0.5 mt-1 self-start"
                >
                  {showFullDetails ? <>See less <ChevronUp size={13} /></> : <>See more <ChevronDown size={13} /></>}
                </button>
              </div>

              {/* ESTIMATED DELIVERY BADGE */}
              <div className="mt-3 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-600 text-white rounded-xl"><Truck size={16} /></span>
                  <div>
                    <p className="font-bold text-slate-800">Estimated Delivery</p>
                    <p className="text-[11px] text-emerald-700 font-black">⚡ By {getCustomerDeliveryDate(selectedProduct.delivery_days || 2)} ({selectedProduct.delivery_days || 2} Din Mein)</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-lg">Fast Dispatch</span>
              </div>

              {/* RULES */}
              <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2 text-xs">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Store Rules</p>
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold"><Clock size={14} className="text-amber-600" /><span>Cancellation:</span></div>
                  {Number(selectedProduct.cancel_hours || 0) > 0 ? (
                    <span className="font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">Within {selectedProduct.cancel_hours} Hours</span>
                  ) : (
                    <span className="font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px]">Not Allowed</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold"><RefreshCw size={14} className="text-emerald-600" /><span>Return / Replace:</span></div>
                  {Number(selectedProduct.return_days || 0) > 0 ? (
                    <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">Within {selectedProduct.return_days} Days</span>
                  ) : (
                    <span className="font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px]">Not Allowed</span>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50/50 rounded-2xl border border-red-100 flex items-baseline justify-between">
                <div>
                  <span className="font-black text-2xl text-red-700">₹{selectedProduct.price}</span>
                  {selectedProduct.mrp > selectedProduct.price && <span className="text-sm text-slate-400 line-through ml-2">₹{selectedProduct.mrp}</span>}
                </div>
                <span className="text-xs font-bold text-emerald-700">Free COD Available</span>
              </div>

              <div className="flex gap-2.5 mt-4">
                <button onClick={() => handleAddToCart(selectedProduct)} className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs rounded-xl active:scale-95 transition">Add to Cart</button>
                <button onClick={() => handleInitiateBuyNow(selectedProduct)} className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl active:scale-95 shadow-lg transition">Buy Now</button>
              </div>
            </div>
          </div>
        )}
                {/* HOME SCREEN WITH CIRCULAR SPINNER */}
        {activeTab === 'home' && (
          <div>
            <div className="mb-3 p-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/20 rounded-xl"><Truck size={14} className="text-white" /></span>
                <div>
                  <p className="text-[11px] font-black leading-tight">Fast Rural Delivery</p>
                  <p className="text-[9px] text-red-100">Doorstep delivery to active blocks</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-lg shadow">Free COD</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={"px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition shadow-sm " + (selectedCategory === c ? 'bg-red-700 text-white shadow-red-700/20' : 'bg-white text-slate-700 border border-slate-200')}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {loading ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-28 gap-3">
                  <div className="w-10 h-10 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-400 tracking-wide">Products load ho rahe hain...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-xs text-slate-400 font-bold bg-white rounded-2xl p-6 border border-dashed border-slate-300">
                  Koi product uplabdh nahi hai.
                </div>
              ) : (
                filteredProducts.map(p => {
                  const minQ = getMinQty(p);
                  const discountPercent = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group">
                      <div className="relative cursor-pointer overflow-hidden bg-slate-50" onClick={() => { setSelectedProduct(p); setActiveImageIndex(0); setSelectedSize(p.sizes?.[0] || ''); setSelectedColor(p.colors?.[0] || ''); navigateTo('product-detail'); }}>
                        <img src={p.images?.[0] || 'https://via.placeholder.com/200'} alt={p.title} className="w-full h-36 object-contain bg-slate-100 group-hover:scale-105 transition duration-300" />
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            {discountPercent}% OFF
                          </span>
                        )}
                        {minQ > 1 && (
                          <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Min {minQ} Items
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
                        <div onClick={() => { setSelectedProduct(p); setActiveImageIndex(0); setSelectedSize(p.sizes?.[0] || ''); setSelectedColor(p.colors?.[0] || ''); navigateTo('product-detail'); }} className="cursor-pointer">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{p.title}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
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

        {/* WISHLIST SCREEN */}
        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Heart size={16} className="text-red-600 fill-red-600" /> Wishlist ({wishlist.length})</h2>
            {wishlist.length === 0 ? (
              <p className="text-center py-20 text-xs font-bold text-slate-400">Wishlist mein koi product nahi hai.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border p-2.5 shadow-sm relative flex flex-col justify-between">
                    <button 
                      onClick={() => handleUnlistWishlist(p.id)}
                      className="absolute top-2 right-2 p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full shadow-xs transition"
                      title="Wishlist se unlist karein"
                    >
                      <Trash2 size={13} />
                    </button>
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

        {/* CART SCREEN */}
        {activeTab === 'cart' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><ShoppingCart size={16} className="text-red-700" /> Aapka Cart ({cart.length})</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                <ShoppingCart size={40} className="mx-auto text-slate-300 mb-2" /><p className="text-xs font-bold text-slate-400">Aapka cart khaali hai</p>
                <button onClick={() => navigateTo('home')} className="mt-4 px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl shadow-md">Shopping Shuru Karein</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item, idx) => {
                  const minQ = getMinQty(item);
                  return (
                    <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <img src={item.images?.[0]} className="w-16 h-16 rounded-xl object-contain bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                        <p className="text-[11px] text-slate-500">{item.size ? `Size: ${item.size} | ` : ''}₹{item.price} each</p>
                        {minQ > 1 && <p className="text-[10px] text-red-600 font-bold">Min requirement: {minQ} items</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateCartQty(item.id, item.size, -1)} className="p-1 bg-slate-100 rounded-md"><Minus size={12} /></button>
                          <span className="text-xs font-black text-slate-800">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, item.size, 1)} className="p-1 bg-slate-100 rounded-md"><Plus size={12} /></button>
                        </div>
                      </div>
                      <button onClick={() => updateCartQty(item.id, item.size, -item.quantity)} className="text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
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

        {/* ORDERS SCREEN WITH TIMELINE OPENER */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"><Package size={16} className="text-red-700" /> Mere Orders</h2>
            {!currentUser ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border"><p className="text-xs font-bold text-slate-400">Orders dekhne ke liye pehle Login karein.</p></div>
            ) : myOrders.filter(o => o.id && o.customer_phone).length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                <Package size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">Aapka koi purana order nahi hai.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myOrders.filter(o => o.id && o.customer_phone).map((o) => {
                  const formattedDate = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently Placed';
                  const orderItems = Array.isArray(o.items) ? o.items : [];
                  const firstItem = orderItems[0] || {};
                  
                  const allowedCancelHours = Number(firstItem.cancel_hours ?? 12);
                  const allowedReturnDays = Number(firstItem.return_days ?? 7);

                  const orderCreatedAt = new Date(o.created_at).getTime();
                  const hoursPassed = (Date.now() - orderCreatedAt) / (1000 * 60 * 60);
                  const isCancelable = (o.status === 'Order Placed') && (allowedCancelHours > 0) && (hoursPassed <= allowedCancelHours);

                  const deliveredAt = o.status_time ? new Date(o.status_time).getTime() : orderCreatedAt;
                  const daysPassedSinceDelivery = (Date.now() - deliveredAt) / (1000 * 60 * 60 * 24);
                  const isReturnable = (o.status === 'Delivered') && (allowedReturnDays > 0) && (daysPassedSinceDelivery <= allowedReturnDays);

                  return (
                    <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-2.5 cursor-pointer" onClick={() => setActiveOrderDetail(o)}>
                      <div className="flex justify-between items-start border-b pb-2">
                        <div>
                          <span className="font-black text-xs text-red-700">#{o.id}</span>
                          <p className="text-[10px] text-slate-400">{formattedDate}</p>
                        </div>
                        <span className={"text-[10px] font-black px-2.5 py-1 rounded-full " + (
                          o.status === 'Cancel Approved' || o.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                          o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          o.status && o.status.includes('Requested') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        )}>
                          {o.status || 'Order Placed'}
                        </span>
                      </div>
                      
                      <div className="py-1 flex flex-col gap-2">
                        {orderItems.map((it, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <img 
                              src={it.images?.[0] || 'https://via.placeholder.com/80'} 
                              alt={it.title} 
                              onClick={(e) => { e.stopPropagation(); setSelectedItemPhoto(it.images?.[0] || 'https://via.placeholder.com/80'); }}
                              className="w-12 h-12 rounded-lg object-contain bg-white cursor-pointer hover:scale-105 active:scale-95 transition" 
                              title="Badi photo dekhne ke liye tap karein"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate">{it.title}</h5>
                              <p className="text-[10px] text-slate-500">{it.size ? `Size: ${it.size} | ` : ''}Qty: {it.quantity || 1}</p>
                            </div>
                            <span className="font-black text-xs text-slate-900">₹{it.price * (it.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-2 flex justify-between text-[11px] text-slate-600">
                        <span>COD Due: <b>₹{o.total_price || 0}</b></span>
                        <span className="text-red-700 font-bold flex items-center gap-1">Tap for live tracking <RightIcon size={12} /></span>
                      </div>

                      <div className="pt-2 border-t flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {isCancelable ? (
                            <button
                              onClick={() => handleCancelOrder(o.id)}
                              className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition"
                            >
                              <XCircle size={13} /> Cancel ({Math.ceil(allowedCancelHours - hoursPassed)}h left)
                            </button>
                          ) : (
                            o.status === 'Order Placed' && allowedCancelHours === 0 && (
                              <span className="text-[10px] text-slate-400 font-bold italic py-1">⚠️ Cancellation not allowed</span>
                            )
                          )}

                          {isReturnable && !(o.status && o.status.includes('Requested')) ? (
                            <button
                              onClick={() => { setSelectedOrderForAction(o); setActionType('return'); }}
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition"
                            >
                              <RefreshCw size={13} /> Return ({Math.ceil(allowedReturnDays - daysPassedSinceDelivery)}d left)
                            </button>
                          ) : (
                            o.status === 'Delivered' && allowedReturnDays === 0 && (
                              <span className="text-[10px] text-slate-400 font-bold italic py-1">⚠️ Return not allowed</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB WITH DYNAMIC ADDRESS AND CROP */}
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
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoSelect} />
                    </label>
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-600">📞 {currentUser.phone}</p>
                    <p className="text-xs text-red-700 font-bold mt-0.5">🏡 {currentUser.villageHouse || currentUser.village || 'Address pending in profile'}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5"><MapPin size={13} className="text-red-700" /> Saved Delivery Address</span>
                    <button onClick={() => setIsEditingAddress(!isEditingAddress)} className="text-red-700 font-bold text-[11px] flex items-center gap-1">
                      <Edit3 size={12} /> {isEditingAddress ? 'Cancel' : 'Edit Address'}
                                          </button>
                  </div>

                  {isEditingAddress ? (
                    <form onSubmit={handleSaveProfileAddress} className="flex flex-col gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Village / House No. / Landmark *" 
                        value={addressForm.villageHouse} 
                        onChange={e => setAddressForm({ ...addressForm, villageHouse: e.target.value })} 
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-white" 
                      />

                      <input 
                        type="text" 
                        placeholder="Ward No. / Road Name *" 
                        value={addressForm.wardRoad} 
                        onChange={e => setAddressForm({ ...addressForm, wardRoad: e.target.value })} 
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-white" 
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={addressForm.district} 
                          onChange={e => setAddressForm({ ...addressForm, district: e.target.value, block: '' })} 
                          className="w-full px-2.5 py-2 text-xs border rounded-xl bg-white font-medium" 
                        >
                          <option value="">-- District (जिला) * --</option>
                          {allowedDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                        </select>

                        <select 
                          value={addressForm.block} 
                          disabled={!addressForm.district}
                          onChange={e => setAddressForm({ ...addressForm, block: e.target.value })} 
                          className="w-full px-2.5 py-2 text-xs border rounded-xl bg-white font-medium" 
                        >
                          <option value="">-- Block (प्रखंड) * --</option>
                          {allowedBlocksForDistrict(addressForm.district).map((b, i) => <option key={i} value={b}>{b}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Panchayat" 
                          value={addressForm.panchayat} 
                          onChange={e => setAddressForm({ ...addressForm, panchayat: e.target.value })} 
                          className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white" 
                        />
                        <input 
                          type="tel" 
                          maxLength={6}
                          placeholder="PIN Code *" 
                          value={addressForm.pincode} 
                          onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })} 
                          className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white font-mono" 
                        />
                      </div>

                      <button type="submit" className="py-2.5 bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm mt-1">Save Address</button>
                    </form>
                  ) : (
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {currentUser.villageHouse || currentUser.village ? (
                        <>
                          <p><b>Address:</b> <span className="text-red-700 font-bold">{currentUser.villageHouse || currentUser.village}</span>, {currentUser.wardRoad || currentUser.wardNo}</p>
                          <p><b>District & Block:</b> {currentUser.district || 'N/A'} - {currentUser.block || 'N/A'}</p>
                          <p><b>Panchayat & PIN:</b> {currentUser.panchayat || 'N/A'} - {currentUser.pincode || 'N/A'}</p>
                        </>
                      ) : (
                        <p className="text-red-600 font-medium">Koi address save nahi hai. "Edit Address" par tap karke apna address bharein.</p>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={handleLogout} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition">
                  <LogOut size={14} /> Khata Logout Karein
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4">Fast delivery ke liye apna mobile number verify karein.</p>
                <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="w-full py-2.5 bg-red-700 text-white font-bold text-xs rounded-xl shadow-md">
                  Login / Register via 4-Digit BPIN
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CHECKOUT SCREEN WITH LIVE DELIVERY BLOCK WARNING */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="font-black text-sm text-slate-900">Order Delivery Details</h3>
              <button onClick={goBack} className="text-slate-400 font-black text-sm">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              {!isCustomerAddressDeliverable() && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2 text-rose-800 text-xs">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Delivery Not Available!</p>
                    <p className="text-[11px] mt-0.5">Is address ({currentUser?.block || 'Current Block'} block) par delivery abhi uplabdh nahi hai. Kripya profile me jakar address change karein.</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-slate-900 mb-2">Order Items Breakdown:</p>
                {getCheckoutItems().map((it, idx) => {
                  const minQ = getMinQty(it);
                  return (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-red-100 last:border-none">
                      <div>
                        <span className="font-bold text-slate-800">{it.title}</span>
                        <p className="text-[10px] text-slate-500">{it.size ? `Size: ${it.size} | ` : ''}1 Item: ₹{it.price} | Qty: {it.quantity || minQ}</p>
                      </div>
                      <span className="font-black text-red-700">₹{it.price * (it.quantity || minQ)}</span>
                    </div>
                  );
                })}
              </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-slate-900">Delivery Address (Locked):</span>
                  <button onClick={() => { setIsCheckoutOpen(false); navigateTo('profile'); }} className="text-red-700 text-[10px] font-bold underline">Change in Profile</button>
                </div>
                {currentUser?.villageHouse || currentUser?.village ? (
                  <div className="text-slate-800 leading-relaxed font-medium">
                    <p><b>Name:</b> {currentUser.name} (📞 {currentUser.phone})</p>
                    <p><b>Address:</b> {currentUser.villageHouse || currentUser.village}, <b>Ward/Road:</b> {currentUser.wardRoad || currentUser.wardNo}</p>
                    <p><b>Block:</b> {currentUser.block}, <b>Dist:</b> {currentUser.district} - {currentUser.pincode}</p>
                  </div>
                ) : (
                  <p className="text-red-600 font-bold">Kripya Profile mein jakar pehle Address aur Block bharein!</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alternative Mobile (Optional):</label>
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
                    {locLoading ? "Detecting Live Location..." : "Allow Location"}
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

                    <p className="text-[10px] text-slate-500 mb-2">Ya QR code scan karein:</p>
                    <img 
                      src={"https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=" + encodeURIComponent(upiPayUrl)} 
                      alt="UPI QR" 
                      className="mx-auto w-32 h-32 rounded-lg border p-1 bg-white" 
                    />

                    <label className="block mt-3 text-xs font-bold text-red-700 border-2 border-dashed border-red-300 bg-red-50/50 rounded-xl py-2.5 cursor-pointer">
                      {paymentScreenshot ? "✓ Payment Screenshot Attached" : "Upload Payment Screenshot *"}
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
                disabled={isSubmittingOrder || !isCustomerAddressDeliverable()} 
                className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg transition ${!isCustomerAddressDeliverable() ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'}`}
              >
                {isSubmittingOrder ? "Confirming Order..." : !isCustomerAddressDeliverable() ? "Delivery Blocked in This Area" : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM FIXED NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2.5 z-40">
        <button 
          onClick={() => navigateTo('home')} 
          className={"flex flex-col items-center gap-0.5 " + (activeTab === 'home' || activeTab === 'product-detail' ? 'text-red-700 font-bold' : 'text-slate-400')}
        >
          <ShoppingBag size={18} />
          <span className="text-[10px]">Home</span>
        </button>

        <button 
          onClick={() => { if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); } else navigateTo('wishlist'); }} 
          className={"flex flex-col items-center gap-0.5 " + (activeTab === 'wishlist' ? 'text-red-700 font-bold' : 'text-slate-400')}
        >
          <Heart size={18} />
          <span className="text-[10px]">Wishlist</span>
        </button>

        <button 
          onClick={() => { if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); } else navigateTo('cart'); }} 
          className={"flex flex-col items-center gap-0.5 relative " + (activeTab === 'cart' ? 'text-red-700 font-bold' : 'text-slate-400')}
        >
          <ShoppingCart size={18} />
          {cart.length > 0 && <span className="absolute -top-1 right-2 bg-yellow-400 text-slate-900 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          <span className="text-[10px]">Cart</span>
        </button>

        <button 
          onClick={() => { if (!currentUser) { setAuthMode('login'); setIsAuthOpen(true); } else navigateTo('orders'); }} 
          className={"flex flex-col items-center gap-0.5 " + (activeTab === 'orders' ? 'text-red-700 font-bold' : 'text-slate-400')}
        >
          <Package size={18} />
          <span className="text-[10px]">Orders</span>
        </button>

        <button 
          onClick={() => navigateTo('profile')} 
          className={"flex flex-col items-center gap-0.5 " + (activeTab === 'profile' ? 'text-red-700 font-bold' : 'text-slate-400')}
        >
          <User size={18} />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
                      }
                    
                
        
        
  
  
  
               
  
  
  
      
  
  
  
