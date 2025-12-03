
import React, { useState, useEffect } from 'react';
import { User, Order, Transaction, Product } from '../types';
import { MockBackend } from '../services/mockBackend';
import { Wallet, Package, ArrowUpRight, ArrowDownLeft, CheckCircle, RefreshCcw, Plus, AlertTriangle, CircleArrowRight, Trash2, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { AddProductModal } from './AddProductModal';

interface WalletViewProps {
  currentUser: User;
}

export const WalletView: React.FC<WalletViewProps> = ({ currentUser }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'inventory'>('orders');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  // Transaction State
  const [amountInput, setAmountInput] = useState<string>('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const fetchData = () => {
    setOrders(MockBackend.getOrdersForUser(currentUser.id));
    setTransactions(MockBackend.getUserTransactions(currentUser.id));
    setBalance(MockBackend.getWalletBalance(currentUser.id));
    if (currentUser.role === 'seller') {
        setSellerProducts(MockBackend.getSellerProducts(currentUser.id));
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSellerConfirm = (orderId: string) => {
    MockBackend.confirmDeliverySent(orderId);
    toast.success("Order marked as sent!");
    fetchData();
  };

  const handleBuyerConfirm = (orderId: string) => {
    MockBackend.confirmOrderReceived(orderId);
    toast.success("Funds released to seller!");
    fetchData();
  };

  const handleFundsAction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (!amt || amt <= 0) return toast.error("Invalid amount");
    try {
        if (currentUser.role === 'buyer') {
            MockBackend.topUpWallet(currentUser.id, amt);
            toast.success("Top Up Successful");
        } else {
            MockBackend.withdrawFunds(currentUser.id, amt);
            toast.success("Withdrawal Processed");
        }
        setAmountInput('');
        setShowTransactionForm(false);
        fetchData();
    } catch (e: any) { toast.error(e.message); }
  };
  
  const handleDeleteProduct = (pid: string) => {
      if (confirm("Delete this product?")) {
          MockBackend.deleteProduct(pid);
          toast.success("Product removed");
          fetchData();
      }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <AddProductModal 
         isOpen={isAddProductOpen} 
         onClose={() => setIsAddProductOpen(false)} 
         sellerId={currentUser.id}
         onSuccess={fetchData}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-ui-blue text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><Wallet size={120} /></div>
          <h3 className="text-blue-200 font-medium mb-1">Available Balance</h3>
          <p className="text-4xl font-bold mb-4">₦{balance.toLocaleString()}</p>
          
          {!showTransactionForm ? (
            <button 
                onClick={() => setShowTransactionForm(true)}
                className="bg-ui-gold text-ui-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
            >
                {currentUser.role === 'buyer' ? <Plus size={16} /> : <CircleArrowRight size={16} />}
                {currentUser.role === 'buyer' ? 'Top Up' : 'Withdraw'}
            </button>
          ) : (
            <form onSubmit={handleFundsAction} className="flex gap-2">
                <input 
                    type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="Amount" className="w-24 text-black px-2 py-1 rounded text-sm outline-none" autoFocus
                />
                <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">Go</button>
                <button type="button" onClick={() => setShowTransactionForm(false)} className="text-white/50 text-xs">X</button>
            </form>
          )}
        </div>

        {/* Info Cards */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500" /> Escrow</h3>
          <p className="text-3xl font-bold text-gray-800">₦{orders.filter(o => o.status === 'PAID_ESCROW' && o.sellerId === currentUser.id).reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Held until confirmed delivery.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('orders')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'orders' ? 'text-ui-blue border-b-2 border-ui-blue bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>Orders</button>
          <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'transactions' ? 'text-ui-blue border-b-2 border-ui-blue bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>History</button>
          {currentUser.role === 'seller' && (
             <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'inventory' ? 'text-ui-blue border-b-2 border-ui-blue bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>My Products</button>
          )}
        </div>

        <div className="p-4 md:p-6 min-h-[400px]">
          {activeTab === 'orders' && (
             <div className="space-y-4">
               {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders yet.</p>}
               {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 transition-all hover:shadow-md">
                      <div className="w-full sm:w-auto">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="font-bold text-sm sm:text-base">#{order.id}</span>
                             <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold ${
                                 order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                 order.status === 'PAID_ESCROW' ? 'bg-orange-100 text-orange-700' :
                                 'bg-gray-100 text-gray-600'
                             }`}>{order.status.replace('_', ' ')}</span>
                          </div>
                          <p className="text-sm text-gray-500">{order.items[0].name} {order.items.length > 1 ? `+ ${order.items.length - 1} others` : ''}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0 flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end">
                          <p className="font-bold text-lg">₦{order.totalAmount.toLocaleString()}</p>
                          <div className="mt-0 sm:mt-2 flex gap-2">
                              {currentUser.role === 'seller' && order.status === 'PAID_ESCROW' && (
                                  <button onClick={() => handleSellerConfirm(order.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Confirm Sent</button>
                              )}
                              {currentUser.role === 'buyer' && order.status === 'SELLER_CONFIRMED' && (
                                  <button onClick={() => handleBuyerConfirm(order.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Confirm Received</button>
                              )}
                          </div>
                      </div>
                  </div>
               ))}
             </div>
          )}

          {activeTab === 'transactions' && (
             <div className="space-y-2">
                 {transactions.map(tx => (
                     <div key={tx.id} className="flex justify-between items-center p-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg transition-colors">
                         <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-medium">{tx.description}</span>
                            <span className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                         </div>
                         <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount > 0 ? '+' : ''}₦{tx.amount.toLocaleString()}</span>
                     </div>
                 ))}
             </div>
          )}

          {activeTab === 'inventory' && (
              <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <h3 className="font-bold text-gray-800">Your Products</h3>
                      <button onClick={() => setIsAddProductOpen(true)} className="w-full sm:w-auto bg-ui-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors">
                          <Plus size={16} /> Add Product
                      </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sellerProducts.map(p => (
                          <div key={p.id} className="flex gap-4 border border-gray-200 p-3 rounded-xl items-center hover:shadow-md transition-shadow">
                              <img src={p.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100" alt="" />
                              <div className="flex-grow min-w-0">
                                  <h4 className="font-bold text-sm truncate">{p.name}</h4>
                                  <p className="text-xs text-gray-500">₦{p.price.toLocaleString()}</p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                                  </span>
                              </div>
                              <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
