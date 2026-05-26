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
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Smart Search function with layout transliteration and game aliases
function smartSearch(products: any[], query: string) {
  if (!query) return products;
  
  const cleanQuery = query.toLowerCase().trim();
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
  if (queryWords.length === 0) return products;

  // Common aliases for games to bridge English/Russian naming gaps
  const aliases: { [key: string]: string[] } = {
    'spider-man': ['человек-паук', 'паук', 'человек паук', 'spiderman', 'spider'],
    'spider': ['spider-man', 'человек-паук', 'паук', 'человек паук', 'spiderman'],
    'spiderman': ['spider-man', 'человек-паук', 'паук', 'человек паук'],
    'человек-паук': ['spider-man', 'паук', 'spiderman', 'spider'],
    'человек паук': ['spider-man', 'паук', 'spiderman', 'spider'],
    'паук': ['spider-man', 'spiderman', 'человек-паук', 'spider'],
    'witcher': ['ведьмак', 'w3', 'дикая охота'],
    'ведьмак': ['witcher', 'w3', 'дикая охота'],
    'god of war': ['бог войны', 'кратос', 'gow', 'рагнарек', 'рагнарёк', 'ragnarok'],
    'бог войны': ['god of war', 'кратос', 'gow', 'ragnarok'],
    'gow': ['god of war', 'бог войны', 'кратос', 'ragnarok', 'рагнарек', 'рагнарёк'],
    'elden': ['элден', 'елден', 'кольцо'],
    'элден': ['elden', 'кольцо'],
    'елден': ['elden', 'кольцо'],
    'fc': ['fifa', 'фифа', 'футбол', 'football', 'soccer', 'ea sports'],
    'fifa': ['fc', 'фифа', 'футбол', 'football'],
    'фифа': ['fc', 'fifa', 'футбол'],
    'футбол': ['fc', 'fifa', 'ea sports', 'football'],
    'gta': ['grand theft auto', 'гта'],
    'гта': ['gta', 'grand theft auto'],
    'rdr': ['red dead redemption', 'рдр'],
    'рдр': ['rdr', 'red dead redemption'],
    'cyberpunk': ['киберпанк', '2077'],
    'киберпанк': ['cyberpunk', '2077'],
    'хоррор': ['horror', 'ужасы', 'resident evil', 'silent hill', 'outlast'],
    'гонки': ['racing', 'cars', 'need for speed', 'nfs', 'crew', 'motogp'],
    'спорт': ['sports', 'fc', 'fifa', 'ufc', 'nba', 'nhl'],
  };

  // Keyboard layout translation helper (Qwerty <-> Йцукен)
  const keyboardMap: { [key: string]: string } = {
    'q':'й', 'w':'ц', 'e':'у', 'r':'к', 't':'е', 'y':'н', 'u':'г', 'i':'ш', 'o':'щ', 'p':'з', '[':'х', ']':'ъ',
    'a':'ф', 's':'ы', 'd':'в', 'f':'а', 'g':'п', 'h':'р', 'j':'о', 'k':'л', 'l':'д', ';':'ж', "'":'э',
    'z':'я', 'x':'ч', 'c':'с', 'v':'м', 'b':'и', 'n':'т', 'm':'ь', ',':'б', '.':'ю',
    'й':'q', 'ц':'w', 'у':'e', 'к':'r', 'е':'t', 'н':'y', 'г':'u', 'ш':'i', 'щ':'o', 'з':'p', 'х':'[', 'ъ':']',
    'ф':'a', 'ы':'s', 'в':'d', 'а':'f', 'п':'g', 'р':'h', 'о':'j', 'л':'k', 'д':'l', 'ж':';', 'э':"'",
    'я':'z', 'ч':'x', 'с':'c', 'м':'v', 'и':'b', 'т':'n', 'ь':'m', 'б':',', 'ю':'.'
  };

  const translateLayout = (text: string) => {
    return text.split('').map(char => keyboardMap[char] || char).join('');
  };

  const translatedQuery = translateLayout(cleanQuery);
  const translatedQueryWords = translatedQuery.split(/\s+/).filter(w => w.length > 0);

  // Score each product
  const scored = products.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const platforms = (p.platforms || []).map((pl: string) => pl.toLowerCase());

    // 1. Exact matches
    if (name === cleanQuery || name === translatedQuery) {
      score += 200;
    } else if (name.includes(cleanQuery) || name.includes(translatedQuery)) {
      score += 100;
    }

    // 2. Word matches and alias checks
    const checkWordMatch = (word: string) => {
      let wordScore = 0;
      
      // Match in name
      if (name.includes(word)) {
        wordScore += 30;
      }
      
      // Match in aliases
      for (const [key, aliasList] of Object.entries(aliases)) {
        if (word === key || name.includes(key)) {
          for (const alias of aliasList) {
            if (name.includes(alias) || word === alias) {
              wordScore += 25;
            }
          }
        }
      }

      // Match in description
      if (desc.includes(word)) {
        wordScore += 10;
      }

      // Match in category
      if (cat.includes(word)) {
        wordScore += 15;
      }

      // Match in platform
      if (platforms.includes(word)) {
        wordScore += 5;
      }

      return wordScore;
    };

    // Calculate score based on original query words
    queryWords.forEach(word => {
      score += checkWordMatch(word);
    });

    // Calculate score based on layout-translated query words
    if (cleanQuery !== translatedQuery) {
      translatedQueryWords.forEach(word => {
        score += checkWordMatch(word) * 0.8;
      });
    }

    return { product: p, score };
  });

  // Filter and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}

function CatalogContent() {
  const [selectedCategory, setSelectedCategory] = useState("Все игры");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);
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
  }, [selectedCategory, selectedPlatform, searchQuery, sortBy]);

  // 1. Filter products by category and platform
  const baseFiltered = products.filter(p => {
    const matchesCategory = selectedCategory === "Все игры" || p.category === selectedCategory;
    const matchesPlatform = selectedPlatform ? p.platforms?.includes(selectedPlatform) : true;
    return matchesCategory && matchesPlatform;
  });

  // 2. Perform smart search (scoring, filtering by keyword matches, sorting by relevance)
  let searchedProducts = baseFiltered;
  if (searchQuery.trim()) {
    searchedProducts = smartSearch(baseFiltered, searchQuery);
  }

  // 3. Apply secondary sorting if chosen
  const sortedProducts = [...searchedProducts];
  if (!searchQuery.trim() || sortBy !== "popularity") {
    sortedProducts.sort((a, b) => {
      const priceA = a.price * (1 - a.discount / 100);
      const priceB = b.price * (1 - b.discount / 100);
      
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "discount") return b.discount - a.discount;
      // Default: popularity (rating descending)
      return b.rating - a.rating;
    });
  }

  const filteredProducts = sortedProducts;

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
                    {sortBy === "popularity" && "По популярности"}
                    {sortBy === "price-asc" && "Сначала дешевле"}
                    {sortBy === "price-desc" && "Сначала дороже"}
                    {sortBy === "discount" && "По скидке"}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-ps-navy border-white/10 text-white w-[160px]">
                  <DropdownMenuItem className="hover:bg-ps-blue/20 cursor-pointer font-medium" onClick={() => setSortBy("popularity")}>По популярности</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-ps-blue/20 cursor-pointer font-medium" onClick={() => setSortBy("price-asc")}>Сначала дешевле</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-ps-blue/20 cursor-pointer font-medium" onClick={() => setSortBy("price-desc")}>Сначала дороже</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-ps-blue/20 cursor-pointer font-medium" onClick={() => setSortBy("discount")}>По скидке</DropdownMenuItem>
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

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ps-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}

import { Gamepad2, Settings } from 'lucide-react';
