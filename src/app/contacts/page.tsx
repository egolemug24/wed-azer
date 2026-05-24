'use client';

import React from 'react';
import { Mail, Send, MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ContactsPage() {
  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-glow">Контакты</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Мы всегда на связи. Выберите удобный способ для связи с нашей поддержкой или ознакомьтесь с информацией о компании.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 group hover:border-ps-blue/30 transition-all">
          <div className="w-14 h-14 bg-ps-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-ps-blue/20">
            <Send className="text-ps-blue w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Telegram Поддержка</h3>
            <p className="text-sm text-muted-foreground mb-6">Самый быстрый способ получить помощь по заказу или задать вопрос.</p>
            <Button className="w-full bg-ps-blue hover:bg-ps-glow font-bold" onClick={() => window.open('https://t.me/Elvin4ik99', '_blank')}>
              Написать в Telegram <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 group hover:border-ps-blue/30 transition-all">
          <div className="w-14 h-14 bg-ps-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-ps-blue/20">
            <Mail className="text-ps-blue w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Электронная почта</h3>
            <p className="text-sm text-muted-foreground mb-6">Для официальных запросов, предложений о сотрудничестве и рекламы.</p>
            <a href="mailto:Elv.ismailov@yandex.ru" className="text-ps-blue font-bold hover:underline block truncate">
              Elv.ismailov@yandex.ru
            </a>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-6 sm:col-span-2">
          <div className="w-14 h-14 bg-ps-blue/10 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="text-ps-blue w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Режим работы</h3>
            <p className="text-sm text-muted-foreground">
              Наша поддержка работает ежедневно с <span className="text-white font-bold">08:00</span> до <span className="text-white font-bold">23:00</span> по московскому времени.
              Заказы принимаются на сайте круглосуточно в автоматическом режиме.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
