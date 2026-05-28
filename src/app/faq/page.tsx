'use client';

import React from 'react';
import { HelpCircle, ChevronDown, Zap, ShieldCheck, Gamepad2, Send, Phone } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const VkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 576 512" fill="currentColor">
    <path d="M545 117.7c3.7-12.5 0-21.7-17.4-21.7h-58.9c-14.5 0-21.3 7.7-25 16.1 0 0-30.1 73.3-72.6 120.5-13.8 13.8-20 18-27.5 18-3.7 0-9.2-4.2-9.2-16.1V117.7c0-14.5-4.2-21.7-16.6-21.7H225c-9.2 0-15 6.8-15 13.3 0 13.8 20.8 17 22.9 56V252c0 18.5-3.3 21.7-10.8 21.7-20 0-68.5-73.6-97.3-157.9C121.2 101.4 114.5 96 100 96H41C24.7 96 21.4 103.6 21.4 112c0 14.8 19 88.5 88.5 186.2 46.3 64.8 111.4 100.8 171.1 100.8 35.8 0 40-8 40-21.7v-50.1c0-15.9 3.3-19.1 14.6-19.1 8.3 0 22.9 4.2 56 36.3 38 38 44.3 55.2 65.2 55.2h58.9c16.2 0 24.3-8.1 19.6-24-5.3-17.7-25.2-40.4-51.5-70.2-12.5-14.2-31.5-29.4-37.3-37-8.3-10-6.2-14.2 0-24.2 0 0 65.6-92.4 75-124z"/>
  </svg>
);

const faqs = [
  {
    q: "Как быстро я получу свой товар?",
    a: "В большинстве случаев доставка занимает от 5 до 15 минут после оплаты. В редких случаях (высокая нагрузка или технические работы) время может увеличиться до 2-3 часов."
  },
  {
    q: "Нужно ли мне давать данные от своего аккаунта?",
    a: "Для активации игр и подписок на ваш личный аккаунт нам потребуются данные для входа (email и пароль). Мы гарантируем полную конфиденциальность и безопасность ваших данных. Сразу после активации вы можете сменить пароль."
  },
  {
    q: "Могу ли я играть в игры на своем основном российском аккаунте?",
    a: "Да! Если вы покупаете игру на турецкий аккаунт с активацией, вы сможете играть в нее на своем основном российском аккаунте, получать достижения и играть в онлайне."
  },
  {
    q: "Что делать, если у меня нет турецкого аккаунта?",
    a: "Мы бесплатно поможем вам его создать. Просто напишите нашему оператору в Telegram после оформления заказа."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-glow flex items-center justify-center gap-4">
          <HelpCircle className="text-ps-blue w-12 h-12" />
          Вопросы и ответы
        </h1>
        <p className="text-lg text-muted-foreground">
          Здесь мы собрали ответы на самые частые вопросы наших клиентов.
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <Accordion className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/5 last:border-none">
              <AccordionTrigger className="text-left font-bold py-6 hover:text-ps-blue transition-colors">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-16 text-center space-y-6">
        <h3 className="text-xl font-bold">Остались вопросы?</h3>
        <p className="text-muted-foreground">Наши операторы на связи и готовы помочь вам.</p>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Написать оператору:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              className="bg-[#229ED9] hover:bg-[#229ED9]/90 px-8 h-12 text-base font-bold shadow-[0_0_15px_rgba(34,158,217,0.3)] transition-all hover:scale-105"
              onClick={() => window.open('https://t.me/ElStore_PlayStation', '_blank')}
            >
              <Send className="w-5 h-5 mr-2" /> Telegram
            </Button>
            <Button 
              className="bg-[#0077FF] hover:bg-[#0077FF]/90 px-8 h-12 text-base font-bold shadow-[0_0_15px_rgba(0,119,255,0.3)] transition-all hover:scale-105"
              onClick={() => window.open('https://vk.com/elstore_playstation', '_blank')}
            >
              <VkIcon className="w-5 h-5 mr-2" /> ВКонтакте
            </Button>
            <Button 
              className="bg-[#25D366] hover:bg-[#25D366]/90 px-8 h-12 text-base font-bold shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all hover:scale-105 text-white"
              onClick={() => window.open('https://wa.me/79036388817', '_blank')}
            >
              <Phone className="w-5 h-5 mr-2" /> WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
