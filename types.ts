
export type Category = 'Merch' | 'Books' | 'Food' | 'Gadgets' | 'Hostel' | 'Services';

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

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: Role;
  isStudent: boolean;
  matricNumber?: string;
  nin?: string;
  isBanned: boolean;
  walletBalance: number;
  referralCode: string;
  referralsCount: number;
  referredBy?: string;
  securityAlerts?: number; 
  lastActive?: number;
  profileImage?: string; // New field for profile picture
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

export type PageView = 'home' | 'product' | 'wallet' | 'admin';
