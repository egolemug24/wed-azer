'use client';

import React, { useState } from 'react';
import { Heart, Shield, Zap, Star, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
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
}

export default function SubscriptionsPage() {
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

  const getPlanId = (plan: SubscriptionPlan) => `psplus-${plan.name.toLowerCase()}-${period}`;
  
  const handleAddToCart = (plan: SubscriptionPlan) => {
    const price = period === "1" ? plan.price1 : period === "3" ? plan.price3 : plan.price12;
    addToCart({
      id: getPlanId(plan),
      name: `PS Plus ${plan.name} (${period} мес.)`,
      price: price,
      discount: 0,
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg", // Fallback generic logo
      quantity: 1,
    });
    toast.success(`Подписка ${plan.name} добавлена в корзину`);
  };

  const toggleFavorite = (plan: SubscriptionPlan) => {
    const id = getPlanId(plan);
    const price = period === "1" ? plan.price1 : period === "3" ? plan.price3 : plan.price12;
    if (hasItem(id)) {
      removeFav(id);
      toast.success("Удалено из избранного");
    } else {
      addFav({
        id: id,
        name: `PS Plus ${plan.name} (${period} мес.)`,
        price: price,
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg",
        type: 'subscription'
      });
      toast.success("Добавлено в избранное");
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <Badge className="bg-ps-blue mb-4">PlayStation Plus</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-glow">Выберите вашу подписку</h1>
        <p className="text-lg text-muted-foreground">
          Сотни игр, эксклюзивные скидки и сетевая игра. Активация на ваш турецкий аккаунт за 15 минут.
        </p>
        
        <div className="flex items-center justify-center pt-8 gap-4">
          <div className="bg-ps-navy/50 p-1 rounded-2xl border border-white/5 flex">
            {["1", "3", "12"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  period === p ? "bg-ps-blue text-white shadow-lg" : "text-white/40 hover:text-white"
                }`}
              >
                {p} {p === "1" ? "месяц" : p === "3" ? "месяца" : "месяцев"}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button
              onClick={() => setEditingSubscription({})}
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg h-12"
            >
              + Добавить план
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-ps-blue" />
          </div>
        ) : plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative glass-card p-8 rounded-3xl border ${
              plan.popular ? "border-ps-blue shadow-[0_0_40px_rgba(37,99,235,0.1)] scale-105 z-10" : "border-white/5"
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
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ps-blue text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Рекомендуем
              </div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center ${plan.glow}`}>
                <Shield className="text-white w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black">{plan.name}</h3>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">
                  {(period === "1" ? plan.price1 : period === "3" ? plan.price3 : plan.price12).toLocaleString()} ₽
                </span>
                <span className="text-muted-foreground text-sm">/ {period === "1" ? "мес" : period === "3" ? "3 мес" : "год"}</span>
              </div>
              {period === "12" && (
                <p className="text-xs text-green-500 font-bold mt-2">Экономия до 40%</p>
              )}
            </div>

            <Separator className="bg-white/5 mb-8" />

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="w-4 h-4 text-ps-blue" /> {feature}
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleAddToCart(plan)}
                className={`flex-1 h-12 text-lg font-bold ${plan.popular ? "bg-ps-blue hover:bg-ps-glow shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-white/5 hover:bg-white/10 border border-white/10"}`}
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
        ))}
      </div>

      {/* Info Block */}
      <div className="mt-20 glass-card p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-ps-blue/5 to-transparent">
        <div className="w-16 h-16 bg-ps-blue/10 rounded-2xl flex items-center justify-center shrink-0">
          <Info className="text-ps-blue w-8 h-8" />
        </div>
        <div>
          <h4 className="text-xl font-bold mb-2">Как происходит активация?</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            После оплаты вы предоставляете данные вашего турецкого аккаунта (почта и пароль) нашему оператору в Telegram. 
            Мы заходим и оплачиваем подписку с личной карты. Весь процесс занимает от 5 до 15 минут. 
            Если у вас нет турецкого аккаунта, мы бесплатно поможем его создать.
          </p>
        </div>
        <Button variant="outline" className="border-ps-blue/30 text-ps-blue hover:bg-ps-blue hover:text-white shrink-0 px-8">
          Задать вопрос
        </Button>
      </div>
    </div>
  );
}
