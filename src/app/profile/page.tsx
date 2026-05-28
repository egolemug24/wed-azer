'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  History, 
  Heart, 
  LogOut,
  Shield,
  Star,
  ChevronRight,
  Gamepad2,
  RefreshCcw,
  Loader2,
  BarChart3,
  Users,
  Camera
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
  image: string | null;
  transactions: Transaction[];
  orders: Order[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders');
  const [topupLoading, setTopupLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);

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
        if (data.user.role === 'ADMIN') {
          fetchAnalytics();
          fetchSettings();
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateUah: settings.rateUah, rateTry: settings.rateTry })
      });
      if (res.ok) {
        alert('Настройки сохранены');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Изображение слишком большое. Максимальный размер 2 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setUploading(true);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        });

        if (res.ok) {
          setUser(prev => prev ? { ...prev, image: base64 } : null);
        } else {
          alert('Не удалось обновить фотографию профиля');
        }
      } catch (err) {
        console.error(err);
        alert('Ошибка при загрузке изображения');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Ошибка при чтении файла');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProfile();
  }, []);



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
            
            <div className="relative inline-block mb-4 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-ps-blue shadow-[0_0_20px_rgba(37,99,235,0.3)] bg-ps-dark/50 flex items-center justify-center relative">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-ps-blue" />
                ) : user.image ? (
                  <img src={user.image} alt={user.name || 'Аватар'} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-white/50" />
                )}
                
                {!uploading && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ps-blue text-[10px] font-bold border-ps-dark border-2">
                Уровень 1
              </Badge>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            <h2 className="text-2xl font-bold mb-1 tracking-tight">{user.name || 'Пользователь'}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
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

            {user.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all hover:bg-white/5 ${
                  activeTab === 'analytics' ? "bg-ps-blue/10 text-ps-blue border-r-2 border-ps-blue" : "text-white/60"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Панель управления
              </button>
            )}
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
            <div className="glass-card p-6 rounded-2xl border border-white/5">
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Всего покупок</p>
               <h3 className="text-3xl font-black">{user.orders.length}</h3>
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {activeTab === 'orders' ? 'История покупок' : 'Аналитика сайта'}
              </h2>
            </div>

            <div className="space-y-4">
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-8">
                  {settings && (
                    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="font-bold text-lg">Курсы валют</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white/70 uppercase">Курс Гривны (UAH к RUB)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={settings.rateUah}
                            onChange={(e) => setSettings({...settings, rateUah: Number(e.target.value)})}
                            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-ps-blue"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white/70 uppercase">Курс Лиры (TRY к RUB)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={settings.rateTry}
                            onChange={(e) => setSettings({...settings, rateTry: Number(e.target.value)})}
                            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-ps-blue"
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-ps-blue hover:bg-ps-glow mt-2">
                        {savingSettings ? 'Сохранение...' : 'Сохранить курсы'}
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl border border-ps-blue/30 bg-ps-blue/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="text-ps-blue w-6 h-6" />
                        <h3 className="font-bold text-lg text-white">Прямо сейчас на сайте</h3>
                      </div>
                      <p className="text-5xl font-black text-glow text-ps-blue">{analytics.onlineCount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                      <h4 className="text-white/50 text-sm font-bold uppercase mb-4">Продажи (товаров)</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span>За день:</span> <span className="font-bold">{analytics.sales.day}</span></div>
                        <div className="flex justify-between"><span>За неделю:</span> <span className="font-bold">{analytics.sales.week}</span></div>
                        <div className="flex justify-between"><span>За месяц:</span> <span className="font-bold">{analytics.sales.month}</span></div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                      <h4 className="text-white/50 text-sm font-bold uppercase mb-4">Выручка</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-green-400"><span>За день:</span> <span className="font-bold">{analytics.revenue.day.toLocaleString()} ₽</span></div>
                        <div className="flex justify-between text-green-400"><span>За неделю:</span> <span className="font-bold">{analytics.revenue.week.toLocaleString()} ₽</span></div>
                        <div className="flex justify-between text-green-400"><span>За месяц:</span> <span className="font-bold">{analytics.revenue.month.toLocaleString()} ₽</span></div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                      <h4 className="text-white/50 text-sm font-bold uppercase mb-4">Посетители (сессии)</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span>За день:</span> <span className="font-bold">{analytics.visitors.day}</span></div>
                        <div className="flex justify-between"><span>За неделю:</span> <span className="font-bold">{analytics.visitors.week}</span></div>
                        <div className="flex justify-between"><span>За месяц:</span> <span className="font-bold">{analytics.visitors.month}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'orders' && user.orders.length === 0 && (
                <div className="text-center py-10 text-white/50">У вас еще нет покупок</div>
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


            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
