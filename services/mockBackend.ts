
import { User, Product, Order, Transaction, OrderStatus, Review, AdTier, Notification, BanDetails, Category, SecurityLogEntry } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

// --- Mock Data ---

// Passwords are hardcoded as "password123" for existing mock users for demo purposes
const INITIAL_USERS: (User & { password?: string })[] = [
  { id: 'u1', name: 'Tola Student', email: 'tola@ui.edu.ng', password: 'password123', phoneNumber: '08123456789', role: 'buyer', isStudent: true, matricNumber: '213456', isBanned: false, walletBalance: 50000, referralCode: 'TOLA123', referralsCount: 0, securityAlerts: 0, wishlist: [], notifications: [] },
  { id: 'u2', name: 'Iya Moria', email: 'moria@ui.edu.ng', password: 'password123', phoneNumber: '08098765432', role: 'seller', isStudent: false, nin: '12345678901', isBanned: false, walletBalance: 15000, referralCode: 'MORIA99', referralsCount: 15, securityAlerts: 0, wishlist: [], notifications: [] },
  { id: 'u3', name: 'System Admin', email: 'admin@ui.edu.ng', password: 'admin', phoneNumber: '00000000000', role: 'admin', isStudent: false, isBanned: false, walletBalance: 0, referralCode: 'ADMIN00', referralsCount: 0, securityAlerts: 0, wishlist: [], notifications: [] },
  { id: 'u4', name: 'Bad Guy', email: 'fraud@yahoo.com', password: 'password123', phoneNumber: '09011112222', role: 'seller', isStudent: false, nin: '11111111111', isBanned: true, banDetails: { type: 'temporary', reason: 'Suspicious Activity', bannedAt: Date.now() }, walletBalance: 0, referralCode: 'FAKE111', referralsCount: 0, securityAlerts: 5, wishlist: [], notifications: [] },
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
let securityLogs: SecurityLogEntry[] = [];

// --- Security State ---
const RATE_LIMITS: Record<string, number> = {}; 
const RATE_LIMIT_WINDOW = 60000; 
const MAX_REQUESTS = 50; 

// --- Helper Functions ---

const logSecurityEvent = (message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
  const entry: SecurityLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: severity,
      message
  };
  
  securityLogs.push(entry);
  if (securityLogs.length > 200) securityLogs.shift(); // Remove oldest
};

const sanitize = (input: string) => {
  if (!input) return "";
  if (typeof input !== 'string') return String(input);
  const threats = [/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, /javascript:/gmi, /on\w+\s*=/gmi];
  for (const pattern of threats) {
    if (pattern.test(input)) {
      logSecurityEvent(`Malicious input blocked: ${input.substring(0, 15)}...`, 'CRITICAL');
      throw new Error("Security Violation.");
    }
  }
  return input.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m));
};

const checkRateLimit = (userId: string = 'ip_address') => {
  if (!RATE_LIMITS[userId]) RATE_LIMITS[userId] = 0;
  RATE_LIMITS[userId]++;
  setTimeout(() => { RATE_LIMITS[userId]--; }, RATE_LIMIT_WINDOW);
  if (RATE_LIMITS[userId] > MAX_REQUESTS) throw new Error("Too many requests.");
};

const addNotification = (userId: string, message: string, type: Notification['type'] = 'info') => {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random()}`,
      userId,
      message,
      type,
      isRead: false,
      date: Date.now()
    });
  }
};

// --- Service Methods ---

export const MockBackend = {
  // --- Auth & User ---
  
  verifyImageRealness: async (base64Image: string): Promise<boolean> => {
     return new Promise((resolve) => {
         setTimeout(() => {
             if (!base64Image || base64Image.length < 1000) { resolve(false); return; }
             resolve(true);
         }, 2000); 
     });
  },

  login: async (email: string, password?: string): Promise<User | null> => {
    checkRateLimit(email);
    const safeEmail = sanitize(email);
    const user = users.find(u => u.email === safeEmail);
    
    if (user && password && user.password !== password) {
         logSecurityEvent(`Failed login attempt for ${safeEmail}`, 'LOW');
         throw new Error("Invalid credentials");
    }

    if (user?.isBanned) {
      if (user.banDetails?.type === 'permanent' && user.banDetails.scheduledDeletionAt) {
          const daysLeft = Math.ceil((user.banDetails.scheduledDeletionAt - Date.now()) / (1000 * 60 * 60 * 24));
          throw new Error(`Account permanently banned. Deletion in ${daysLeft} days.`);
      }
      throw new Error(`Account suspended: ${user.banDetails?.reason || 'Policy Violation'}`);
    }
    
    if (user) {
        users = users.map(u => u.id === user.id ? { ...u, lastActive: Date.now() } : u);
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    return null;
  },

  register: async (name: string, email: string, password: string, phoneNumber: string, role: 'buyer' | 'seller', isStudent: boolean, idNumber: string, referralCode?: string, profileImage?: string): Promise<User> => {
    checkRateLimit('registration');
    const safeName = sanitize(name);
    const safeEmail = sanitize(email);
    
    if (users.find(u => u.email === safeEmail)) throw new Error("Email already registered.");
    
    const newUser: User & { password?: string } = {
      id: `u_${Date.now()}`,
      name: safeName,
      email: safeEmail,
      phoneNumber: sanitize(phoneNumber),
      password, 
      role,
      isStudent,
      matricNumber: isStudent ? sanitize(idNumber) : undefined,
      nin: !isStudent ? sanitize(idNumber) : undefined,
      isBanned: false,
      walletBalance: 0,
      referralCode: (safeName.substring(0,3) + Math.floor(Math.random()*10000)).toUpperCase(),
      referralsCount: 0,
      securityAlerts: 0,
      profileImage,
      wishlist: [],
      notifications: [{
          id: 'welcome', userId: '', message: 'Welcome to UI Connect! Set up your profile.', type: 'success', isRead: false, date: Date.now()
      }]
    };

    users.push(newUser);
    logSecurityEvent(`New User Registered: ${safeEmail}`, 'LOW');
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  updateProfile: (userId: string, data: { name?: string, phoneNumber?: string, password?: string }) => {
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx === -1) throw new Error("User not found");
      
      const updatedUser = { ...users[userIdx] };
      if (data.name) updatedUser.name = sanitize(data.name);
      if (data.phoneNumber) updatedUser.phoneNumber = sanitize(data.phoneNumber);
      if (data.password) updatedUser.password = data.password; // In real app, hash this
      
      users[userIdx] = updatedUser;
      return users[userIdx];
  },

  // --- Ban & Maintenance ---

  banUser: (userId: string, type: 'temporary' | 'permanent', reason: string) => {
    checkRateLimit('admin_action');
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const banDetails: BanDetails = {
        type,
        reason: sanitize(reason),
        bannedAt: Date.now(),
        scheduledDeletionAt: type === 'permanent' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : undefined
    };

    users = users.map(u => u.id === userId ? { ...u, isBanned: true, banDetails } : u);
    logSecurityEvent(`User ${user.email} banned (${type}): ${reason}`, 'HIGH');
  },

  unbanUser: (userId: string) => {
    users = users.map(u => u.id === userId ? { ...u, isBanned: false, banDetails: undefined } : u);
    logSecurityEvent(`User ${userId} unbanned`, 'MEDIUM');
  },

  deleteUser: (userId: string) => {
      checkRateLimit('admin_action');
      users = users.filter(u => u.id !== userId);
      // Cascade delete products
      products = products.filter(p => p.sellerId !== userId);
      logSecurityEvent(`User ${userId} and their products permanently deleted.`, 'CRITICAL');
  },

  runDailyMaintenance: () => {
      // Check for permanent bans that have expired
      const now = Date.now();
      const usersToDelete = users.filter(u => 
          u.isBanned && 
          u.banDetails?.type === 'permanent' && 
          u.banDetails.scheduledDeletionAt && 
          now > u.banDetails.scheduledDeletionAt
      );

      usersToDelete.forEach(u => MockBackend.deleteUser(u.id));
      if (usersToDelete.length > 0) {
          console.log(`Maintenance: Deleted ${usersToDelete.length} permanently banned accounts.`);
      }
  },

  // --- Products ---

  addProduct: (sellerId: string, productData: Partial<Product>) => {
      const newProduct: Product = {
          id: `prod_${Date.now()}`,
          sellerId,
          name: sanitize(productData.name || 'Untitled'),
          description: sanitize(productData.description || ''),
          price: Number(productData.price) || 0,
          category: productData.category as Category || 'Merch',
          image: productData.image || 'https://picsum.photos/400?random=' + Math.random(),
          rating: 0,
          inStock: true,
          estimatedDelivery: sanitize(productData.estimatedDelivery || '2-3 Days')
      };
      products.push(newProduct);
      return newProduct;
  },

  deleteProduct: (productId: string) => {
      products = products.filter(p => p.id !== productId);
  },

  // --- Wishlist & Notifications ---

  toggleWishlist: (userId: string, productId: string) => {
      users = users.map(u => {
          if (u.id === userId) {
              const exists = u.wishlist.includes(productId);
              const newWishlist = exists 
                  ? u.wishlist.filter(id => id !== productId)
                  : [...u.wishlist, productId];
              return { ...u, wishlist: newWishlist };
          }
          return u;
      });
  },

  markNotificationRead: (userId: string, notifId: string) => {
      users = users.map(u => {
          if (u.id === userId) {
             return {
                 ...u,
                 notifications: u.notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n)
             };
          }
          return u;
      });
  },

  // --- Standard Getters ---
  getAllUsers: () => users.map(({password, ...u}) => u), 
  getAdTiers: () => adTiers,
  updateAdTier: (id: string, price: number) => { adTiers = adTiers.map(t => t.id === id ? { ...t, price } : t); },
  getSecurityLogs: () => [...securityLogs],
  clearSecurityLogs: () => { securityLogs = []; },
  
  // Wallet
  topUpWallet: (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== 'buyer') throw new Error("Unauthorized");
    users = users.map(u => u.id === userId ? { ...u, walletBalance: u.walletBalance + amount } : u);
    transactions.push({ id: `tx_${Date.now()}`, userId, type: 'DEPOSIT', amount, date: Date.now(), description: 'Wallet Top Up' });
    addNotification(userId, `Wallet funded with ₦${amount.toLocaleString()}`, 'success');
  },
  
  withdrawFunds: (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.walletBalance < amount) throw new Error("Insufficient funds");
    users = users.map(u => u.id === userId ? { ...u, walletBalance: u.walletBalance - amount } : u);
    transactions.push({ id: `tx_${Date.now()}_wd`, userId, type: 'WITHDRAWAL', amount: -amount, date: Date.now(), description: 'Withdrawal' });
    addNotification(userId, `Withdrawal of ₦${amount.toLocaleString()} processed`, 'info');
  },
  
  getWalletBalance: (id: string) => users.find(u => u.id === id)?.walletBalance || 0,
  
  getProducts: () => products.filter(p => !users.find(u => u.id === p.sellerId)?.isBanned),
  getSellerProducts: (sellerId: string) => products.filter(p => p.sellerId === sellerId),
  
  getProductReviews: (id: string) => reviews.filter(r => r.productId === id),
  
  submitReview: (productId: string, userId: string, rating: number, comment: string) => {
      const review = { id: `r_${Date.now()}`, productId, userId, userName: users.find(u => u.id === userId)?.name || 'User', rating, comment: sanitize(comment), date: Date.now(), verifiedPurchase: true };
      reviews.push(review);
      // Recalc average
      const prodReviews = reviews.filter(r => r.productId === productId);
      const avg = prodReviews.reduce((a,b) => a + b.rating, 0) / prodReviews.length;
      products = products.map(p => p.id === productId ? { ...p, rating: parseFloat(avg.toFixed(1)) } : p);
  },

  createOrder: async (buyerId: string, items: any[], total: number) => {
      const newOrder: Order = {
          id: `ord_${Date.now()}`,
          buyerId,
          sellerId: items[0].sellerId,
          items,
          totalAmount: total,
          status: 'PAID_ESCROW',
          createdAt: Date.now()
      };
      orders.push(newOrder);
      addNotification(buyerId, `Order #${newOrder.id} placed successfully.`, 'success');
      addNotification(newOrder.sellerId, `New Order #${newOrder.id} received!`, 'info');
      return newOrder;
  },

  getOrdersForUser: (userId: string) => orders.filter(o => o.buyerId === userId || o.sellerId === userId).sort((a,b) => b.createdAt - a.createdAt),
  getUserTransactions: (userId: string) => transactions.filter(t => t.userId === userId).sort((a,b) => b.date - a.date),
  
  confirmDeliverySent: (orderId: string) => {
      const order = orders.find(o => o.id === orderId);
      orders = orders.map(o => o.id === orderId ? { ...o, status: 'SELLER_CONFIRMED', sellerConfirmedAt: Date.now() } : o);
      if (order) addNotification(order.buyerId, `Order #${orderId} has been sent by the seller. Please confirm receipt.`, 'info');
  },
  
  confirmOrderReceived: (orderId: string) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      users = users.map(u => u.id === order.sellerId ? { ...u, walletBalance: u.walletBalance + order.totalAmount } : u);
      transactions.push({ id: `tx_${Date.now()}`, userId: order.sellerId, type: 'ESCROW_RELEASE', amount: order.totalAmount, date: Date.now(), description: `Escrow Release #${orderId}` });
      orders = orders.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o);
      addNotification(order.sellerId, `Funds for Order #${orderId} released to your wallet.`, 'success');
  },
  
  refundOrder: (orderId: string, reason: string) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      users = users.map(u => u.id === order.buyerId ? { ...u, walletBalance: u.walletBalance + order.totalAmount } : u);
      transactions.push({ id: `tx_${Date.now()}`, userId: order.buyerId, type: 'REFUND', amount: order.totalAmount, date: Date.now(), description: `Refund #${orderId}` });
      orders = orders.map(o => o.id === orderId ? { ...o, status: 'REFUNDED' } : o);
      addNotification(order.buyerId, `Order #${orderId} refunded.`, 'info');
      addNotification(order.sellerId, `Order #${orderId} cancelled by buyer.`, 'warning');
  }
};
