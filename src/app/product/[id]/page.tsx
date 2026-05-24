'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/mock-data';
import { 
  ShieldCheck, 
  Zap, 
  Gamepad2, 
  ShoppingCart, 
  Heart,
  ChevronRight,
  Star,
  Send,
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/store/use-cart';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  
  const [selectedPlatform, setSelectedPlatform] = useState(product.platforms[0]);
  const [selectedEdition, setSelectedEdition] = useState("Standard");
  const [activationType, setActivationType] = useState("with-activation");

  const discountedPrice = product.price * (1 - product.discount / 100);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: `${product.name} (${selectedPlatform})`,
      price: product.price,
      discount: product.discount,
      image: product.image,
      platform: selectedPlatform,
      quantity: 1,
    });
    toast.success("Товар добавлен в корзину");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Главная</span> <ChevronRight className="w-3 h-3" />
        <span>Магазин игр</span> <ChevronRight className="w-3 h-3" />
        <span className="text-white">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Gallery & Description */}
        <div className="lg:col-span-7 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ps-dark/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 flex gap-3">
              {product.platforms.map(p => (
                <Badge key={p} className="bg-ps-blue text-white px-3 py-1 font-bold">
                  {p}
                </Badge>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Описание
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Новые эмоции, которые манят пытливых игроков в футбольном симуляторе нового поколения.
              {product.name} — это самый реалистичный опыт, созданный с помощью технологии HyperMotionV, 
              над которой славно потрудились разработчики. Соберите команду мечты и доминируйте на поле.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-center gap-3 text-sm text-white/80">
                <ShieldCheck className="w-4 h-4 text-ps-blue" /> Официальная лицензия
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Globe className="w-4 h-4 text-ps-blue" /> Полностью на русском
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Zap className="w-4 h-4 text-ps-blue" /> Мгновенная активация
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Lock className="w-4 h-4 text-ps-blue" /> Безопасная сделка
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-ps-blue rounded-full" />
              Как скачать игру?
            </h2>
            <div className="space-y-4">
              {[
                "Мы отправим данные нового аккаунта, на который активируем игру.",
                "Войдите в ваш аккаунт PSN и скачайте игру.",
                "Запустите игру на своем основном аккаунте."
              ].map((step, i) => (
                <div key={i} className="flex gap-4 p-4 glass-card rounded-xl border border-white/5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-ps-blue/20 flex items-center justify-center text-ps-blue font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/80">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Info */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold">{product.rating}</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white/10" />
                <span className="text-xs text-muted-foreground">Турция</span>
              </div>

              <div className="space-y-8">
                {/* Platform Switch */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Платформа</p>
                  <div className="grid grid-cols-2 gap-3">
                    {product.platforms.map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                          selectedPlatform === p 
                          ? "bg-ps-blue/20 border-ps-blue text-ps-blue shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
                          : "border-white/5 bg-ps-navy/40 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <Gamepad2 className="w-4 h-4" />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activation Type */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Режим активации</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActivationType("with-activation")}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        activationType === "with-activation" 
                        ? "bg-ps-blue/20 border-ps-blue text-ps-blue" 
                        : "border-white/5 bg-ps-navy/40 text-white/60"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold flex items-center gap-2">
                          С активацией <Badge className="bg-ps-blue/20 text-ps-blue text-[10px] uppercase">Популярно</Badge>
                        </p>
                        <p className="text-[10px] opacity-70">Игра будет доступна на всех ваших аккаунтах</p>
                      </div>
                      <ShieldCheck className={`w-5 h-5 ${activationType === "with-activation" ? "opacity-100" : "opacity-20"}`} />
                    </button>
                    
                    <button
                      onClick={() => setActivationType("no-activation")}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        activationType === "no-activation" 
                        ? "bg-ps-blue/20 border-ps-blue text-ps-blue" 
                        : "border-white/5 bg-ps-navy/40 text-white/60"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold">Без активации</p>
                        <p className="text-[10px] opacity-70">Игра доступна только на купленном аккаунте</p>
                      </div>
                      <Lock className={`w-5 h-5 ${activationType === "no-activation" ? "opacity-100" : "opacity-20"}`} />
                    </button>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-end justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                        {product.price.toLocaleString()} ₽
                      </span>
                      <span className="text-4xl font-black text-white text-glow">
                        {Math.round(discountedPrice).toLocaleString()} ₽
                      </span>
                    </div>
                    <Badge className="bg-red-500 text-white px-3 py-1 font-bold">-{product.discount}%</Badge>
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-ps-blue hover:bg-ps-glow h-14 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    В корзину
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 bg-white/5 hover:bg-ps-blue h-14 text-lg font-bold group"
                  >
                    <Send className="w-5 h-5 mr-2 text-ps-blue group-hover:text-white" />
                    Написать в Telegram
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 glass-card rounded-2xl border border-white/5 grayscale opacity-50">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Mir_logo.svg" alt="Mir" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
