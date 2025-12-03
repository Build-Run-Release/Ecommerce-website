import { User, Product, Order, Transaction, Review, AdTier, SecurityLogEntry, CartItem, Category } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

// --- Mock Data ---

// Passwords are hardcoded as "password123" for existing mock users for demo purposes
const INITIAL_USERS: (User & { password?: string })[] = [
  { id: 'u1', name: 'Tola Student', email: 'tola@ui.edu.ng', password: 'password123', phoneNumber: '08123456789', role: 'buyer', isStudent: true, matricNumber: '213456', isBanned: false, walletBalance: 50000, referralCode: 'TOLA123', referralsCount: 0, referralTokens: 0, securityAlerts: 0, wishlist: [], notifications: [] },
  { id: 'u2', name: 'Iya Moria', email: 'moria@ui.edu.ng', password: 'password123', phoneNumber: '08098765432', role: 'seller', isStudent: false, nin: '12345678901', isBanned: false, walletBalance: 15000, referralCode: 'MORIA99', referralsCount: 15, referralTokens: 12, securityAlerts: 0, wishlist: [], notifications: [] },
  { id: 'u3', name: 'System Admin', email: 'admin@ui.edu.ng', password: 'admin', phoneNumber: '00000000000', role: 'admin', isStudent: false, isBanned: false, walletBalance: 0, referralCode: 'ADMIN00', referralsCount: 0, referralTokens: 0, securityAlerts: 0, wishlist: [], notifications: [] },
  { id: 'u4', name: 'Bad Guy', email: 'fraud@yahoo.com', password: 'password123', phoneNumber: '09011112222', role: 'seller', isStudent: false, nin: '11111111111', isBanned: true, banDetails: { type: 'temporary', reason: 'Suspicious Activity', bannedAt: Date.now() }, walletBalance: 0, referralCode: 'FAKE111', referralsCount: 0, referralTokens: 0, securityAlerts: 5, wishlist: [], notifications: [] },
];

const INITIAL_REVIEWS: Review[] = [
  { 
      id: 'r1', 
      productId: '5', 
      userId: 'u1', 
      userName: 'Tola Student', 
      rating: 5, 
      comment: 'The suya was extremely spicy, just how I like it!', 
      date: Date.now() - 86400000,
      verifiedPurchase: true
  }
];

// In-Memory State
let users = JSON.parse(JSON.stringify(INITIAL_USERS));
let products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
let orders: Order[] = [];
let transactions: Transaction[] = [];
let securityLogs: SecurityLogEntry[] = [];
const adTiers: AdTier[] = [
    { id: 'bronze', name: 'Bronze', price: 1000, durationDays: 3, features: ['Standard listing'] },
    { id: 'silver', name: 'Silver', price: 2500, durationDays: 7, features: ['Highlighted background'] },
    { id: 'gold', name: 'Gold', price: 5000, durationDays: 30, features: ['Top of category', 'Homepage featured'] }
];

export class MockBackend {
  static getProducts(): Product[] {
    return products;
  }

  static getProductReviews(productId: string): Review[] {
    return reviews.filter((r: Review) => r.productId === productId);
  }

  static submitReview(productId: string, userId: string, rating: number, comment: string) {
    const user = users.find((u: User) => u.id === userId);
    if (!user) throw new Error("User not found");
    const review: Review = {
        id: `r${Date.now()}`,
        productId,
        userId,
        userName: user.name,
        rating,
        comment,
        date: Date.now(),
        verifiedPurchase: true // Simplify for mock
    };
    reviews.unshift(review);
    
    // Update product rating
    const product = products.find((p: Product) => p.id === productId);
    if (product) {
        const productReviews = reviews.filter((r: Review) => r.productId === productId);
        const avg = productReviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / productReviews.length;
        product.rating = parseFloat(avg.toFixed(1));
    }
  }

  static runDailyMaintenance() {
    // Simulate cleanup or scheduled tasks
    console.log("Running daily maintenance...");
  }

  static getAllUsers(): User[] {
    return users.map((u: any) => {
        const { password, ...safeUser } = u;
        return safeUser;
    });
  }

  static login(email: string, password: string): User | null {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) return null;
      if (user.isBanned) throw new Error("Account is suspended.");
      
      // Update last active
      user.lastActive = Date.now();
      
      const { password: _, ...safeUser } = user;
      return safeUser;
  }

  static register(name: string, email: string, password: string, phone: string, role: string, isStudent: boolean, idNumber: string, refCode: string, profileImage: string): User {
      if (users.find((u: any) => u.email === email)) throw new Error("Email already exists");
      
      const newUser = {
          id: `u${Date.now()}`,
          name,
          email,
          password,
          phoneNumber: phone,
          role,
          isStudent,
          matricNumber: isStudent ? idNumber : undefined,
          nin: !isStudent ? idNumber : undefined,
          isBanned: false,
          walletBalance: 0,
          referralCode: name.substring(0,3).toUpperCase() + Math.floor(Math.random()*1000),
          referralsCount: 0,
          referralTokens: 0,
          securityAlerts: 0,
          wishlist: [],
          notifications: [],
          profileImage
      };
      
      users.push(newUser);

      // Handle Referral
      if (refCode) {
          const referrer = users.find((u: any) => u.referralCode === refCode);
          if (referrer) {
              referrer.referralsCount++;
              referrer.walletBalance += 500; // Bonus
              referrer.notifications.push({
                  id: `n${Date.now()}`,
                  userId: referrer.id,
                  message: `You earned ₦500 for referring ${name}`,
                  type: 'success',
                  isRead: false,
                  date: Date.now()
              });
              
              // Log Transaction for referrer
              transactions.push({
                  id: `tx${Date.now()}`,
                  userId: referrer.id,
                  type: 'REFERRAL_BONUS',
                  amount: 500,
                  date: Date.now(),
                  description: `Referral Bonus: ${name}`
              });
          }
      }

      const { password: _, ...safeUser } = newUser;
      return safeUser;
  }

  static toggleWishlist(userId: string, productId: string) {
      const user = users.find((u: any) => u.id === userId);
      if (!user) return;
      
      if (user.wishlist.includes(productId)) {
          user.wishlist = user.wishlist.filter((id: string) => id !== productId);
      } else {
          user.wishlist.push(productId);
      }
  }

  static createOrder(userId: string, cart: CartItem[], total: number) {
      const user = users.find((u: any) => u.id === userId);
      if (!user) throw new Error("User not found");
      
      if (user.walletBalance < total) {
          throw new Error("Insufficient funds");
      }
      
      // Deduct from wallet
      user.walletBalance -= total;
      
      // Create Transaction
      transactions.push({
          id: `tx${Date.now()}_deduct`,
          userId: user.id,
          type: 'PAYMENT',
          amount: -total,
          date: Date.now(),
          description: `Order Payment (${cart.length} items)`
      });

      // Group items by seller to create separate orders if needed, 
      // but for simplicity we'll create one order per seller or just one generic order if mixed?
      // Let's assume one order per unique seller in cart
      
      const sellers = new Set(cart.map(i => i.sellerId));
      sellers.forEach(sellerId => {
          const sellerItems = cart.filter(i => i.sellerId === sellerId);
          const sellerTotal = sellerItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
          // Delivery fee handling logic simplified: assume partial delivery fee or covered by buyer in total
          
          const order: Order = {
              id: `ord${Date.now()}_${sellerId}`,
              buyerId: userId,
              sellerId: sellerId,
              items: sellerItems,
              totalAmount: sellerTotal, // Simplified, doesn't include delivery split
              status: 'PAID_ESCROW',
              createdAt: Date.now()
          };
          orders.push(order);

          // Create Escrow Hold Transaction for System/Seller logic (simulated)
          transactions.push({
              id: `tx${Date.now()}_escrow_${sellerId}`,
              userId: sellerId, // This might show in seller's history as pending
              type: 'ESCROW_HOLD',
              amount: sellerTotal,
              date: Date.now(),
              description: `Escrow Hold for Order #${order.id}`
          });
          
          // Notify Seller
          const seller = users.find((u: any) => u.id === sellerId);
          if (seller) {
              seller.notifications.push({
                  id: `n${Date.now()}`,
                  userId: sellerId,
                  message: `New Order Received: #${order.id}`,
                  type: 'info',
                  isRead: false,
                  date: Date.now()
              });
          }
      });
  }

  static topUpWallet(userId: string, amount: number) {
      const user = users.find((u: any) => u.id === userId);
      if (!user) throw new Error("User not found");
      
      user.walletBalance += amount;
      transactions.push({
          id: `tx${Date.now()}`,
          userId: userId,
          type: 'DEPOSIT',
          amount: amount,
          date: Date.now(),
          description: 'Wallet Top Up'
      });
  }

  static withdrawFunds(userId: string, amount: number) {
      const user = users.find((u: any) => u.id === userId);
      if (!user) throw new Error("User not found");
      if (user.walletBalance < amount) throw new Error("Insufficient funds");
      
      user.walletBalance -= amount;
      transactions.push({
          id: `tx${Date.now()}`,
          userId: userId,
          type: 'WITHDRAWAL',
          amount: -amount,
          date: Date.now(),
          description: 'Withdrawal to Bank'
      });
  }

  static getWalletBalance(userId: string): number {
      const user = users.find((u: any) => u.id === userId);
      return user ? user.walletBalance : 0;
  }

  static getOrdersForUser(userId: string): Order[] {
      return orders.filter(o => o.buyerId === userId || o.sellerId === userId);
  }

  static getUserTransactions(userId: string): Transaction[] {
      return transactions.filter(t => t.userId === userId).sort((a, b) => b.date - a.date);
  }

  static getSellerProducts(sellerId: string): Product[] {
      return products.filter((p: Product) => p.sellerId === sellerId);
  }

  static confirmDeliverySent(orderId: string) {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");
      order.status = 'SELLER_CONFIRMED';
      order.sellerConfirmedAt = Date.now();
      
      // Notify Buyer
      const buyer = users.find((u: any) => u.id === order.buyerId);
      if (buyer) {
          buyer.notifications.push({
              id: `n${Date.now()}`,
              userId: buyer.id,
              message: `Order #${order.id} has been sent by seller`,
              type: 'info',
              isRead: false,
              date: Date.now()
          });
      }
  }

  static confirmOrderReceived(orderId: string) {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");
      
      if (order.status !== 'SELLER_CONFIRMED') throw new Error("Order not yet sent by seller");
      
      order.status = 'COMPLETED';
      
      // Release Escrow to Seller
      const seller = users.find((u: any) => u.id === order.sellerId);
      if (seller) {
          seller.walletBalance += order.totalAmount;
          
          transactions.push({
              id: `tx${Date.now()}_release`,
              userId: seller.id,
              type: 'ESCROW_RELEASE',
              amount: order.totalAmount,
              date: Date.now(),
              description: `Payment Released for Order #${order.id}`
          });
          
          seller.notifications.push({
              id: `n${Date.now()}`,
              userId: seller.id,
              message: `Payment released for Order #${order.id}`,
              type: 'success',
              isRead: false,
              date: Date.now()
          });
      }
  }

  static addProduct(sellerId: string, productData: Omit<Product, 'id' | 'sellerId' | 'rating' | 'inStock' | 'image'>) {
      const newProduct: Product = {
          id: `p${Date.now()}`,
          sellerId,
          ...productData,
          image: `https://picsum.photos/400/400?random=${Date.now()}`,
          rating: 0,
          inStock: true
      };
      products.push(newProduct);
  }

  static deleteProduct(productId: string) {
      products = products.filter((p: Product) => p.id !== productId);
  }

  static updateProfile(userId: string, data: { name: string; phoneNumber: string; password?: string }): User {
      const user = users.find((u: any) => u.id === userId);
      if (!user) throw new Error("User not found");
      
      user.name = data.name;
      user.phoneNumber = data.phoneNumber;
      if (data.password) user.password = data.password;
      
      const { password: _, ...safeUser } = user;
      return safeUser;
  }

  static verifyImageRealness(imageData: string): Promise<boolean> {
      // Mock verification
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              if (Math.random() > 0.1) resolve(true);
              else reject(new Error("Fake image detected"));
          }, 1500);
      });
  }

  // Admin Methods
  
  static getSecurityLogs(): SecurityLogEntry[] {
      return securityLogs;
  }

  static getAdTiers(): AdTier[] {
      return adTiers;
  }

  static banUser(userId: string, type: 'temporary' | 'permanent', reason: string) {
      const user = users.find((u: any) => u.id === userId);
      if (!user) return;
      
      user.isBanned = true;
      user.banDetails = {
          type,
          reason,
          bannedAt: Date.now(),
          scheduledDeletionAt: type === 'permanent' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : undefined
      };

      securityLogs.push({
          id: `sec${Date.now()}`,
          timestamp: Date.now(),
          level: 'HIGH',
          message: `User ${user.name} (${userId}) was BANNED (${type}). Reason: ${reason}`
      });
  }

  static unbanUser(userId: string) {
      const user = users.find((u: any) => u.id === userId);
      if (!user) return;
      
      user.isBanned = false;
      user.banDetails = undefined;
      
      securityLogs.push({
          id: `sec${Date.now()}`,
          timestamp: Date.now(),
          level: 'MEDIUM',
          message: `User ${user.name} (${userId}) was UNBANNED.`
      });
  }

  static deleteUser(userId: string) {
      users = users.filter((u: any) => u.id !== userId);
      products = products.filter((p: Product) => p.sellerId !== userId);
      // Clean up other relations if necessary
      
      securityLogs.push({
          id: `sec${Date.now()}`,
          timestamp: Date.now(),
          level: 'CRITICAL',
          message: `User ${userId} was PERMANENTLY DELETED.`
      });
  }
}
