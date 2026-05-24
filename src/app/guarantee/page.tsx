import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Наши гарантии | ElStore-PlayStation',
  description: 'Гарантии надежности при покупке игр и подписок на PlayStation.',
};

export default function GuaranteePage() {
  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3 text-glow">
          <ShieldCheck className="text-ps-blue w-10 h-10" />
          Наши гарантии
        </h1>
        <p className="text-muted-foreground text-lg">
          Ваша безопасность и спокойствие — наш главный приоритет.
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-8 prose prose-invert prose-blue max-w-none">
        
        <section className="bg-ps-blue/10 p-6 rounded-2xl border border-ps-blue/20">
          <h2 className="text-2xl font-bold mt-0 text-white flex items-center gap-2">
            Гарантии при покупке активаций
          </h2>
          <p className="text-white/80">
            После передачи доступа к учётной записи (П3 / П2) у участника есть неограниченное время, чтобы:
          </p>
          <ul className="list-disc pl-5 text-white/80 space-y-1">
            <li>добавить аккаунт на свою консоль</li>
            <li>проверить запуск игры</li>
            <li>убедиться, что всё работает корректно</li>
          </ul>
          <p className="font-bold text-white mt-4">
            Если возникают проблемы — подключается техподдержка.
          </p>
          <p className="text-white/80 mt-2">
            👉 Если проблему не удаётся решить в течение 3 суток (и она не связана с Sony или издателем), мы:
            <br/><span className="text-ps-blue font-bold">заменим позицию или вернём деньги.</span>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">🛠 Гарантии сервиса</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mt-0">1. Не подходит логин / пароль</h3>
              <p className="text-white/70">Если доступ к аккаунту изменился:</p>
              <ul className="list-disc pl-5 text-white/70">
                <li>предоставляем актуальные данные</li>
                <li>находим и исключаем нарушителя</li>
                <li>восстанавливаем доступ</li>
              </ul>
              <p className="mt-3 text-sm"><span className="text-ps-blue font-bold">⏱ Срок решения:</span> до 7 дней</p>
              <p className="text-red-400 font-bold text-sm mt-1">❗ Если восстановить доступ невозможно: 👉 предоставляется замена позиции</p>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mt-0">2. Не получается активировать аккаунт (П3) или включить общий доступ</h3>
              <p className="text-white/70">Если проблема не со стороны Sony:</p>
              <ul className="list-disc pl-5 text-white/70">
                <li>проверяем причину</li>
                <li>выявляем нарушение правил</li>
                <li>исправляем ситуацию</li>
              </ul>
              <p className="mt-3 text-sm"><span className="text-ps-blue font-bold">⏱ Срок решения:</span> до 7 дней</p>
              <p className="text-red-400 font-bold text-sm mt-1">❗ Если решить проблему невозможно: 👉 предоставляется замена позиции</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ps-dark/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0">⏳ Сроки гарантии</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-bold text-ps-blue">🟦 Покупка через менеджера (ЛС):</p>
                <p className="text-white/80">👉 гарантия 12 месяцев</p>
              </div>
              <div>
                <p className="font-bold text-ps-blue">🟦 Покупка через чат:</p>
                <p className="text-white/80">👉 гарантия 1 месяц</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/20 flex flex-col justify-center">
            <p className="text-green-400 font-medium leading-relaxed">
              💬 За всё время работы сервиса никто не потерял доступ к играм при соблюдении правил.
            </p>
            <p className="text-white font-bold mt-4 border-t border-green-500/20 pt-4">
              📌 Важно:<br/>
              Соблюдение правил = гарантия стабильного доступа к играм и защиты ваших покупок
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">⚠️ Что не является гарантийным случаем</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Ограничения со стороны Sony (совместное использование аккаунтов)",
              "Баги и ошибки в играх (по вине разработчика)",
              "Проблемы с PSN (сервера, интернет, временные сбои)",
              "Действия Sony / издателя (блокировки, отмены, регионы)",
              "Ограничения аккаунта или консоли со стороны Sony",
              "Неактивность аккаунта более 6 месяцев 👉 (нужно заходить минимум 1 раз в 6 месяцев)",
              "Отсутствие русского языка 👉 проверяется покупателем до покупки",
              "Недоступность бонусов (Ultimate / Deluxe) на П3 👉 часть бонусов работает только на П2",
              "«Игра не понравилась»",
              "Нарушение правил сервиса"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-red-500/5 p-3 rounded-lg border border-red-500/10 text-sm">
                <span className="text-red-500 mt-0.5">❌</span>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
