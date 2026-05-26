'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  Heart,
  PlusCircle,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCart } from '@/store/use-cart';
import { useAuth } from '@/store/use-auth';
import { useFavorites } from '@/store/use-favorites';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Игры', href: '/catalog', icon: Gamepad2 },
  { name: 'Подписки', href: '/subscriptions', icon: PlusCircle },
  { name: 'Пополнение', href: '/top-up', icon: Wallet },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { items: cartItems } = useCart();
  const { items: favoriteItems } = useFavorites();
  const { user, isAuthenticated, openAuthModal, logout, checkSession } = useAuth();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const favoritesCount = favoriteItems.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchVal.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 lg:px-8",
        isScrolled ? "glass border-b border-white/10 py-2" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-ps-blue rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] group-hover:scale-110 transition-transform">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            ElStore-<span className="text-ps-blue">PlayStation</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "relative text-sm font-medium hover:text-ps-blue transition-colors",
                  pathname === link.href ? "text-ps-blue" : "text-foreground/80"
                )}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-ps-blue shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                  />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
          <Input 
            placeholder="Поиск игр..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-ps-navy/50 border-white/10 focus:border-ps-blue/50 focus:ring-1 focus:ring-ps-blue/20 pl-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" onClick={handleSearchSubmit} />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="relative hover:text-ps-blue rounded-full">
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ps-blue text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                  {favoritesCount}
                </span>
              )}
            </Button>
          </Link>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:text-ps-blue rounded-full">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ps-blue text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/profile" className="text-sm font-medium hover:text-ps-blue transition-colors cursor-pointer">
                {user?.name || user?.email}
              </Link>
              <Button onClick={() => { logout(); router.push('/'); }} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                Выйти
              </Button>
            </div>
          ) : (
            <Button onClick={openAuthModal} className="bg-ps-blue hover:bg-ps-glow text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] px-6 hidden sm:flex">
              <User className="w-4 h-4 mr-2" />
              Войти
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                <Menu className="w-6 h-6" />
              </Button>
            } />
            <SheetContent side="right" className="bg-ps-dark border-white/10 w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-ps-blue rounded-lg flex items-center justify-center">
                    <Gamepad2 className="text-white w-5 h-5" />
                  </div>
                  <span>ElStore-PlayStation</span>
                </SheetTitle>
              </SheetHeader>
              {/* Search Bar - Mobile */}
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <Input 
                  placeholder="Поиск игр..." 
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="bg-ps-navy/50 border-white/10 focus:border-ps-blue/50 focus:ring-1 focus:ring-ps-blue/20 pl-10 h-10 w-full text-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </form>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg h-12"
                    >
                      <link.icon className="w-5 h-5 mr-3 text-ps-blue" />
                      {link.name}
                    </Button>
                  </Link>
                ))}
                <div className="mt-8 pt-8 border-t border-white/10">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <Link href="/profile" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-ps-blue h-12 text-lg">
                          <User className="w-5 h-5 mr-3" />
                          Личный кабинет
                        </Button>
                      </Link>
                      <Button onClick={() => { setIsMobileMenuOpen(false); logout(); router.push('/'); }} variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 h-12 text-lg">
                        Выйти
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal();
                      }} 
                      className="w-full bg-ps-blue h-12 text-lg"
                    >
                      <User className="w-5 h-5 mr-3" />
                      Войти
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
