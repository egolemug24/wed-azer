'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/store/use-cart';
import { useFavorites } from '@/store/use-favorites';
import { toast } from 'sonner';
import { useAuth } from '@/store/use-auth';
import { useAdmin } from '@/store/use-admin';
import { MoreHorizontal } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    discount: number;
    image: string;
    platforms: string[];
    category: string;
    rating: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { hasItem, addItem: addFav, removeItem: removeFav } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const { setEditingProduct } = useAdmin();
  const isFavorite = hasItem(product.id);
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const discountedPrice = product.price * (1 - product.discount / 100);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorite) {
      removeFav(product.id);
      toast.success("Удалено из избранного");
    } else {
      addFav({
        id: product.id,
        name: product.name,
        price: discountedPrice,
        image: product.image,
        type: 'product',
        category: product.category
      });
      toast.success("Добавлено в избранное");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.image,
      quantity: 1,
    });
    toast.success(`Добавлено в корзину: ${product.name}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative glass-card rounded-2xl overflow-hidden flex flex-col h-full"
    >
      <Link href={`/product/${product.id}`} className="flex flex-col flex-grow">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.platforms.map((p) => (
              <Badge key={p} variant="secondary" className="bg-ps-dark/80 backdrop-blur-md border-white/10 text-[10px] font-bold">
                {p}
              </Badge>
            ))}
            {product.discount > 0 && (
              <Badge className="bg-red-500 text-white border-none text-[10px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {isAdmin && (
              <button
                className="p-2 rounded-full backdrop-blur-md border border-white/10 bg-ps-dark/80 text-white hover:text-ps-blue hover:scale-110 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  setEditingProduct(product);
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
            <button 
              className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-all ${
                isFavorite ? 'bg-ps-blue/80 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-ps-dark/50 text-white/70 hover:text-red-500 hover:scale-110'
              }`}
              onClick={toggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-ps-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-ps-blue rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.8)]">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] text-muted-foreground">{product.rating}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{product.category}</span>
          </div>
          
          <h3 className="font-bold text-sm mb-3 line-clamp-2 group-hover:text-ps-blue transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {product.discount > 0 && (
                <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                  {product.price.toLocaleString()} ₽
                </span>
              )}
              <span className="text-lg font-bold text-white text-glow">
                {Math.round(discountedPrice).toLocaleString()} ₽
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Add to cart button isolated from link */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          onClick={handleAddToCart}
          size="sm" 
          className="bg-ps-blue/10 hover:bg-ps-blue text-ps-blue hover:text-white border border-ps-blue/30 transition-all"
        >
          В корзину
        </Button>
      </div>
    </motion.div>
  );
}
