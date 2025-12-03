
export type Category = 'Fashion' | 'Books' | 'Food' | 'Electronics' | 'Home' | 'Services';

export type Role = 'buyer' | 'seller' | 'admin';

export interface AdTier {
  id: 'bronze' | 'silver' | 'gold';
  name: string;
  price: number;
  durationDays: number;
  features: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: number;
  verifiedPurchase: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  date: number;
}

export interface BanDetails {
  type: 'temporary' | 'permanent';
  reason: string;
  bannedAt: number;
  scheduledDeletionAt?: number; // Only for permanent bans
}

export interface SecurityLogEntry {
  id: string;
  timestamp: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: Role;
  
  // Deprecated/Optional for general store
  isStudent?: boolean; 
  matricNumber?: string;
  nin?: string;
  
  // Ban & Security
  isBanned: boolean;
  banDetails?: BanDetails;
  securityAlerts?: number; 
  
  // E-commerce
  walletBalance: number;
  referralCode: string;
  referralsCount: number;
  referralTokens: number; // New: Tokens for redeeming rewards
  activeAdTier?: AdTier['id']; // New: Active earned ad tier
  referredBy?: string;
  lastActive?: number;
  profileImage?: string;
  
  // User Data
  wishlist: string[]; // Product IDs
  notifications: Notification[];
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  rating: number;
  inStock: boolean;
  estimatedDelivery: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAID_ESCROW'      
  | 'SELLER_CONFIRMED' 
  | 'COMPLETED'        
  | 'CANCELLED'        
  | 'REFUNDED';        

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  sellerConfirmedAt?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'REFUND' | 'PAYMENT' | 'REFERRAL_BONUS';
  amount: number;
  date: number;
  description: string;
}

export type PageView = 'home' | 'product' | 'wallet' | 'admin' | 'settings';
