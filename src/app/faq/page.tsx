'use client';

import React from 'react';
import { HelpCircle, ChevronDown, Zap, ShieldCheck, Gamepad2, Send } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

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
        <p className="text-muted-foreground">Наши операторы на связи и готовы помочь вам в Telegram.</p>
        <Button 
          className="bg-ps-blue hover:bg-ps-glow px-12 h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          onClick={() => window.open('https://t.me/Elvin4ik99', '_blank')}
        >
          <Send className="w-5 h-5 mr-2" /> Написать оператору
        </Button>
      </div>
    </div>
  );
}
