'use client';

import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  const [email, setEmail] = useState('');
  const [messenger, setMessenger] = useState<'telegram' | 'vk' | 'whatsapp'>('telegram');
  const [messengerContact, setMessengerContact] = useState('');
  const [errors, setErrors] = useState<{ email?: boolean; messengerContact?: boolean }>({});

  const handlePayment = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email.trim());
    const isMessengerContactValid = messengerContact.trim().length > 0;
    
    const newErrors = {
      email: !isEmailValid,
      messengerContact: !isMessengerContactValid
    };
    
    setErrors(newErrors);
    
    if (newErrors.email || newErrors.messengerContact) {
      toast.error("Пожалуйста, заполните обязательные поля корректно");
      return;
    }
    
    toast.success("Заказ оформлен! Перенаправление на оплату...");
  };

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
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  Email для получения товара <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    placeholder="example@mail.com" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: false }));
                    }}
                    className={cn(
                      "pl-10 bg-ps-navy/40 border-white/5 transition-colors",
                      errors.email && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">Пожалуйста, введите корректный email</p>
                )}
              </div>

              {/* Messenger Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  Мессенджер для связи <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'telegram', name: 'Telegram', color: 'hover:border-sky-500/50 has-[input:checked]:border-sky-500 has-[input:checked]:bg-sky-500/10' },
                    { id: 'whatsapp', name: 'WhatsApp', color: 'hover:border-emerald-500/50 has-[input:checked]:border-emerald-500 has-[input:checked]:bg-emerald-500/10' },
                    { id: 'vk', name: 'VK', color: 'hover:border-blue-500/50 has-[input:checked]:border-blue-500 has-[input:checked]:bg-blue-500/10' },
                  ].map((m) => (
                    <label 
                      key={m.id} 
                      className={cn(
                        "glass-card py-3 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-[11px] font-black uppercase tracking-wider",
                        m.color,
                        messenger === m.id ? "border-ps-blue bg-ps-blue/10 text-white" : "text-white/40 hover:text-white/80"
                      )}
                    >
                      <input 
                        type="radio" 
                        name="messenger-type" 
                        value={m.id}
                        checked={messenger === m.id}
                        onChange={() => setMessenger(m.id as any)}
                        className="sr-only" 
                      />
                      {m.id === 'telegram' && (
                        <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.41-1.37-.87.03-.24.36-.49.98-.74 3.82-1.66 6.37-2.75 7.64-3.28 3.64-1.5 4.4-1.76 4.9-.17.1.25.07.69-.19.98z"/>
                        </svg>
                      )}
                      {m.id === 'whatsapp' && (
                        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.479 1.327 4.993L2 22l5.147-1.351c1.47.8 3.12 1.22 4.865 1.22 5.506 0 9.988-4.482 9.988-9.988 0-5.506-4.482-9.988-9.988-9.988zm4.887 13.344c-.213.602-1.234 1.157-1.71 1.205-.457.046-.902.244-2.894-.585-2.544-1.059-4.175-3.666-4.302-3.834-.127-.168-1.045-1.39-1.045-2.654 0-1.264.662-1.885.897-2.13.235-.244.512-.305.682-.305.17 0 .341.002.49.009.155.007.362-.059.567.44.213.518.728 1.782.792 1.912.064.13.107.281.021.452-.086.171-.13.28-.258.428-.128.148-.27.33-.385.442-.128.128-.261.268-.112.525.149.256.662 1.091 1.417 1.762.973.864 1.792 1.134 2.048 1.262.256.128.406.107.556-.064.15-.171.643-.748.814-.997.171-.249.342-.208.577-.121.235.086 1.492.702 1.748.831.256.128.426.192.49.301.064.109.064.63-.149 1.232z"/>
                        </svg>
                      )}
                      {m.id === 'vk' && (
                        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.14 7.66c.11-.36 0-.62-.51-.62h-1.68c-.43 0-.63.23-.74.48 0 0-.86 2.09-2.07 3.44-.39.39-.57.52-.78.52-.11 0-.27-.13-.27-.5V7.66c0-.42-.12-.62-.48-.62H10.1c-.27 0-.43.2-.43.39 0 .4.6.49.66 1.62v2.45c0 .54-.1.64-.31.64-.57 0-1.97-2.1-2.8-4.5-.16-.47-.32-.66-.75-.66H4.78c-.48 0-.58.23-.58.49 0 .46.59 2.74 2.76 5.79 1.45 2.07 3.48 3.2 5.34 3.2 1.11 0 1.25-.25 1.25-.68v-1.51c0-.49.1-.59.45-.59.26 0 .7.13 1.73 1.13 1.18 1.18 1.38 1.72 2.04 1.72h1.68c.48 0 .72-.25.58-.72-.15-.47-.7-.1.15-1.15-1.15-1.28-1.55-1.62-1.92-2.13-.1-.13-.27-.27-.27-.47s.07-.33.27-.6c.2-.27 1.62-2.33 1.78-3.08z"/>
                        </svg>
                      )}
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Messenger Contact Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  {messenger === 'telegram' && "Telegram для связи"}
                  {messenger === 'whatsapp' && "WhatsApp для связи"}
                  {messenger === 'vk' && "VK для связи"}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {messenger === 'telegram' ? (
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  ) : (
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  )}
                  <Input 
                    placeholder={
                      messenger === 'telegram' ? "@username" : messenger === 'vk' ? "id12345 или ссылка" : "+7 (999) 999-99-99"
                    } 
                    value={messengerContact}
                    onChange={(e) => {
                      setMessengerContact(e.target.value);
                      if (errors.messengerContact) setErrors(prev => ({ ...prev, messengerContact: false }));
                    }}
                    className={cn(
                      "pl-10 bg-ps-navy/40 border-white/5 transition-colors focus-visible:ring-ps-blue/20",
                      errors.messengerContact && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>
                {errors.messengerContact && (
                  <p className="text-xs text-red-500 font-medium">Пожалуйста, укажите контактные данные</p>
                )}
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

            <Button 
              onClick={handlePayment}
              className="w-full bg-ps-blue hover:bg-ps-glow h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
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
