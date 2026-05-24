'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/store/use-favorites';
import { useCart } from '@/store/use-cart';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FavoritesPage() {
  const { items, removeItem, clearFavorites } = useFavorites();
  const { addItem } = useCart();

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      discount: 0,
      image: item.image,
      quantity: 1,
    });
    toast.success(`Добавлено в корзину: ${item.name}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-white/20" />
          </div>
          <h1 className="text-2xl font-bold mb-4">В избранном пусто</h1>
          <p className="text-muted-foreground mb-8">
            Добавляйте сюда игры и подписки, которые хотите купить позже.
          </p>
          <Link href="/catalog">
            <Button className="w-full bg-ps-blue hover:bg-ps-glow">
              Перейти в каталог
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Избранное</h1>
          <p className="text-muted-foreground mt-2">{items.length} товаров</p>
        </div>
        <Button 
          variant="outline" 
          onClick={clearFavorites}
          className="border-white/10 text-red-500 hover:text-white hover:bg-red-500/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Очистить все
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl overflow-hidden flex flex-col group relative"
          >
            <div className="relative aspect-[16/9] md:aspect-[3/4] overflow-hidden bg-black/50">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {item.type === 'subscription' && (
                <div className="absolute top-2 left-2 bg-ps-blue text-white text-[10px] font-bold px-2 py-1 rounded-md">
                  ПОДПИСКА
                </div>
              )}
              <button 
                onClick={() => {
                  removeItem(item.id);
                  toast.success("Удалено из избранного");
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white/70 hover:text-red-500 transition-colors z-10"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-sm mb-2">{item.name}</h3>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-lg font-bold">{item.price.toLocaleString()} ₽</span>
                <Button 
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  className="bg-ps-blue/10 hover:bg-ps-blue text-ps-blue hover:text-white transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  В корзину
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
