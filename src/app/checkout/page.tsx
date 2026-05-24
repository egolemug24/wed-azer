'use client';

import React from 'react';
import { useCart } from '@/store/use-cart';
import { 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  ChevronLeft, 
  Mail, 
  Lock,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Ваша корзина пуста</h2>
          <Link href="/catalog">
            <Button className="bg-ps-blue">В каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Назад к корзине
        </Link>
        <h1 className="text-4xl font-black text-glow">Оформление заказа</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Information */}
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Контактные данные
            </h3>
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email для получения товара</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="example@mail.com" className="pl-10 bg-ps-navy/40 border-white/5" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Telegram для связи (необязательно)</label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="@username" className="pl-10 bg-ps-navy/40 border-white/5" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Способ оплаты
            </h3>
            <div className="space-y-4">
              {[
                { name: "Банковская карта (РФ)", desc: "Без комиссии", icon: CreditCard },
                { name: "СБП", desc: "Моментальная оплата", icon: Zap },
                { name: "Криптовалюта", desc: "USDT, BTC, ETH", icon: Lock },
              ].map((method, i) => (
                <label key={i} className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:border-ps-blue/30 transition-all has-[:checked]:border-ps-blue has-[:checked]:bg-ps-blue/5">
                   <input type="radio" name="payment" className="w-4 h-4 accent-ps-blue" defaultChecked={i === 0} />
                   <div className="w-10 h-10 bg-ps-navy rounded-xl flex items-center justify-center">
                     <method.icon className="text-ps-blue w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <p className="font-bold text-sm">{method.name}</p>
                     <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                   </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 glass-card p-8 rounded-3xl border border-ps-blue/20 space-y-6">
            <h2 className="text-xl font-bold">Ваш заказ</h2>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.quantity} шт. • {item.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs">
                      {Math.round(item.price * (1 - item.discount / 100) * item.quantity).toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-white/5" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Итого по товарам</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-green-500 font-bold">
                <span>Скидка по промокоду</span>
                <span>-0 ₽</span>
              </div>
              <div className="flex justify-between text-2xl font-black pt-2">
                <span>К оплате</span>
                <span className="text-ps-blue text-glow">{totalPrice.toLocaleString()} ₽</span>
              </div>
            </div>

            <Button className="w-full bg-ps-blue hover:bg-ps-glow h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              Оплатить заказ
            </Button>

            <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-ps-blue" />
              Безопасная сделка. Оплачивая, вы принимаете условия оферты.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
