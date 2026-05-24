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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Support Channels */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 group hover:border-ps-blue/30 transition-all">
            <div className="w-14 h-14 bg-ps-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-ps-blue/20">
              <Send className="text-ps-blue w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Telegram Поддержка</h3>
              <p className="text-sm text-muted-foreground mb-6">Самый быстрый способ получить помощь по заказу или задать вопрос.</p>
              <Button className="w-full bg-ps-blue hover:bg-ps-glow font-bold">
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

        {/* Company Info */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-ps-blue/5 to-transparent space-y-8">
          <h3 className="text-xl font-bold">Реквизиты</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Название компании</p>
              <p className="text-sm">ИП Иванов Алексей Дмитриевич</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">ИНН</p>
              <p className="text-sm">770123456789</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">ОГРНИП</p>
              <p className="text-sm">320771234567890</p>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Юридический адрес
              </p>
              <p className="text-sm text-muted-foreground">123456, г. Москва, ул. Большая Садовая, д. 10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
