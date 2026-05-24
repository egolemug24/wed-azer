'use client';

import React, { useState } from 'react';
import { Wallet, Zap, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

const topUpOptions = [
  { amount: 500, bonus: 0 },
  { amount: 1000, bonus: 50 },
  { amount: 2500, bonus: 150, popular: true },
  { amount: 5000, bonus: 500 },
  { amount: 10000, bonus: 1200 },
];

export default function TopUpPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const finalAmount = selectedAmount || Number(customAmount) || 0;

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-10">
          <div>
            <h1 className="text-4xl font-black mb-4 flex items-center gap-3 text-glow">
              <Wallet className="text-ps-blue w-10 h-10" />
              Пополнение баланса
            </h1>
            <p className="text-muted-foreground text-lg">
              Пополните баланс личного кабинета для мгновенной оплаты любых товаров в нашем магазине.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Выберите сумму пополнения
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {topUpOptions.map((opt) => (
                <button
                  key={opt.amount}
                  onClick={() => {setSelectedAmount(opt.amount); setCustomAmount("");}}
                  className={`relative p-6 rounded-2xl border transition-all text-center group ${
                    selectedAmount === opt.amount 
                    ? "bg-ps-blue/20 border-ps-blue shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
                    : "bg-ps-navy/40 border-white/5 hover:border-ps-blue/30"
                  }`}
                >
                  {opt.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-ps-blue text-[10px] font-black uppercase px-2 py-0">
                      Хит
                    </Badge>
                  )}
                  <p className="text-2xl font-black mb-1">{opt.amount} ₽</p>
                  {opt.bonus > 0 && (
                    <p className="text-[10px] font-bold text-green-500 uppercase">+{opt.bonus} бонусом</p>
                  )}
                </button>
              ))}
              <div className={`p-6 rounded-2xl border flex flex-col justify-center ${customAmount ? "bg-ps-blue/20 border-ps-blue" : "bg-ps-navy/40 border-white/5"}`}>
                <Input 
                  placeholder="Своя сумма" 
                  type="number"
                  className="bg-transparent border-none text-center text-lg font-bold h-8 focus-visible:ring-0"
                  value={customAmount}
                  onChange={(e) => {setCustomAmount(e.target.value); setSelectedAmount(null);}}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Способ оплаты
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Банковская карта", desc: "Visa, Mastercard, МИР", icon: CreditCard },
                { name: "СБП", desc: "Система Быстрых Платежей", icon: Zap },
              ].map((method, i) => (
                <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:border-ps-blue/50 transition-all group">
                   <div className="w-12 h-12 bg-ps-blue/10 rounded-xl flex items-center justify-center group-hover:bg-ps-blue/20">
                     <method.icon className="text-ps-blue w-6 h-6" />
                   </div>
                   <div>
                     <p className="font-bold">{method.name}</p>
                     <p className="text-xs text-muted-foreground">{method.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
           <div className="sticky top-24 glass-card p-8 rounded-3xl border border-ps-blue/20 space-y-6">
              <h2 className="text-xl font-bold">Детали платежа</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Сумма пополнения</span>
                  <span>{finalAmount.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-sm text-green-500">
                  <span>Комиссия</span>
                  <span>0 ₽</span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between text-2xl font-black">
                  <span>Итого</span>
                  <span className="text-ps-blue text-glow">{finalAmount.toLocaleString()} ₽</span>
                </div>
              </div>

              <Button 
                disabled={finalAmount <= 0}
                className="w-full bg-ps-blue hover:bg-ps-glow h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Оплатить {finalAmount.toLocaleString()} ₽
              </Button>

              <div className="flex flex-col gap-4 pt-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-ps-blue shrink-0" />
                  Все платежи защищены SSL-шифрованием
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Zap className="w-4 h-4 text-ps-blue shrink-0" />
                  Средства поступят на баланс моментально
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
