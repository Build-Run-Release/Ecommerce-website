
import React, { useState, useEffect } from 'react';
import { User, Order, Transaction } from '../types';
import { MockBackend } from '../services/mockBackend';
import { Wallet, Package, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, RefreshCcw, Plus, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface WalletViewProps {
  currentUser: User;
}

export const WalletView: React.FC<WalletViewProps> = ({ currentUser }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');
  
  // Transaction State
  const [amountInput, setAmountInput] = useState<string>('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const fetchData = () => {
    setOrders(MockBackend.getOrdersForUser(currentUser.id));
    setTransactions(MockBackend.getUserTransactions(currentUser.id));
    setBalance(MockBackend.getWalletBalance(currentUser.id));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSellerConfirm = (orderId: string) => {
    MockBackend.confirmDeliverySent(orderId);
    toast.success("Order marked as sent! Waiting for buyer confirmation.");
    fetchData();
  };

  const handleBuyerConfirm = (orderId: string) => {
    MockBackend.confirmOrderReceived(orderId);
    toast.success("Order received! Funds released to seller.");
    fetchData();
  };

  const handleCancel = (orderId: string) => {
    try {
        MockBackend.refundOrder(orderId, "Buyer cancelled order");
        toast.success("Order cancelled. Funds refunded.");
        fetchData();
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  const handleFundsAction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (!amt || amt <= 0 || isNaN(amt)) return toast.error("Enter a valid numeric amount");
    
    try {
        if (currentUser.role === 'buyer') {
            MockBackend.topUpWallet(currentUser.id, amt);
            toast.success(`Wallet topped up with ₦${amt.toLocaleString()}`);
        } else {
            MockBackend.withdrawFunds(currentUser.id, amt);
            toast.success(`Withdrawal request for ₦${amt.toLocaleString()} submitted.`);
        }
        setAmountInput('');
        setShowTransactionForm(false);
        fetchData();
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  // Calculate stats
  const pendingEscrow = orders
    .filter(o => o.status === 'PAID_ESCROW' || o.status === 'SELLER_CONFIRMED')
    .filter(o => o.sellerId === currentUser.id)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-ui-blue text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
             <Wallet size={120} />
          </div>
          <h3 className="text-blue-200 font-medium mb-1">Available Wallet Balance</h3>
          <p className="text-4xl font-bold mb-4">₦{balance.toLocaleString()}</p>
          
          <div className="mt-4">
            {!showTransactionForm ? (
                <button 
                    onClick={() => setShowTransactionForm(true)}
                    className="bg-ui-gold text-ui-blue px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2 shadow-lg"
                >
                    {currentUser.role === 'buyer' ? <Plus size={16} /> : <ArrowRightCircle size={16} />}
                    {currentUser.role === 'buyer' ? 'Top Up Wallet' : 'Withdraw Funds'}
                </button>
            ) : (
                <form onSubmit={handleFundsAction} className="flex gap-2">
                    <input 
                        type="number" 
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="Amount"
                        className="w-28 text-black px-2 py-1 rounded-lg text-sm border-2 border-transparent focus:border-ui-gold outline-none"
                        autoFocus
                        min="100"
                    />
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow">
                        {currentUser.role === 'buyer' ? 'Pay' : 'Get'}
                    </button>
                    <button type="button" onClick={() => setShowTransactionForm(false)} className="text-white/50 text-xs hover:text-white">Cancel</button>
                </form>
            )}
          </div>
        </div>

        {/* Escrow Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-1 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Escrow Holdings
          </h3>
          <p className="text-3xl font-bold text-gray-800 mb-2">₦{pendingEscrow.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Funds are held securely by UI Connect until delivery is confirmed by both parties.</p>
        </div>

        {/* Account Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser.role} Account</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block self-start border border-green-100">
             status: Verified & Secure
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === 'orders' ? 'border-b-2 border-ui-blue text-ui-blue bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Active Orders
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === 'transactions' ? 'border-b-2 border-ui-blue text-ui-blue bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Transaction History
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'orders' ? (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No active orders found.</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">#{order.id}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-lg">₦{order.totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-4 mb-4">
                       {order.items.map((item, i) => (
                         <div key={i} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                           <img src={item.image} className="w-full h-full object-cover" alt="" />
                         </div>
                       ))}
                       <div className="flex-grow flex flex-col justify-center">
                         <p className="font-medium text-sm">{order.items[0].name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</p>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      
                      {currentUser.role === 'seller' && order.status === 'PAID_ESCROW' && (
                        <button 
                          onClick={() => handleSellerConfirm(order.id)}
                          className="bg-ui-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors flex items-center gap-2"
                        >
                          <Package size={16} /> Confirm Delivery Sent
                        </button>
                      )}

                      {currentUser.role === 'buyer' && order.status === 'SELLER_CONFIRMED' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleBuyerConfirm(order.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle size={16} /> Confirm Received
                          </button>
                        </div>
                      )}

                      {/* Improved Cancellation - Available to Buyer ONLY before seller confirms */}
                      {currentUser.role === 'buyer' && order.status === 'PAID_ESCROW' && (
                        <button 
                          onClick={() => handleCancel(order.id)}
                          className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                        >
                          Cancel Order & Refund
                        </button>
                      )}
                      
                      {order.status === 'COMPLETED' && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14}/> Transaction Complete</span>}
                      {order.status === 'REFUNDED' && <span className="text-red-500 text-sm font-medium flex items-center gap-1"><RefreshCcw size={14}/> Funds Refunded</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const styles = {
    'PENDING_PAYMENT': 'bg-gray-100 text-gray-600',
    'PAID_ESCROW': 'bg-blue-100 text-blue-700',
    'SELLER_CONFIRMED': 'bg-yellow-100 text-yellow-700',
    'COMPLETED': 'bg-green-100 text-green-700',
    'CANCELLED': 'bg-red-100 text-red-700',
    'REFUNDED': 'bg-orange-100 text-orange-700',
  };
  
  const labels = {
    'PENDING_PAYMENT': 'Pending',
    'PAID_ESCROW': 'Escrow Secured',
    'SELLER_CONFIRMED': 'On Delivery',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'REFUNDED': 'Refunded',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};
