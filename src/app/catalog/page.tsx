'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard } from '@/components/common/ProductCard';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  Plus
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
import { CategoriesModal } from '@/components/admin/CategoriesModal';
import { useAuth } from '@/store/use-auth';
import { useAdmin } from '@/store/use-admin';

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Все игры");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Все игры"]);
  const [loading, setLoading] = useState(true);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const { isAuthenticated, user } = useAuth();
  const { setEditingProduct } = useAdmin();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data);
        }
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(["Все игры", ...cats.map((c: any) => c.name)]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedPlatform, searchQuery]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Все игры" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform ? p.platforms?.includes(selectedPlatform) : true;
    return matchesCategory && matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="font-bold mb-6 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-ps-blue" />
                Категории
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  title="Управление категориями"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
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
              {['PS4', 'PS5'].map(p => (
                <Badge 
                  key={p} 
                  variant={selectedPlatform === p ? "default" : "outline"} 
                  className={`cursor-pointer transition-colors px-4 py-1 ${selectedPlatform === p ? 'bg-ps-blue text-white' : 'hover:border-ps-blue'}`}
                  onClick={() => setSelectedPlatform(prev => prev === p ? null : p)}
                >
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-ps-blue/10 to-transparent">
             <h4 className="font-bold text-sm mb-2">Нужна помощь?</h4>
             <p className="text-xs text-muted-foreground mb-4">Не можете найти игру или возникли вопросы по оплате?</p>
             <Button className="w-full bg-ps-blue hover:bg-ps-glow h-9 text-xs" onClick={() => window.open('https://t.me/Elvin4ik99', '_blank')}>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{selectedCategory}</h2>
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                {filteredProducts.length} товаров
              </span>
              {selectedPlatform && (
                <Badge className="ml-2 bg-ps-blue/20 text-ps-blue hover:bg-ps-blue/30 border-none">
                  Только {selectedPlatform}
                </Badge>
              )}
            </div>
            
            {isAdmin && (
              <Button 
                onClick={() => setEditingProduct({
                  id: '',
                  name: '',
                  description: '',
                  price: 0,
                  discount: 0,
                  image: '',
                  categoryId: '',
                  platform: ['PS5'],
                  isNew: true
                })}
                className="bg-green-600 hover:bg-green-500 text-white font-bold h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить игру
              </Button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-20 text-center glass-card rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-ps-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Загрузка товаров...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, visibleCount).map(product => (
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
          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center pt-10">
              <Button 
                onClick={() => setVisibleCount(prev => prev + 12)}
                variant="outline" 
                className="border-ps-blue/30 text-ps-blue hover:bg-ps-blue hover:text-white px-12 h-12"
              >
                Загрузить еще
              </Button>
            </div>
          )}
        </main>
      </div>

      <CategoriesModal 
        isOpen={isCategoriesModalOpen} 
        onClose={() => setIsCategoriesModalOpen(false)} 
      />
    </div>
  );
}

import { Gamepad2, Settings } from 'lucide-react';
