
import { User, Product, Order, Transaction, OrderStatus, Review, AdTier } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

// --- Mock Data ---

// Passwords are hardcoded as "password123" for existing mock users for demo purposes
const INITIAL_USERS: (User & { password?: string })[] = [
  { id: 'u1', name: 'Tola Student', email: 'tola@ui.edu.ng', password: 'password123', phoneNumber: '08123456789', role: 'buyer', isStudent: true, matricNumber: '213456', isBanned: false, walletBalance: 50000, referralCode: 'TOLA123', referralsCount: 0, securityAlerts: 0 },
  { id: 'u2', name: 'Iya Moria', email: 'moria@ui.edu.ng', password: 'password123', phoneNumber: '08098765432', role: 'seller', isStudent: false, nin: '12345678901', isBanned: false, walletBalance: 15000, referralCode: 'MORIA99', referralsCount: 15, securityAlerts: 0 },
  { id: 'u3', name: 'System Admin', email: 'admin@ui.edu.ng', password: 'admin', phoneNumber: '00000000000', role: 'admin', isStudent: false, isBanned: false, walletBalance: 0, referralCode: 'ADMIN00', referralsCount: 0, securityAlerts: 0 },
  { id: 'u4', name: 'Bad Guy', email: 'fraud@yahoo.com', password: 'password123', phoneNumber: '09011112222', role: 'seller', isStudent: false, nin: '11111111111', isBanned: true, walletBalance: 0, referralCode: 'FAKE111', referralsCount: 0, securityAlerts: 5 },
];

const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', productId: '5', userId: 'u1', userName: 'Tola Student', rating: 5, comment: 'The suya was extremely spicy, just how I like it!', date: Date.now() - 100000, verifiedPurchase: true },
  { id: 'r2', productId: '2', userId: 'u1', userName: 'Tola Student', rating: 4, comment: 'Good book, but pages were a bit thin.', date: Date.now() - 200000, verifiedPurchase: true },
];

const INITIAL_AD_TIERS: AdTier[] = [
  { id: 'bronze', name: 'Bronze Plan', price: 1000, durationDays: 1, features: ['Standard Visibility', 'Search Boost'] },
  { id: 'silver', name: 'Silver Plan', price: 5000, durationDays: 7, features: ['Homepage Feature', 'Top of Search', 'Email Newsletter'] },
  { id: 'gold', name: 'Gold Plan', price: 20000, durationDays: 30, features: ['Hero Banner', 'Push Notification', 'All Silver Features'] },
];

const ENRICHED_PRODUCTS = INITIAL_PRODUCTS.map(p => ({
  ...p,
  sellerId: 'u2'
}));

// --- State Storage ---
let users = [...INITIAL_USERS];
let products = [...ENRICHED_PRODUCTS];
let orders: Order[] = [];
let transactions: Transaction[] = [];
let reviews: Review[] = [...INITIAL_REVIEWS];
let adTiers: AdTier[] = [...INITIAL_AD_TIERS];
let securityLogs: string[] = [];

// --- Security State ---
const RATE_LIMITS: Record<string, number> = {}; 
const RATE_LIMIT_WINDOW = 60000; 
const MAX_REQUESTS = 20; 

// --- Security Helper Functions ---

const logSecurityEvent = (message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${severity}] ${timestamp}: ${message}`;
  // Keep logs limited to prevent memory bloat
  if (securityLogs.length > 200) securityLogs.pop();
  securityLogs.unshift(entry);
};

const sanitize = (input: string) => {
  if (!input) return "";
  if (typeof input !== 'string') return String(input);

  // 1. Check for malicious patterns (SQL Injection, Script Tags)
  const threats = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/gmi,
    /javascript:/gmi,
    /on\w+\s*=/gmi, // onclick, onload, etc.
    /union\s+select/gmi,
    /drop\s+table/gmi,
    /alert\(/gmi
  ];

  for (const pattern of threats) {
    if (pattern.test(input)) {
      logSecurityEvent(`Malicious input blocked: ${input.substring(0, 15)}...`, 'CRITICAL');
      throw new Error("Security Violation: Request blocked due to malicious payload.");
    }
  }

  // 2. Escape HTML entities to prevent rendering
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const checkRateLimit = (userId: string = 'ip_address') => {
  if (!RATE_LIMITS[userId]) RATE_LIMITS[userId] = 0;
  RATE_LIMITS[userId]++;
  
  // Reset after window
  setTimeout(() => { RATE_LIMITS[userId]--; }, RATE_LIMIT_WINDOW);

  if (RATE_LIMITS[userId] > MAX_REQUESTS) {
    logSecurityEvent(`Rate limit exceeded for: ${userId}`, 'MEDIUM');
    throw new Error("Too many requests. Please slow down.");
  }
};

const validateAmount = (amount: any) => {
  const num = parseFloat(amount);
  if (isNaN(num) || !isFinite(num)) throw new Error("Invalid number format.");
  if (num < 0) throw new Error("Amount cannot be negative.");
  if (num > 10000000) throw new Error("Amount exceeds transaction limit (₦10m)."); 
  return Math.floor(num * 100) / 100; // Round to 2 decimal places
};

// --- Service Methods ---

export const MockBackend = {
  // --- Auth & User ---
  
  // Simulated AI Image Forensics
  verifyImageRealness: async (base64Image: string): Promise<boolean> => {
     // This simulates a heavy backend AI process
     // In a real app, this would send the image to a Python service running ResNet or similar
     
     return new Promise((resolve) => {
         setTimeout(() => {
             // Heuristic: Check if the base64 string is suspiciously short or empty
             if (!base64Image || base64Image.length < 1000) {
                 resolve(false);
                 return;
             }
             // For mock purposes, we assume checks pass if image is provided
             resolve(true);
         }, 3000); // 3 second processing delay for "Realism"
     });
  },

  login: async (email: string, password?: string): Promise<User | null> => {
    checkRateLimit(email);
    const safeEmail = sanitize(email);
    
    // Simulate DB Lookup
    const user = users.find(u => u.email === safeEmail);
    
    // In a real app, use bcrypt.compare here
    if (user && password && user.password !== password) {
         logSecurityEvent(`Failed login attempt for ${safeEmail}`, 'LOW');
         throw new Error("Invalid credentials");
    }

    if (user?.isBanned) {
      logSecurityEvent(`Banned user login blocked: ${safeEmail}`, 'MEDIUM');
      throw new Error("Account suspended due to policy violation. Contact Admin.");
    }
    
    if (user) {
        // Update last active
        users = users.map(u => u.id === user.id ? { ...u, lastActive: Date.now() } : u);
        
        // Return user without password
        const { password: _, ...safeUser } = user;
        return safeUser;
    }

    return null;
  },

  register: async (
    name: string, 
    email: string, 
    password: string,
    phoneNumber: string,
    role: 'buyer' | 'seller', 
    isStudent: boolean,
    idNumber: string, // Matric or NIN
    referralCode?: string,
    profileImage?: string
  ): Promise<User> => {
    checkRateLimit('registration');
    const safeName = sanitize(name);
    const safeEmail = sanitize(email);
    const safePhone = sanitize(phoneNumber);
    const safeId = sanitize(idNumber);
    const safeRef = referralCode ? sanitize(referralCode) : undefined;
    
    if (!safeEmail.includes('@') || safeEmail.length < 5) throw new Error("Invalid email format");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    if (users.find(u => u.email === safeEmail)) throw new Error("Email already registered.");
    
    // Identity Validation
    let matricNumber, nin;
    if (isStudent) {
        // UI Matric numbers are typically numeric. Length check.
        if (!/^\d{5,7}$/.test(safeId)) throw new Error("Invalid Matric Number (Must be 5-7 digits)");
        matricNumber = safeId;
    } else {
        // NIN must be 11 digits
        if (!/^\d{11}$/.test(safeId)) throw new Error("NIN must be exactly 11 digits");
        nin = safeId;
    }

    // Referral Logic
    let referredBy = undefined;
    if (safeRef) {
      const referrer = users.find(u => u.referralCode === safeRef);
      if (referrer) {
        referredBy = referrer.id;
        // Update referrer count
        users = users.map(u => {
            if (u.id === referrer.id) {
                return { ...u, referralsCount: u.referralsCount + 1 };
            }
            return u;
        });
        // Bonus Transaction
        transactions.push({
            id: `tx_ref_${Date.now()}`,
            userId: referrer.id,
            type: 'REFERRAL_BONUS',
            amount: 500,
            date: Date.now(),
            description: `Referral Bonus: ${safeName}`
        });
      }
    }

    const newUser: User & { password?: string } = {
      id: `u_${Date.now()}`,
      name: safeName,
      email: safeEmail,
      phoneNumber: safePhone,
      password, 
      role,
      isStudent,
      matricNumber,
      nin,
      isBanned: false,
      walletBalance: 0,
      referralCode: (safeName.substring(0,3) + Math.floor(Math.random()*10000)).toUpperCase(),
      referralsCount: 0,
      securityAlerts: 0,
      referredBy,
      profileImage // Save profile image
    };

    users.push(newUser);
    logSecurityEvent(`New User Registered: ${safeEmail} (${role})`, 'LOW');
    
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  getAllUsers: () => users.map(({password, ...u}) => u), 

  banUser: (userId: string) => {
    checkRateLimit('admin_action');
    users = users.map(u => u.id === userId ? { ...u, isBanned: true } : u);
    logSecurityEvent(`User Banned by Admin: ${userId}`, 'HIGH');
  },

  unbanUser: (userId: string) => {
    checkRateLimit('admin_action');
    users = users.map(u => u.id === userId ? { ...u, isBanned: false } : u);
    logSecurityEvent(`User Unbanned by Admin: ${userId}`, 'MEDIUM');
  },

  // --- Wallet ---
  
  topUpWallet: (userId: string, amount: number) => {
    checkRateLimit(userId);
    const safeAmount = validateAmount(amount);
    
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    // SECURITY: Strictly prohibit sellers from topping up
    if (user.role !== 'buyer') {
        logSecurityEvent(`Illegal TopUp attempt by Non-Buyer: ${userId}`, 'HIGH');
        throw new Error("Unauthorized: Only Buyers can top up wallets.");
    }

    users = users.map(u => {
        if (u.id === userId) return { ...u, walletBalance: u.walletBalance + safeAmount };
        return u;
    });
    
    transactions.push({
        id: `tx_${Date.now()}`,
        userId,
        type: 'DEPOSIT',
        amount: safeAmount,
        date: Date.now(),
        description: 'Wallet Top Up'
    });
  },

  withdrawFunds: (userId: string, amount: number) => {
    checkRateLimit(userId);
    const safeAmount = validateAmount(amount);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    if (user.walletBalance < safeAmount) {
        throw new Error("Insufficient funds for withdrawal.");
    }

    users = users.map(u => {
        if (u.id === userId) return { ...u, walletBalance: u.walletBalance - safeAmount };
        return u;
    });

    transactions.push({
        id: `tx_${Date.now()}_wd`,
        userId,
        type: 'WITHDRAWAL',
        amount: -safeAmount,
        date: Date.now(),
        description: 'Withdrawal to Bank Account'
    });
    
    logSecurityEvent(`User ${userId} withdrew ₦${safeAmount}`, 'LOW');
  },

  getWalletBalance: (userId: string) => {
    return users.find(u => u.id === userId)?.walletBalance || 0;
  },

  // --- Products & Reviews ---

  getProducts: () => products.filter(p => {
    const seller = users.find(u => u.id === p.sellerId);
    return !seller?.isBanned; 
  }),

  getProductReviews: (productId: string) => reviews.filter(r => r.productId === productId),

  submitReview: (productId: string, userId: string, rating: number, comment: string) => {
    checkRateLimit(userId);
    const safeComment = sanitize(comment);
    
    if (rating < 1 || rating > 5) throw new Error("Invalid rating value.");

    const user = users.find(u => u.id === userId);
    
    // Verify purchase
    const hasBought = orders.some(o => 
        o.buyerId === userId && 
        o.status === 'COMPLETED' && 
        o.items.some(i => i.id === productId)
    );

    if (!hasBought) {
        logSecurityEvent(`Review rejected (Not verified): ${userId} on ${productId}`, 'MEDIUM');
        throw new Error("Verified purchase required to leave a review.");
    }

    const newReview: Review = {
        id: `rev_${Date.now()}`,
        productId,
        userId,
        userName: user?.name || 'Anonymous',
        rating,
        comment: safeComment,
        date: Date.now(),
        verifiedPurchase: true
    };
    reviews.push(newReview);
    
    // Update product rating
    const productReviews = reviews.filter(r => r.productId === productId);
    const avg = productReviews.reduce((acc, curr) => acc + curr.rating, 0) / productReviews.length;
    
    products = products.map(p => p.id === productId ? { ...p, rating: parseFloat(avg.toFixed(1)) } : p);
  },

  // --- Ads & Admin ---
  
  getAdTiers: () => adTiers,

  updateAdTier: (id: string, price: number) => {
    checkRateLimit('admin_action');
    const safePrice = validateAmount(price);
    
    adTiers = adTiers.map(t => t.id === id ? { ...t, price: safePrice } : t);
    logSecurityEvent(`Ad Tier '${id}' price updated to ₦${safePrice}`, 'MEDIUM');
  },

  getSecurityLogs: () => [...securityLogs], // Return copy
  
  clearSecurityLogs: () => {
    securityLogs = [];
  },

  // --- Orders & Escrow ---

  createOrder: async (buyerId: string, items: any[], total: number) => {
    checkRateLimit(buyerId);
    const buyer = users.find(u => u.id === buyerId);
    if (!buyer) throw new Error("Buyer not found");
    if (buyer.isBanned) throw new Error("Account suspended. Order rejected.");

    const serverCalculatedTotal = items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        if (!product) throw new Error("Invalid product in cart");
        if (!product.inStock) throw new Error(`Product ${product.name} is out of stock`);
        return sum + (product.price * item.quantity);
    }, 0);
    
    if (Math.abs(serverCalculatedTotal + 500 - total) > 5) {
         logSecurityEvent(`Price Tampering Attempt: ${buyerId}`, 'CRITICAL');
         throw new Error("Order validation failed. Price mismatch detected.");
    }

    const sellerId = items[0].sellerId; 

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      buyerId,
      sellerId,
      items,
      totalAmount: total,
      status: 'PAID_ESCROW',
      createdAt: Date.now(),
    };

    orders.push(newOrder);

    // Deduct funds logic could go here if paying from wallet directly, 
    // but assuming payment gateway for now.
    
    transactions.push({
      id: `tx_ord_${newOrder.id}`,
      userId: buyerId,
      type: 'PAYMENT',
      amount: -total,
      date: Date.now(),
      description: `Payment for Order #${newOrder.id}`
    });

    logSecurityEvent(`Order Created #${newOrder.id} - Escrow Active`, 'LOW');
    return newOrder;
  },

  getOrdersForUser: (userId: string) => {
    return orders.filter(o => o.buyerId === userId || o.sellerId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  confirmDeliverySent: (orderId: string) => {
    orders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'SELLER_CONFIRMED', sellerConfirmedAt: Date.now() };
      }
      return o;
    });
  },

  confirmOrderReceived: (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'SELLER_CONFIRMED') return;

    users = users.map(u => {
      if (u.id === order.sellerId) {
        return { ...u, walletBalance: u.walletBalance + order.totalAmount };
      }
      return u;
    });

    transactions.push({
      id: `tx_escrow_${Date.now()}`,
      userId: order.sellerId,
      type: 'ESCROW_RELEASE',
      amount: order.totalAmount,
      date: Date.now(),
      description: `Escrow Released: Order #${order.id}`
    });

    orders = orders.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o);
    logSecurityEvent(`Escrow Released for Order #${orderId}`, 'LOW');
  },

  refundOrder: (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (order.status === 'COMPLETED' || order.status === 'REFUNDED') {
        throw new Error("Cannot refund a completed or already refunded order.");
    }

    // Refund logic (assuming money is coming back from escrow holding)
    users = users.map(u => {
      if (u.id === order.buyerId) {
        return { ...u, walletBalance: u.walletBalance + order.totalAmount };
      }
      return u;
    });

    transactions.push({
      id: `tx_refund_${Date.now()}`,
      userId: order.buyerId,
      type: 'REFUND',
      amount: order.totalAmount,
      date: Date.now(),
      description: `Refund: #${order.id} - ${reason}`
    });

    orders = orders.map(o => o.id === orderId ? { ...o, status: 'REFUNDED' } : o);
    logSecurityEvent(`Order #${orderId} Refunded: ${reason}`, 'MEDIUM');
  },

  getUserTransactions: (userId: string) => {
    return transactions.filter(t => t.userId === userId).sort((a, b) => b.date - a.date);
  }
};
