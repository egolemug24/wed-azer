'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Send, Mail, Phone, ArrowUp } from 'lucide-react';

const VkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 576 512" fill="currentColor">
    <path d="M545 117.7c3.7-12.5 0-21.7-17.4-21.7h-58.9c-14.5 0-21.3 7.7-25 16.1 0 0-30.1 73.3-72.6 120.5-13.8 13.8-20 18-27.5 18-3.7 0-9.2-4.2-9.2-16.1V117.7c0-14.5-4.2-21.7-16.6-21.7H225c-9.2 0-15 6.8-15 13.3 0 13.8 20.8 17 22.9 56V252c0 18.5-3.3 21.7-10.8 21.7-20 0-68.5-73.6-97.3-157.9C121.2 101.4 114.5 96 100 96H41C24.7 96 21.4 103.6 21.4 112c0 14.8 19 88.5 88.5 186.2 46.3 64.8 111.4 100.8 171.1 100.8 35.8 0 40-8 40-21.7v-50.1c0-15.9 3.3-19.1 14.6-19.1 8.3 0 22.9 4.2 56 36.3 38 38 44.3 55.2 65.2 55.2h58.9c16.2 0 24.3-8.1 19.6-24-5.3-17.7-25.2-40.4-51.5-70.2-12.5-14.2-31.5-29.4-37.3-37-8.3-10-6.2-14.2 0-24.2 0 0 65.6-92.4 75-124z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-ps-dark border-t border-white/5 pt-16 pb-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-ps-blue rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              ElStore-<span className="text-ps-blue">PlayStation</span>
            </span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Ваш надежный проводник в мире цифровых развлечений PlayStation. 
            Игры, подписки и пополнение баланса в одном месте.
          </p>
          <div className="flex gap-4">
            <a href="https://t.me/Elvin4ik99" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-ps-card flex items-center justify-center hover:bg-ps-blue transition-colors group cursor-pointer">
              <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </a>
            <a href="https://vk.ru/stargamer_playstation" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-ps-card flex items-center justify-center hover:bg-ps-blue transition-colors group cursor-pointer">
              <VkIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 rounded-full bg-ps-card flex items-center justify-center hover:bg-ps-blue transition-colors group cursor-pointer">
              <ArrowUp className="w-5 h-5 text-white group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-lg font-semibold mb-6">Категории</h4>
          <ul className="space-y-4">
            <li><Link href="/catalog" className="text-muted-foreground hover:text-ps-blue transition-colors text-sm">Игры PS4 / PS5</Link></li>
            <li><Link href="/subscriptions" className="text-muted-foreground hover:text-ps-blue transition-colors text-sm">Подписки PS Plus</Link></li>
            <li><Link href="/top-up" className="text-muted-foreground hover:text-ps-blue transition-colors text-sm">Пополнение кошелька</Link></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-lg font-semibold mb-6">Информация</h4>
          <ul className="space-y-4">
            <li><Link href="/faq" className="text-muted-foreground hover:text-ps-blue transition-colors text-sm">Как купить?</Link></li>
            <li><Link href="/guarantee" className="text-muted-foreground hover:text-ps-blue transition-colors text-sm">Гарантии</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-6">Поддержка</h4>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-ps-blue shrink-0" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">Elv.ismailov@yandex.ru</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Send className="w-5 h-5 text-ps-blue shrink-0" />
              <div>
                <p className="text-sm font-medium">Telegram</p>
                <p className="text-sm text-muted-foreground">@Elvin4ik99</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-ps-card rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground italic">Поддержка работает: 08:00 - 23:00 МСК</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © 2024 ElStore-PlayStation. Все права защищены. PlayStation, PS5, PS4 являются товарными знаками Sony Interactive Entertainment Inc.
        </p>
        <div className="flex items-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Mir_logo.svg" alt="Mir" className="h-4" />
        </div>
      </div>
    </footer>
  );
}
