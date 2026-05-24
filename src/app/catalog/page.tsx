'use client';

import React, { useState } from 'react';
import { ProductCard } from '@/components/common/ProductCard';
import { PRODUCTS } from '@/lib/mock-data';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const categories = [
  "Все игры", "Экшен", "RPG", "Спорт", "Приключения", "Хоррор", "Симуляторы"
];

const platforms = ["PS4", "PS5"];

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Все игры");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = selectedCategory === "Все игры" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-ps-blue" />
              Категории
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === cat 
                    ? "bg-ps-blue text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <Separator className="my-6 bg-white/5" />
            
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-ps-blue" />
              Платформа
            </h3>
            <div className="flex gap-2">
              {platforms.map(p => (
                <Badge key={p} variant="outline" className="cursor-pointer hover:border-ps-blue transition-colors px-4 py-1">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-ps-blue/10 to-transparent">
             <h4 className="font-bold text-sm mb-2">Нужна помощь?</h4>
             <p className="text-xs text-muted-foreground mb-4">Не можете найти игру или возникли вопросы по оплате?</p>
             <Button className="w-full bg-ps-blue hover:bg-ps-glow h-9 text-xs">
               Написать в Telegram
             </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск по названию..." 
                className="pl-10 bg-ps-navy/30 border-white/5 focus:border-ps-blue/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Сортировка:</span>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" className="border-white/5 bg-ps-navy/30 gap-2 min-w-[160px] justify-between">
                    По популярности
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-ps-navy border-white/10 text-white w-[160px]">
                  <DropdownMenuItem className="hover:bg-ps-blue/20">По популярности</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-ps-blue/20">Сначала дешевле</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-ps-blue/20">Сначала дороже</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-ps-blue/20">По скидке</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{selectedCategory}</h2>
            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
              {filteredProducts.length} товаров
            </span>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center glass-card rounded-2xl border border-dashed border-white/10">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Ничего не найдено по вашему запросу</p>
              <Button 
                variant="link" 
                className="text-ps-blue mt-2"
                onClick={() => {setSearchQuery(""); setSelectedCategory("Все игры");}}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
          
          {/* Pagination/Load More */}
          {filteredProducts.length > 0 && (
            <div className="flex justify-center pt-10">
              <Button variant="outline" className="border-ps-blue/30 text-ps-blue hover:bg-ps-blue hover:text-white px-12 h-12">
                Загрузить еще
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { Gamepad2 } from 'lucide-react';
