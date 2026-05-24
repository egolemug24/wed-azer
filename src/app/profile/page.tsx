'use client';

import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  History, 
  Heart, 
  Wallet, 
  LogOut,
  Shield,
  Star,
  ChevronRight,
  PlusCircle,
  Gamepad2,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';

type Transaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; region: string | null };
};

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  balance: number;
  transactions: Transaction[];
  orders: Order[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');
  const [topupLoading, setTopupLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        router.push('/admin/login'); // Temporary, replace with actual user login later if different
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleTopup = async () => {
    setTopupLoading(true);
    try {
      // Simulate adding 1000 RUB for testing
      const res = await fetch('/api/user/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000 })
      });
      if (res.ok) {
        // Refresh profile data to see the new transaction and balance
        await fetchProfile();
      }
    } catch (err) {
      console.error('Topup failed', err);
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-ps-blue" />
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen pt-20 text-center">Профиль не найден</div>;
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-ps-blue shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
            
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-ps-blue shadow-[0_0_20px_rgba(37,99,235,0.3)] bg-ps-dark/50 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white/50" />
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ps-blue text-[10px] font-bold border-ps-dark border-2">
                Уровень 1
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold mb-1 tracking-tight">{user.name || 'Пользователь'}</h2>
            <p className="text-xs text-muted-foreground mb-6">{user.email}</p>
            
            <Button 
              onClick={handleTopup}
              disabled={topupLoading}
              className="w-full bg-ps-blue/10 hover:bg-ps-blue text-ps-blue hover:text-white border border-ps-blue/30 transition-all mb-4"
            >
              {topupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />} 
              Пополнить баланс
            </Button>
          </div>

          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all hover:bg-white/5 ${
                activeTab === 'orders' ? "bg-ps-blue/10 text-ps-blue border-r-2 border-ps-blue" : "text-white/60"
              }`}
            >
              <History className="w-5 h-5" />
              История покупок
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all hover:bg-white/5 ${
                activeTab === 'transactions' ? "bg-ps-blue/10 text-ps-blue border-r-2 border-ps-blue" : "text-white/60"
              }`}
            >
              <Wallet className="w-5 h-5" />
              История пополнений
            </button>
            <button 
              onClick={() => { logout(); router.push('/'); }} 
              className="w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all hover:bg-white/5 text-red-500"
            >
              <LogOut className="w-5 h-5" />
              Выйти
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-ps-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Баланс кошелька</p>
               <h3 className="text-3xl font-black text-glow">{user.balance.toLocaleString()} ₽</h3>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5">
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Всего покупок</p>
               <h3 className="text-3xl font-black">{user.orders.length}</h3>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5">
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Всего пополнений</p>
               <h3 className="text-3xl font-black">{user.transactions.filter(t => t.type === 'TOPUP').length}</h3>
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {activeTab === 'orders' ? 'История покупок' : 'История пополнений'}
              </h2>
            </div>

            <div className="space-y-4">
              {activeTab === 'orders' && user.orders.length === 0 && (
                <div className="text-center py-10 text-white/50">У вас еще нет покупок</div>
              )}
              
              {activeTab === 'transactions' && user.transactions.length === 0 && (
                <div className="text-center py-10 text-white/50">У вас еще нет пополнений баланса</div>
              )}

              {activeTab === 'orders' && user.orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6 group hover:border-ps-blue/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-ps-blue/10 flex items-center justify-center border border-ps-blue/20 shrink-0">
                    <Gamepad2 className="text-ps-blue w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                      <h4 className="font-bold">Заказ #{order.id.slice(-6).toUpperCase()}</h4>
                      <Badge variant="outline" className="text-[10px] bg-ps-dark/50 border-white/10 uppercase">
                        {order.items.length} товаров
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                    <div className="text-xs text-white/70 mt-2">
                      {order.items.map((item, i) => (
                        <span key={item.id}>
                          {item.product.name} (x{item.quantity}){i < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold text-lg">{order.total.toLocaleString()} ₽</p>
                      <div className="flex items-center gap-1 text-green-500 justify-end">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold uppercase">{order.status}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {activeTab === 'transactions' && user.transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6 group hover:border-ps-blue/30 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                    tx.type === 'TOPUP' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {tx.type === 'TOPUP' ? <PlusCircle className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h4 className="font-bold">{tx.type === 'TOPUP' ? 'Пополнение баланса' : 'Списание средств'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Транзакция #{tx.id.slice(-6).toUpperCase()} • {formatDate(tx.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.type === 'TOPUP' ? 'text-green-500' : 'text-white'}`}>
                        {tx.type === 'TOPUP' ? '+' : '-'}{tx.amount.toLocaleString()} ₽
                      </p>
                      <div className="flex items-center gap-1 text-green-500 justify-end">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold uppercase">{tx.status}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
