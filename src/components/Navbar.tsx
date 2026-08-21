'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, Heart, ShoppingBag, Phone, Mail,
  MessageSquare, User as UserIcon, Menu, X, ChevronRight, Sparkles 
} from 'lucide-react';
import UpperNavbar from './UpperNavbar';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCMSStore } from '../stores/useCMSStore';
import { useAuthStore } from '../stores/useAuthStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Zustand Store Selectors
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const openCart = useUIStore((state) => state.openCart);
  const openFavorites = useUIStore((state) => state.openFavorites);

  const contactInfo = useCMSStore((state) => state.contactInfo);
  const categories = useCMSStore((state) => state.categories);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Mount & Scroll Listener with Hysteresis for Smooth Sticky Header
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hysteresis prevents flickering/glitching when hovering around the threshold pixel
      if (currentScrollY > 70) {
        setIsScrolled(true);
      } else if (currentScrollY < 20) {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kategori/hepsi?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchInput(false);
    }
  };

  const navLinks = [
    { name: 'ANASAYFA', href: '/' },
    { name: 'KURUMSAL', href: '/kurumsal' },
    { name: 'BAYİLER', href: '/bayiler' },
    { name: 'KATALOG', href: '/katalog' },
    { name: 'İLETİŞİM', href: '/iletisim' },
  ];

  return (
    <>
      <header className="w-full z-40 bg-white sticky top-0 shadow-xs border-b border-neutral-200/70 transition-all duration-300">
        
        {/* 1. CONTINUOUS TICKER MARQUEE (Gradual Smooth Collapse with Zero Glitch) */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isScrolled 
              ? 'max-h-0 opacity-0 pointer-events-none' 
              : 'max-h-12 opacity-100'
          }`}
        >
          <UpperNavbar />
        </div>

        {/* 2. MAIN HEADER ROW (Compact on Scroll) */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-3.5'}`}>
          
          {/* Left: Mobile Hamburger Trigger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-neutral-800 hover:text-[#C5A880] rounded-xs transition-colors cursor-pointer"
              aria-label="Menüyü Aç"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <span className="font-serif font-black text-xl md:text-2xl tracking-tighter text-neutral-900 group-hover:text-[#C5A880] transition-colors">
                ERMAY
              </span>
              <span className="hidden sm:inline-block text-[10px] md:text-xs font-semibold tracking-[0.25em] text-neutral-500 uppercase border-l border-neutral-300 pl-2">
                MOBİLYA
              </span>
            </Link>
          </div>

          {/* Center Main Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-bold tracking-[0.15em] transition-colors duration-200 py-1 border-b-2 uppercase ${
                    isActive
                      ? 'text-[#C5A880] border-[#C5A880]'
                      : 'text-neutral-700 hover:text-[#C5A880] border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Actions & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account Link */}
            <Link
              href={isAuthenticated ? '/hesabim' : '/giris'}
              className="flex items-center gap-1.5 p-2 text-neutral-700 hover:text-[#C5A880] hover:bg-neutral-100/80 rounded-full transition-colors cursor-pointer text-xs font-semibold"
              title={isAuthenticated ? user?.name : 'Giriş Yap'}
            >
              <UserIcon className="h-4 w-4 text-[#C5A880]" />
              {isAuthenticated && (
                <span className="hidden sm:inline-block text-[11px] font-bold text-neutral-800 uppercase tracking-wider max-w-[90px] truncate">
                  {user?.name.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* Expandable Search Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 text-neutral-700 hover:text-[#C5A880] hover:bg-neutral-100/80 rounded-full transition-colors cursor-pointer"
                aria-label="Arama Yap"
              >
                <Search className="h-4 w-4" />
              </button>

              {showSearchInput && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 top-12 z-50 w-72 bg-white text-neutral-900 p-2 rounded-xs shadow-xl border border-neutral-200 flex items-center gap-2 animate-fade-in"
                >
                  <input
                    type="text"
                    placeholder="Koleksiyon veya model ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-xs p-2 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-neutral-900 text-white px-3 py-1.5 text-xs font-semibold rounded-xs hover:bg-[#C5A880] transition-colors"
                  >
                    Ara
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact Form Icon Link */}
            <Link
              href="/iletisim"
              className="p-2 text-neutral-700 hover:text-[#C5A880] hover:bg-neutral-100/80 rounded-full transition-colors hidden sm:flex cursor-pointer"
              title="İletişim & Fabrika Satış Hattı"
            >
              <Mail className="h-4 w-4" />
            </Link>

            {/* Favorites Trigger */}
            <button
              onClick={openFavorites}
              className="p-2 text-neutral-700 hover:text-[#C5A880] hover:bg-neutral-100/80 rounded-full transition-colors relative cursor-pointer"
              aria-label="Favoriler"
            >
              <Heart className="h-4 w-4" />
              {mounted && favoritesCount > 0 && (
                <span className="absolute top-0 right-0 bg-neutral-900 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="p-2 text-neutral-700 hover:text-[#C5A880] hover:bg-neutral-100/80 rounded-full transition-colors relative cursor-pointer"
              aria-label="Sepet"
            >
              <ShoppingBag className="h-4 w-4" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C5A880] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4. SECONDARY CATEGORY SUB-BAR (Refined Clean Luxury) */}
        <div className="bg-[#FAF8F5] border-t border-neutral-200/60 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar text-[10.5px] font-bold uppercase tracking-wider text-neutral-600">
            {categories.map((cat, idx) => {
              const isActive = pathname === `/kategori/${cat.slug}`;
              return (
                <React.Fragment key={cat.id}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className={`transition-colors whitespace-nowrap cursor-pointer ${
                      isActive ? 'text-[#C5A880] font-extrabold' : 'hover:text-[#C5A880]'
                    }`}
                  >
                    {cat.name}
                  </Link>
                  {idx < categories.length - 1 && (
                    <span className="text-neutral-300 text-[8px]">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 5. MOBILE HAMBURGER MENU DRAWER (Full Slide-In Sheet)         */}
      {/* ============================================================ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slide-in">
            {/* Header */}
            <div>
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-[#FAF8F5]">
                <div>
                  <span className="font-serif font-black text-xl tracking-tight text-neutral-900">
                    ERMAY MOBİLYA
                  </span>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                    Lüks Atölye Üretimi
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Nav Links */}
              <div className="p-4 space-y-1">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 block mb-2">
                  Menü
                </span>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
                        isActive ? 'bg-[#FAF8F5] text-[#C5A880]' : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                    </Link>
                  );
                })}
              </div>

              {/* Categories Section */}
              <div className="p-4 border-t border-neutral-100 space-y-1">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 block mb-2">
                  Koleksiyonlar
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 text-xs text-neutral-700 hover:text-[#C5A880] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-3 w-3 text-neutral-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Contact & Account */}
            <div className="p-5 border-t border-neutral-100 bg-[#FAF8F5] space-y-3">
              <a
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp İle Bilgi Alın</span>
              </a>

              <div className="text-[11px] text-neutral-600 space-y-1 pt-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>{contactInfo.phone}</span>
                </p>
                <p className="text-neutral-500 font-light text-[10px]">
                  {contactInfo.showroom}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
