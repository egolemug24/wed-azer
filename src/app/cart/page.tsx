'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/store/use-cart';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen pb-20 px-4 lg:px-8 max-w-7xl mx-auto pt-10">
      <h1 className="text-3xl font-bold mb-10 flex items-center gap-3">
        <span className="w-2 h-8 bg-ps-blue rounded-full" />
        Корзина
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.platform || "PS4 / PS5"}</p>
                    <p className="text-ps-blue font-bold text-sm">Гарантия активации</p>
                  </div>

                  <div className="flex items-center gap-4 bg-ps-navy/50 p-2 rounded-xl border border-white/5">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:text-ps-blue transition-colors disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:text-ps-blue transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="text-xl font-bold text-glow">
                      {Math.round(item.price * (1 - item.discount / 100) * item.quantity).toLocaleString()} ₽
                    </p>
                    {item.discount > 0 && (
                      <p className="text-xs text-muted-foreground line-through">
                        {(item.price * item.quantity).toLocaleString()} ₽
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="pt-6">
              <Link href="/catalog">
                <Button variant="ghost" className="text-ps-blue hover:bg-ps-blue/10">
                  ← Вернуться к покупкам
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="glass-card p-8 rounded-3xl border border-ps-blue/20 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold mb-4">Итого</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Товары ({items.length})</span>
                  <span>{totalPrice.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-sm text-green-500">
                  <span>Скидка</span>
                  <span>-0 ₽</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-xl font-bold">
                  <span>К оплате</span>
                  <span className="text-ps-blue text-glow">{totalPrice.toLocaleString()} ₽</span>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <Link href="/checkout">
                  <Button className="w-full bg-ps-blue hover:bg-ps-glow h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    Оформить заказ
                  </Button>
                </Link>
                <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-ps-blue" />
                  Безопасная оплата и моментальная доставка
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-dashed border-white/10 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-ps-navy/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Ваша корзина пуста</h2>
          <p className="text-muted-foreground mb-8">Самое время добавить в нее парочку крутых игр!</p>
          <Link href="/catalog">
            <Button className="bg-ps-blue hover:bg-ps-glow px-12 h-12 text-lg">
              Перейти в магазин
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
