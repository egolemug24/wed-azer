'use client';

import React, { useState } from 'react';
import { Heart, Shield, Zap, Star, Check, Info, Globe2, Gamepad2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/use-cart';
import { useFavorites } from '@/store/use-favorites';
import { toast } from 'sonner';

import { useAuth } from '@/store/use-auth';
import { useAdmin } from '@/store/use-admin';
import { MoreHorizontal, Loader2 } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  color: string;
  glow: string;
  price1: number;
  price3: number;
  price12: number;
  features: string[];
  popular: boolean;
  region: string;
  type: string;
}

type TabType = 'PS_PLUS' | 'EA_PLAY' | 'P3_SHARING';
type RegionType = 'TR' | 'UA';
type PlatformType = 'PS4' | 'PS5';

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PS_PLUS');
  const [selectedRegion, setSelectedRegion] = useState<RegionType>('TR');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('PS5');
  const [period, setPeriod] = useState("12");
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem: addToCart } = useCart();
  const { hasItem, addItem: addFav, removeItem: removeFav } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const { setEditingSubscription } = useAdmin();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  React.useEffect(() => {
    fetch('/api/subscriptions')
      .then(res => res.json())
      .then(data => {
        if (data.plans) setPlans(data.plans);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getPlanId = (plan: SubscriptionPlan) => {
    if (plan.type === 'P3_SHARING') {
      return `sharing-${plan.name.toLowerCase()}-${selectedPlatform.toLowerCase()}`;
    }
    return `sub-${plan.type.toLowerCase()}-${plan.name.toLowerCase()}-${selectedRegion.toLowerCase()}-${period}`;
  };

  const getPlanName = (plan: SubscriptionPlan) => {
    if (plan.type === 'P3_SHARING') {
      return `${plan.name} (${selectedPlatform})`;
    }
    const regionName = selectedRegion === 'TR' ? 'Турция' : 'Украина';
    if (plan.type === 'EA_PLAY') {
      return `EA Play (${period} мес.) - ${regionName}`;
    }
    return `PS Plus ${plan.name} (${period} мес.) - ${regionName}`;
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (plan.type === 'P3_SHARING') {
      return selectedPlatform === 'PS4' ? plan.price1 : plan.price3;
    }
    return period === "1" ? plan.price1 : period === "3" ? plan.price3 : plan.price12;
  };
  
  const handleAddToCart = (plan: SubscriptionPlan) => {
    const price = getPlanPrice(plan);
    const name = getPlanName(plan);
    const id = getPlanId(plan);

    addToCart({
      id: id,
      name: name,
      price: price,
      discount: 0,
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg", // Fallback generic logo
      quantity: 1,
    });
    toast.success(`Подписка ${plan.name} добавлена в корзину`);
  };

  const toggleFavorite = (plan: SubscriptionPlan) => {
    const id = getPlanId(plan);
    const price = getPlanPrice(plan);
    const name = getPlanName(plan);

    if (hasItem(id)) {
      removeFav(id);
      toast.success("Удалено из избранного");
    } else {
      addFav({
        id: id,
        name: name,
        price: price,
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg",
        type: 'subscription'
      });
      toast.success("Добавлено в избранное");
    }
  };

  // Filter plans based on active tab and options
  const filteredPlans = plans.filter(plan => {
    if (activeTab === 'PS_PLUS') {
      return plan.type === 'PS_PLUS' && plan.region === selectedRegion;
    }
    if (activeTab === 'EA_PLAY') {
      return plan.type === 'EA_PLAY' && plan.region === selectedRegion;
    }
    if (activeTab === 'P3_SHARING') {
      return plan.type === 'P3_SHARING';
    }
    return false;
  });

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <Badge className="bg-ps-blue mb-4">Подписки & Услуги</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-glow">
          {activeTab === 'PS_PLUS' && "PlayStation Plus"}
          {activeTab === 'EA_PLAY' && "EA Play"}
          {activeTab === 'P3_SHARING' && "П3 Система (Шеринг)"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {activeTab === 'PS_PLUS' && "Сотни игр, эксклюзивные скидки и сетевая игра. Активация на ваш аккаунт за 15 минут."}
          {activeTab === 'EA_PLAY' && "Играйте в лучшие игры от Electronic Arts, получайте ранний доступ и скидки на покупки."}
          {activeTab === 'P3_SHARING' && "Играйте со своего личного аккаунта, получайте достижения и сохранения с максимальной экономией."}
        </p>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-ps-navy/50 p-1 rounded-2xl border border-white/5 flex w-full max-w-2xl shadow-xl">
          {[
            { id: 'PS_PLUS', label: 'PlayStation Plus', icon: Shield },
            { id: 'EA_PLAY', label: 'EA Play', icon: Zap },
            { id: 'P3_SHARING', label: 'П3 Шеринг', icon: Gamepad2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                // Reset states to defaults when switching tabs
                if (tab.id === 'P3_SHARING') {
                  setSelectedPlatform('PS5');
                } else {
                  setPeriod("12");
                }
              }}
              className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-ps-blue text-white shadow-lg shadow-ps-blue/20"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Controls (Region, Period, Platforms) */}
      <div className="flex flex-col items-center justify-center gap-6 mb-12">
        {isAdmin && (
          <Button
            onClick={() => setEditingSubscription({})}
            className="bg-green-500 hover:bg-green-600 text-white shadow-lg h-12 w-full max-w-xs"
          >
            + Добавить план
          </Button>
        )}

        <div className="flex flex-col gap-4 items-center justify-center w-full max-w-3xl">
          {/* Region Selector (Only for PS Plus and EA Play) */}
          {activeTab !== 'P3_SHARING' && (
            <div className="bg-ps-navy/40 p-1 rounded-xl border border-white/5 flex shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setSelectedRegion('TR')}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  selectedRegion === 'TR' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                }`}
              >
                <span>Турция</span>
                <span className="text-sm">🇹🇷</span>
              </button>
              <button
                onClick={() => setSelectedRegion('UA')}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  selectedRegion === 'UA' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                }`}
              >
                <span>Украина</span>
                <span className="text-sm">🇺🇦</span>
              </button>
            </div>
          )}

          {/* Period Selector (Only for PS Plus and EA Play) */}
          {activeTab !== 'P3_SHARING' && (
            <div className="bg-ps-navy/40 p-1 rounded-xl border border-white/5 flex w-full sm:w-auto">
              {["1", "3", "12"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 px-6 py-2.5 rounded-lg text-xs font-black transition-all ${
                    period === p ? "bg-ps-blue text-white shadow-sm" : "text-white/40 hover:text-white"
                  }`}
                >
                  {p === "1" ? "1 месяц" : p === "3" ? "3 месяца" : "12 месяцев"}
                </button>
              ))}
            </div>
          )}

          {/* Platform Selector (Only for P3 Sharing) */}
          {activeTab === 'P3_SHARING' && (
            <div className="bg-ps-navy/40 p-1 rounded-xl border border-white/5 flex w-full max-w-md shadow-inner">
              <button
                onClick={() => setSelectedPlatform('PS4')}
                className={`flex-1 py-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  selectedPlatform === 'PS4' ? "bg-ps-blue text-white shadow-md shadow-ps-blue/20" : "text-white/40 hover:text-white"
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                PlayStation 4 🎮
              </button>
              <button
                onClick={() => setSelectedPlatform('PS5')}
                className={`flex-1 py-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  selectedPlatform === 'PS5' ? "bg-ps-blue text-white shadow-md shadow-ps-blue/20" : "text-white/40 hover:text-white"
                }`}
              >
                <Zap className="w-4 h-4" />
                PlayStation 5 🚀
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Plans */}
      <div className={`grid grid-cols-1 ${filteredPlans.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-ps-blue" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            Нет доступных планов в данном разделе.
          </div>
        ) : filteredPlans.map((plan, i) => {
          const price = getPlanPrice(plan);
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-card p-8 rounded-3xl border flex flex-col justify-between ${
                plan.popular ? "border-ps-blue shadow-[0_0_40px_rgba(37,99,235,0.15)] scale-105 z-10" : "border-white/5"
              }`}
            >
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingSubscription(plan);
                  }}
                  className="absolute top-4 right-4 p-2 z-20 rounded-full bg-ps-dark/80 border border-white/10 hover:text-ps-blue transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              )}

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ps-blue text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-ps-blue/40">
                  Рекомендуем
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center ${plan.glow}`}>
                    {activeTab === 'PS_PLUS' ? <Shield className="text-white w-5 h-5" /> : 
                     activeTab === 'EA_PLAY' ? <Zap className="text-white w-5 h-5" /> : 
                     <Award className="text-white w-5 h-5" />}
                  </div>
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">
                      {price.toLocaleString()} ₽
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {activeTab === 'P3_SHARING' ? '12 мес.' : period === "1" ? "мес" : period === "3" ? "3 мес" : "год"}
                    </span>
                  </div>
                  {activeTab !== 'P3_SHARING' && period === "12" && (
                    <p className="text-xs text-green-500 font-bold mt-2">Экономия до 40%</p>
                  )}
                  {activeTab === 'P3_SHARING' && (
                    <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5" /> Игра на вашем аккаунте
                    </p>
                  )}
                </div>

                <Separator className="bg-white/5 mb-6" />

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/80">
                      <Check className="w-4 h-4 text-ps-blue shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleAddToCart(plan)}
                  className={`flex-1 h-12 text-md font-bold transition-all ${
                    plan.popular 
                      ? "bg-ps-blue hover:bg-ps-glow shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  В корзину
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => toggleFavorite(plan)}
                  className={`h-12 w-12 shrink-0 border-white/10 transition-colors ${
                    hasItem(getPlanId(plan)) 
                      ? 'bg-ps-blue/20 border-ps-blue/50' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${hasItem(getPlanId(plan)) ? 'fill-ps-blue text-ps-blue' : 'text-white/70'}`} />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Info Block at Bottom */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="mt-20 glass-card p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-ps-blue/5 to-transparent"
        >
          <div className="w-16 h-16 bg-ps-blue/10 rounded-2xl flex items-center justify-center shrink-0">
            <Info className="text-ps-blue w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-2">
              {activeTab === 'P3_SHARING' ? "Как устроена система П3 (Шеринг)?" : "Как происходит активация подписки?"}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {activeTab === 'P3_SHARING' ? (
                "Мы предоставляем доступ к специальному аккаунту с подпиской Deluxe (или Deluxe+EA Play). Вы активируете этот аккаунт на вашей консоли (PS4/PS5) как основной (общий доступ), запускаете скачивание игр, а играете, получаете все сохранения и трофеи со своего личного аккаунта! Это абсолютно безопасно, легально и экономит вам до 70% от стандартной стоимости."
              ) : (
                `После оплаты вы передаете данные вашего аккаунта (почта и пароль) выбранного региона (Турция 🇹🇷 или Украина 🇺🇦) нашему оператору в Telegram. Мы заходим в профиль и оплачиваем подписку с личной карты. Весь процесс занимает от 5 до 15 минут. Если у вас еще нет зарубежного аккаунта, мы бесплатно поможем вам его зарегистрировать.`
              )}
            </p>
          </div>
          <a href="https://t.me/Elvin4ik99" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-ps-blue/30 text-ps-blue hover:bg-ps-blue hover:text-white shrink-0 px-8">
              Задать вопрос
            </Button>
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
