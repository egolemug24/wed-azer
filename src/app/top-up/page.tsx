'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Zap, ShieldCheck, CreditCard, ChevronRight, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/use-auth';

const topUpOptionsTr = [
  250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000
];

type Region = 'TR' | 'UA';

export default function TopUpPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>('TR');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [uahAmount, setUahAmount] = useState("");
  const [tryAmount, setTryAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({ rateUah: 2.5, rateTry: 3.0 });
  const [savingSettings, setSavingSettings] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data && data.rateUah && data.rateTry) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, []);

  const calculateFinalAmount = () => {
    if (selectedRegion === 'TR') {
      if (tryAmount) return Number(tryAmount) * settings.rateTry;
      return (selectedAmount || 0) * settings.rateTry;
    }
    if (selectedRegion === 'UA') {
      return (Number(uahAmount) || 0) * settings.rateUah;
    }
    return 0;
  };

  const isAmountInvalid = () => {
    if (selectedRegion === 'TR') {
      const trVal = tryAmount ? Number(tryAmount) : (selectedAmount || 0);
      return trVal > 0 && trVal < 250;
    }
    if (selectedRegion === 'UA') {
      const uaVal = Number(uahAmount) || 0;
      return uaVal > 0 && uaVal < 250;
    }
    return false;
  };

  const finalAmount = calculateFinalAmount();

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateUah: settings.rateUah, rateTry: settings.rateTry })
      });
      if (!res.ok) throw new Error('Ошибка');
      alert('Курсы валют успешно обновлены!');
    } catch (error) {
      alert('Не удалось обновить курсы');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePayment = async () => {
    if (finalAmount <= 0) return;

    if (selectedRegion === 'TR') {
      const trVal = tryAmount ? Number(tryAmount) : (selectedAmount || 0);
      if (trVal < 250) {
        alert('Минимальная сумма пополнения — 250 TL');
        return;
      }
    } else if (selectedRegion === 'UA') {
      const uaVal = Number(uahAmount) || 0;
      if (uaVal < 250) {
        alert('Минимальная сумма пополнения — 250 UAH');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Перенаправляем на кассу
      } else {
        alert(data.error || 'Ошибка создания платежа');
        setIsLoading(false);
      }
    } catch (error) {
      alert('Ошибка соединения с сервером');
      setIsLoading(false);
    }
  };

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
              Пополните баланс своего аккаунта , для мгновенных покупок игр / дополнений на PlayStation
            </p>
          </div>

          {isAdmin && (
            <div className="glass-card p-6 rounded-2xl border border-ps-blue/30 bg-ps-blue/5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-ps-blue" />
                Админ: Быстрое изменение курсов
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-bold uppercase">Курс TRY к RUB</label>
                  <Input 
                    type="number" step="0.1" 
                    value={settings.rateTry} 
                    onChange={(e) => setSettings({...settings, rateTry: Number(e.target.value)})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-bold uppercase">Курс UAH к RUB</label>
                  <Input 
                    type="number" step="0.1" 
                    value={settings.rateUah} 
                    onChange={(e) => setSettings({...settings, rateUah: Number(e.target.value)})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={savingSettings} size="sm" className="bg-ps-blue hover:bg-ps-glow">
                {savingSettings ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex rounded-xl border border-white/10 overflow-hidden bg-white/5 p-1 max-w-md">
                <button
                  onClick={() => { setSelectedRegion('TR'); setSelectedAmount(null); setTryAmount(''); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedRegion === 'TR' ? 'bg-ps-blue text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  Турция 🇹🇷
                </button>
                <button
                  onClick={() => { setSelectedRegion('UA'); setSelectedAmount(null); setUahAmount(''); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedRegion === 'UA' ? 'bg-ps-blue text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  Украина 🇺🇦
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Выберите сумму пополнения
            </h3>



            <AnimatePresence mode="wait">
              {selectedRegion === 'TR' && (
                <motion.div key="tr" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {topUpOptionsTr.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {setSelectedAmount(amount); setTryAmount("");}}
                        className={`relative p-4 rounded-2xl border transition-all text-center group ${
                          selectedAmount === amount 
                          ? "bg-ps-blue/20 border-ps-blue shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
                          : "bg-ps-navy/40 border-white/5 hover:border-ps-blue/30"
                        }`}
                      >
                        <p className="text-xl font-black mb-1">{amount} TL</p>
                        <p className="text-[10px] text-white/50">{amount * settings.rateTry} ₽</p>
                      </button>
                    ))}
                  </div>

                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">Своя сумма в лирах (TRY)</label>
                        <div className="relative">
                          <Input 
                            placeholder="Минимум 250 TL" 
                            type="number"
                            className={`pl-4 pr-12 h-14 text-lg bg-white/5 ${
                              tryAmount && Number(tryAmount) < 250 ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                            }`}
                            value={tryAmount}
                            onChange={(e) => {setTryAmount(e.target.value); setSelectedAmount(null);}}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-white/50">₺</span>
                        </div>
                        {tryAmount && Number(tryAmount) < 250 && (
                          <p className="text-xs text-red-400 font-medium">Минимальная сумма пополнения — 250 TL</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">К оплате (RUB)</label>
                        <div className="relative">
                          <Input 
                            readOnly
                            className="pl-4 pr-12 h-14 text-lg bg-ps-blue/10 border-ps-blue/30 text-ps-blue font-bold"
                            value={calculateFinalAmount()}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-ps-blue">₽</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedRegion === 'UA' && (
                <motion.div key="ua" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white/70">Сумма в гривнах (UAH)</label>
                      <div className="relative">
                        <Input 
                          placeholder="Минимум 250 UAH" 
                          type="number"
                          className={`pl-4 pr-12 h-14 text-lg bg-white/5 ${
                            uahAmount && Number(uahAmount) < 250 ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                          }`}
                          value={uahAmount}
                          onChange={(e) => setUahAmount(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-white/50">₴</span>
                      </div>
                      {uahAmount && Number(uahAmount) < 250 && (
                        <p className="text-xs text-red-400 font-medium">Минимальная сумма пополнения — 250 UAH</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white/70">К оплате (RUB)</label>
                      <div className="relative">
                        <Input 
                          readOnly
                          className="pl-4 pr-12 h-14 text-lg bg-ps-blue/10 border-ps-blue/30 text-ps-blue font-bold"
                          value={calculateFinalAmount()}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-ps-blue">₽</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                onClick={handlePayment}
                disabled={finalAmount <= 0 || isAmountInvalid() || isLoading}
                className="w-full bg-ps-blue hover:bg-ps-glow h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                {isLoading ? 'Перенаправление...' : `Оплатить ${finalAmount.toLocaleString()} ₽`}
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
