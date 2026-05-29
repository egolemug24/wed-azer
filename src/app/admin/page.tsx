'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Activity, 
  RefreshCw, 
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Search,
  Calendar,
  CreditCard,
  UserPlus,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  onlineCount: number;
  totalUsers: number;
  totalOrdersCount: number;
  totalRevenueSum: number;
  visitors: { day: number; week: number; month: number };
  sales: { day: number; week: number; month: number };
  revenue: { day: number; week: number; month: number };
  recentLogins: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    lastLogin: string;
    createdAt: string;
  }>;
  recentRegistrations: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    userId: string;
    total: number;
    status: string;
    createdAt: string;
    user: { email: string; name: string | null };
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: { name: string; image: string };
    }>;
  }>;
  recentTransactions: Array<{
    id: string;
    userId: string;
    amount: number;
    type: 'TOPUP' | 'PURCHASE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
    user: { email: string; name: string | null };
  }>;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, checkSession } = useAuth();
  const router = useRouter();
  
  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'logins' | 'purchases'>('overview');
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchAnalytics = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics', res.status);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoadingData(false);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      await checkSession();
      setLoadingAuth(false);
    };
    init();
  }, [checkSession]);

  React.useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.replace('/');
      } else {
        fetchAnalytics();
      }
    }
  }, [loadingAuth, isAuthenticated, user, router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-ps-dark flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-12 h-12 text-ps-blue animate-spin mb-4" />
        <p className="text-sm font-medium text-white/60">Проверка прав администратора...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-ps-dark flex flex-col items-center justify-center text-white px-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Доступ запрещен</h1>
        <p className="text-sm text-white/60 text-center mb-6 max-w-sm">
          Эта страница доступна только для пользователей с правами администратора.
        </p>
        <Button onClick={() => router.replace('/')} className="bg-ps-blue hover:bg-ps-glow">
          Вернуться на главную
        </Button>
      </div>
    );
  }

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter lists based on search
  const filteredLogins = analyticsData?.recentLogins.filter(item => 
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredRegistrations = analyticsData?.recentRegistrations.filter(item => 
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredOrders = analyticsData?.recentOrders.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.items.some(oi => oi.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const filteredTransactions = analyticsData?.recentTransactions.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-ps-dark pt-10 pb-20 px-4 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          <div className="p-4 mb-4 bg-ps-navy/20 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500 font-bold uppercase tracking-wider">Admin Session Active</span>
            </div>
            <p className="text-sm font-bold mt-2 truncate">{user?.email}</p>
          </div>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview' ? "bg-ps-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Дашборд
          </button>
          
          <button
            onClick={() => setActiveTab('logins')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'logins' ? "bg-ps-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" />
            Входы и логины
          </button>
          
          <button
            onClick={() => setActiveTab('purchases')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'purchases' ? "bg-ps-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Покупки и счета
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Аналитика сайта</h1>
              <p className="text-sm text-muted-foreground">Статистика входов, регистраций и финансовых операций</p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={fetchAnalytics} 
                disabled={loadingData}
                variant="outline" 
                className="border-white/10 bg-ps-navy/40 hover:bg-ps-navy/70 text-white gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                Обновить данные
              </Button>
            </div>
          </div>

          {loadingData && !analyticsData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 animate-pulse h-28" />
                ))}
              </div>
              <div className="glass-card p-8 rounded-2xl border border-white/5 animate-pulse h-96" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Stat 1 */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Всего выручка</p>
                      <h3 className="text-2xl font-black text-glow text-ps-light">
                        {formatPrice(analyticsData?.totalRevenueSum || 0)}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-ps-blue/10 border border-ps-blue/20 text-ps-blue">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-white/50 gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span>По всем выполненным заказам</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Заказов совершено</p>
                      <h3 className="text-2xl font-black">
                        {analyticsData?.totalOrdersCount || 0}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-ps-glow/10 border border-ps-glow/20 text-ps-glow">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-white/50 gap-2">
                    <div className="w-2 h-2 rounded-full bg-ps-blue" />
                    <span>Включая активные и архивные</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Пользователей</p>
                      <h3 className="text-2xl font-black">
                        {analyticsData?.totalUsers || 0}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-white/50 gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Всего зарегистрировано</span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Онлайн на сайте</p>
                      <h3 className="text-2xl font-black text-green-400 flex items-center gap-2">
                        {analyticsData?.onlineCount || 0}
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-white/50 gap-1">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span>Активность за последние 5 минут</span>
                  </div>
                </div>

              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Detailed Performance Metrics */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-ps-blue" />
                      Показатели по периодам
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Revenue card */}
                      <div className="bg-ps-navy/40 border border-white/5 p-5 rounded-xl">
                        <h4 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                          <Coins className="w-4 h-4 text-ps-light" /> Выручка за периоды
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/55">Сегодня</span>
                            <span className="font-bold text-sm">{formatPrice(analyticsData?.revenue.day || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-xs text-white/55">На этой неделе</span>
                            <span className="font-bold text-sm">{formatPrice(analyticsData?.revenue.week || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-xs text-white/55">В этом месяце</span>
                            <span className="font-bold text-sm text-glow text-ps-light">{formatPrice(analyticsData?.revenue.month || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sales card */}
                      <div className="bg-ps-navy/40 border border-white/5 p-5 rounded-xl">
                        <h4 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-ps-light" /> Продажи (заказы)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/55">Сегодня</span>
                            <span className="font-bold text-sm">{analyticsData?.sales.day} шт.</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-xs text-white/55">На этой неделе</span>
                            <span className="font-bold text-sm">{analyticsData?.sales.week} шт.</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-xs text-white/55">В этом месяце</span>
                            <span className="font-bold text-sm">{analyticsData?.sales.month} шт.</span>
                          </div>
                        </div>
                      </div>

                      {/* Visitors card */}
                      <div className="bg-ps-navy/40 border border-white/5 p-5 rounded-xl">
                        <h4 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                          <Users className="w-4 h-4 text-ps-light" /> Посетители (уникальные сессии)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/55">Сегодня</span>
                            <span className="font-bold text-sm">{analyticsData?.visitors.day} чел.</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-xs text-white/55">На этой неделе</span>
                            <span className="font-bold text-sm">{analyticsData?.visitors.week} чел.</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-xs text-white/55">В этом месяце</span>
                            <span className="font-bold text-sm">{analyticsData?.visitors.month} чел.</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Dashboard Quick Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Recent Orders Overview */}
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-ps-blue" />
                          Последние заказы
                        </h3>
                        <Button variant="link" onClick={() => setActiveTab('purchases')} className="text-ps-light hover:text-white p-0 h-auto">
                          Все заказы
                        </Button>
                      </div>
                      <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                        {analyticsData?.recentOrders.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">Нет заказов</div>
                        ) : (
                          analyticsData?.recentOrders.slice(0, 5).map((order) => (
                            <div key={order.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                              <div>
                                <p className="font-bold text-sm truncate max-w-[200px] sm:max-w-xs">{order.user.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {order.items.length} товар(ов) • {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-sm block">{formatPrice(order.total)}</span>
                                <Badge className={`mt-1 text-[10px] border-none px-2 py-0.5 ${
                                  order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                  order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {order.status === 'COMPLETED' ? 'Выполнен' :
                                   order.status === 'PENDING' ? 'Ожидает' : 'Отменен'}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Logins Overview */}
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                          <Users className="w-5 h-5 text-ps-blue" />
                          Недавние входы пользователей
                        </h3>
                        <Button variant="link" onClick={() => setActiveTab('logins')} className="text-ps-light hover:text-white p-0 h-auto">
                          Все входы
                        </Button>
                      </div>
                      <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                        {analyticsData?.recentLogins.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">Нет авторизаций</div>
                        ) : (
                          analyticsData?.recentLogins.slice(0, 5).map((log) => (
                            <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                              <div>
                                <p className="font-bold text-sm truncate max-w-[200px] sm:max-w-xs">{log.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {log.name || 'Без имени'} • {log.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-white/60">{formatDate(log.lastLogin)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 2: Logins & Registrations */}
              {activeTab === 'logins' && (
                <div className="space-y-8">
                  {/* Search filter bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Поиск по email или имени..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-ps-navy/40 border-white/10 h-10 text-white rounded-xl focus:border-ps-blue"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Logins Table */}
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h3 className="font-bold flex items-center gap-2">
                          <Users className="w-5 h-5 text-ps-light" />
                          История входов пользователей
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-xs text-muted-foreground uppercase bg-white/5 font-bold">
                              <th className="px-6 py-4">Пользователь</th>
                              <th className="px-6 py-4">Роль</th>
                              <th className="px-6 py-4">Дата входа</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {filteredLogins.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Пользователи не найдены</td>
                              </tr>
                            ) : (
                              filteredLogins.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold">{item.email}</p>
                                    <p className="text-xs text-muted-foreground">{item.name || 'Имя не указано'}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`border-none px-2 py-0.5 text-[10px] ${item.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                      {item.role}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-semibold text-white/70">
                                    {formatDate(item.lastLogin)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Registrations Table */}
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h3 className="font-bold flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-ps-light" />
                          Новые регистрации
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-xs text-muted-foreground uppercase bg-white/5 font-bold">
                              <th className="px-6 py-4">Пользователь</th>
                              <th className="px-6 py-4">Роль</th>
                              <th className="px-6 py-4">Дата регистрации</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {filteredRegistrations.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Пользователи не найдены</td>
                              </tr>
                            ) : (
                              filteredRegistrations.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold">{item.email}</p>
                                    <p className="text-xs text-muted-foreground">{item.name || 'Имя не указано'}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`border-none px-2 py-0.5 text-[10px] ${item.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                      {item.role}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-semibold text-white/70">
                                    {formatDate(item.createdAt)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 3: Purchases & Transactions */}
              {activeTab === 'purchases' && (
                <div className="space-y-8">
                  {/* Search filter bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Поиск по email, ID заказа или игре..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-ps-navy/40 border-white/10 h-10 text-white rounded-xl focus:border-ps-blue"
                    />
                  </div>

                  {/* Orders Table */}
                  <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                      <h3 className="font-bold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-ps-light" />
                        Покупки пользователей (Заказы)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs text-muted-foreground uppercase bg-white/5 font-bold">
                            <th className="px-6 py-4">ID / Покупатель</th>
                            <th className="px-6 py-4">Товары</th>
                            <th className="px-6 py-4">Итого</th>
                            <th className="px-6 py-4">Статус</th>
                            <th className="px-6 py-4">Дата</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Заказы не найдены</td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => (
                              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-mono text-xs text-ps-light truncate w-32">{order.id}</p>
                                  <p className="font-bold text-xs truncate max-w-xs">{order.user.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2">
                                    {order.items.map((oi) => (
                                      <div key={oi.id} className="flex items-center gap-2 text-xs">
                                        <img src={oi.product.image} className="w-6 h-6 rounded object-cover" />
                                        <span className="font-medium truncate max-w-[200px]">{oi.product.name}</span>
                                        <span className="text-white/55">x{oi.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-sm">
                                  {formatPrice(order.total)}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={`border-none px-3 py-1 rounded-full text-xs font-semibold ${
                                    order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {order.status === 'COMPLETED' ? 'Выполнен' :
                                     order.status === 'PENDING' ? 'Ожидает' : 'Отменен'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-white/60">
                                  {formatDate(order.createdAt)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                      <h3 className="font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-ps-light" />
                        Финансовые транзакции (Кошелек)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs text-muted-foreground uppercase bg-white/5 font-bold">
                            <th className="px-6 py-4">Транзакция / Пользователь</th>
                            <th className="px-6 py-4">Тип операции</th>
                            <th className="px-6 py-4">Сумма</th>
                            <th className="px-6 py-4">Статус</th>
                            <th className="px-6 py-4">Дата</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {filteredTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Транзакции не найдены</td>
                            </tr>
                          ) : (
                            filteredTransactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-mono text-xs text-ps-light truncate w-32">{tx.id}</p>
                                  <p className="font-bold text-xs truncate max-w-xs">{tx.user.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={`border-none px-2 py-0.5 text-[10px] font-bold ${
                                    tx.type === 'TOPUP' ? 'bg-green-500/10 text-green-400' : 'bg-ps-blue/10 text-ps-light'
                                  }`}>
                                    {tx.type === 'TOPUP' ? 'Пополнение' : 'Списание (Покупка)'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 font-bold text-sm">
                                  {tx.type === 'TOPUP' ? '+' : '-'}{formatPrice(tx.amount)}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={`border-none px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                    tx.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                    tx.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {tx.status === 'COMPLETED' ? 'Выполнено' :
                                     tx.status === 'PENDING' ? 'В обработке' : 'Ошибка / Отмена'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-white/60">
                                  {formatDate(tx.createdAt)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
