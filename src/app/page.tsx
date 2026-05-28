import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/common/ProductGrid";
import { Button } from "@/components/ui/button";
import { Gamepad2, ShieldCheck, Zap, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 pb-20">
      <Hero />
      
      {/* Featured Games */}
      <ProductGrid title="Популярные игры" limit={5} />

      {/* PS Plus Promo */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ps-blue/20 to-ps-navy border border-ps-blue/30 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 md:opacity-100">
             <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
              alt="PS Plus" 
              className="w-full h-full object-cover rounded-l-full"
            />
          </div>
          
          <div className="relative z-10 max-w-xl">
            <Badge className="bg-ps-blue text-white mb-4">Подписки</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow leading-tight">
              Открой сотни игр с <span className="text-ps-blue">PlayStation Plus</span>
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Essential, Extra или Deluxe. Выбери свой уровень доступа к эксклюзивам, классике и сетевой игре.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/subscriptions">
                <Button size="lg" className="bg-ps-blue hover:bg-ps-glow px-8 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  Выбрать тариф
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Zap, title: "Быстрая доставка", desc: "Код или данные аккаунта придут на почту за 5-15 минут." },
          { icon: ShieldCheck, title: "Гарантия 100%", desc: "Мы гарантируем работоспособность каждого проданного товара." },
          { icon: Headphones, title: "Техподдержка", desc: "Живой оператор в Telegram поможет с любым вопросом." },
          { icon: Gamepad2, title: "Огромный выбор", desc: "Более 5000 игр и дополнений в нашем каталоге." },
        ].map((feature, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-ps-blue/20 transition-all group">
            <div className="w-12 h-12 bg-ps-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-ps-blue/20 transition-colors">
              <feature.icon className="w-6 h-6 text-ps-blue" />
            </div>
            <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* New Arrivals */}
      <ProductGrid title="Новинки каталога" />

      {/* SEO Text Section */}
      <section className="py-20 px-4 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <h2 className="text-3xl font-bold mb-8">Купить игры для PlayStation в России</h2>
        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left md:text-center">
          <p>
            Добро пожаловать в GamerPlus — ваш надежный магазин цифровых товаров для консолей PlayStation 4 и PlayStation 5. 
            В условиях ограничений мы помогаем геймерам получать доступ к самым свежим новинкам и любимым хитам.
          </p>
          <p>
            У нас вы можете купить PS Plus любой версии (Essential, Extra, Deluxe) на любой период, пополнить кошелек PS Store 
            подарочными картами или приобрести игры напрямую на ваш аккаунт. Мы работаем с регионами Турция, Украина, Польша и другие.
          </p>
        </div>
      </section>
    </div>
  );
}
