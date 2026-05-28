'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, User, Wallet, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-10 pb-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-ps-blue/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-lg w-full p-8 md:p-10 rounded-3xl border border-white/5 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Animated Green Neon Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse" />

        {/* Animated Checkmark Circle */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto w-24 h-24 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </motion.div>

        {/* Success Header */}
        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]">
          Оплата успешна!
        </h1>
        <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-sm mx-auto">
          Средства успешно зачислены на баланс вашего личного кабинета.
        </p>

        {/* Info Card */}
        <div className="glass-card bg-white/5 border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-3.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/50">Статус платежа</span>
            <span className="text-green-400 font-bold flex items-center gap-1.5 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              Выполнено
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/50">Способ оплаты</span>
            <span className="text-white font-medium">Банковская карта / СБП</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/50">Валюта зачисления</span>
            <span className="text-white font-medium">Рубли (₽)</span>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/profile" passHref>
            <Button className="w-full bg-ps-blue hover:bg-ps-glow text-white font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 group">
              <User className="w-4 h-4" />
              В профиль
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="/catalog" passHref>
            <Button variant="outline" className="w-full border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl transition-all flex items-center justify-center gap-2">
              <Gamepad2 className="w-4 h-4 text-ps-blue" />
              В каталог
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
          <Wallet className="w-3.5 h-3.5 text-green-500/70" />
          GamerPlus Secure Checkout
        </div>
      </motion.div>
    </div>
  );
}
