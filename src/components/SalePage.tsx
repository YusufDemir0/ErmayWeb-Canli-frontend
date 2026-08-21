'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, SlidersHorizontal, Star, ShoppingBag, Eye, Heart, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';
import { useCMSStore } from '../stores/useCMSStore';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';

interface SalePageProps {
  initialProducts?: Product[];
}

export const SalePage: React.FC<SalePageProps> = ({
  initialProducts = [],
}) => {
  // Use Firebase-synced products from CMS store
  const firebaseProducts = useCMSStore((state) => state.products);
  const allProducts = firebaseProducts.length > 0 ? firebaseProducts : initialProducts;
  const searchQuery = useUIStore((state) => state.searchQuery);
  const searchCategory = useUIStore((state) => state.searchCategory);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  // --- COUNTDOWN TIMER STATE ---
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay.getTime() - now.getTime();

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- FILTERS STATE ---
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Applied values
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | ''>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | ''>('');

  // --- CATALOG CONTROLS ---
  const [sortBy, setSortBy] = useState<string>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter ONLY discounted items (i.e. originalPrice exists)
  const campaignBaseProducts = allProducts.filter(p => !!p.originalPrice);

  const getDiscountRate = (price: number, originalPrice?: number) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Filter application
  const filteredProducts = campaignBaseProducts.filter((product) => {
    // 1. Navbar Search query matching
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const catSlug = typeof product.category === 'object' && product.category !== null ? product.category.slug : String(product.category || '');
    
    // 2. Navbar Category dropdown matching
    const matchesNavbarCategory = searchCategory === 'all' || catSlug === searchCategory;

    // 3. Sidebar Category matching
    const matchesSidebarCategory = selectedCats.length === 0 || selectedCats.includes(catSlug);

    // 4. Sidebar Price inputs
    const matchesMinPrice = appliedMinPrice === '' || product.price >= appliedMinPrice;
    const matchesMaxPrice = appliedMaxPrice === '' || product.price <= appliedMaxPrice;

    // 5. Sidebar Discount threshold
    const discount = getDiscountRate(product.price, product.originalPrice);
    const matchesDiscount = discount >= minDiscount;

    // 6. Sidebar Stock
    const matchesStock = !inStockOnly || product.inStock;

    return matchesSearch && matchesNavbarCategory && matchesSidebarCategory && matchesMinPrice && matchesMaxPrice && matchesDiscount && matchesStock;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popular') return b.salesCount - a.salesCount;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') {
      const discA = getDiscountRate(a.price, a.originalPrice);
      const discB = getDiscountRate(b.price, b.originalPrice);
      return discB - discA;
    }
    return 0; // default order
  });

  // Pagination bounds
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleCategoryCheckboxChange = (catId: string) => {
    setSelectedCats((prev) => {
      const next = prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId];
      setCurrentPage(1);
      return next;
    });
  };

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCats([]);
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy('default');
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      {/* FLASH CAMPAIGN TICKER */}
      <div className="bg-gradient-to-r from-brand-terracotta to-brand-terracotta-dark text-white py-4 px-4 shadow-sm border-b border-brand-terracotta-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-sm text-[10px] uppercase font-bold tracking-widest animate-pulse">
              Flaş Fırsat
            </span>
            <h2 className="text-sm md:text-base font-medium tracking-wide">
              Seçkin İtalyan & İskandinav Tasarımlarında <strong className="font-extrabold">%30'a Varan Net İndirim</strong>!
            </h2>
          </div>
          
          {/* Countdown Clock */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-light text-neutral-100 uppercase tracking-widest">Kalan Süre:</span>
            <div className="flex gap-1.5 text-xs font-semibold">
              <div className="bg-white text-brand-terracotta px-2.5 py-1.5 rounded-xs shadow-sm flex flex-col items-center">
                <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white font-bold text-center self-center">:</span>
              <div className="bg-white text-brand-terracotta px-2.5 py-1.5 rounded-xs shadow-sm flex flex-col items-center">
                <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white font-bold text-center self-center">:</span>
              <div className="bg-white text-brand-terracotta px-2.5 py-1.5 rounded-xs shadow-sm flex flex-col items-center">
                <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTER SIDEBAR (LEFT) */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-sm border border-neutral-200/60 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-dark flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-camel" />
              Filtreler
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-neutral-400 hover:text-brand-camel underline cursor-pointer"
            >
              Temizle
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6 pb-6 border-b border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Kategoriler</h4>
            <div className="space-y-2">
              {[
                { id: 'living-room', name: 'Oturma Odası' },
                { id: 'bedroom', name: 'Yatak Odası' },
                { id: 'dining', name: 'Yemek Odası' },
                { id: 'accessories', name: 'Aksesuar' }
              ].map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-brand-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(c.id)}
                    onChange={() => handleCategoryCheckboxChange(c.id)}
                    className="h-4 w-4 border-neutral-300 rounded-sm text-brand-camel focus:ring-brand-camel"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6 pb-6 border-b border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Fiyat Aralığı (TL)</h4>
            <form onSubmit={handlePriceFilterSubmit} className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-neutral-200 p-2 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-neutral-200 p-2 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-neutral-100 hover:bg-brand-camel hover:text-white text-neutral-800 text-[10px] uppercase font-bold tracking-wider py-2 rounded-xs transition-colors cursor-pointer"
              >
                Uygula
              </button>
            </form>
          </div>

          {/* Discount Rate Filter */}
          <div className="mb-6 pb-6 border-b border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">İndirim Oranı</h4>
            <div className="space-y-2">
              {[
                { label: 'Tüm İndirimler', value: 0 },
                { label: '%15 ve Üzeri', value: 15 },
                { label: '%20 ve Üzeri', value: 20 },
                { label: '%30 ve Üzeri', value: 30 }
              ].map((rate) => (
                <label key={rate.value} className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-brand-dark cursor-pointer">
                  <input
                    type="radio"
                    name="discount-rate"
                    checked={minDiscount === rate.value}
                    onChange={() => {
                      setMinDiscount(rate.value);
                      setCurrentPage(1);
                    }}
                    className="h-4 w-4 text-brand-camel border-neutral-300 focus:ring-brand-camel"
                  />
                  <span>{rate.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Only Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Sadece Stoktakiler</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 text-brand-camel border-neutral-300 rounded-sm focus:ring-brand-camel"
              />
            </label>
          </div>
        </aside>

        {/* CATALOG AREA (RIGHT) */}
        <main className="lg:col-span-3">
          {/* Header Controls */}
          <div className="bg-white p-4 rounded-sm border border-neutral-200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-neutral-800">İndirimli Ürünler</h3>
              <p className="text-xs text-neutral-400 font-light mt-0.5">{totalItems} kampanya ürünü listeleniyor</p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 whitespace-nowrap">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs border border-neutral-200 p-2 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none bg-white text-neutral-700 cursor-pointer"
                >
                  <option value="default">Varsayılan</option>
                  <option value="price-asc">Fiyata Göre: Artan</option>
                  <option value="price-desc">Fiyata Göre: Azalan</option>
                  <option value="popular">En Çok Satanlar</option>
                  <option value="rating">Değerlendirme Puanı</option>
                  <option value="discount">İndirim Oranı</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-neutral-200 rounded-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-neutral-100 text-brand-camel' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                  aria-label="Izgara Görünümü"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-neutral-200 transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-neutral-100 text-brand-camel' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                  aria-label="Liste Görünümü"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Listings */}
          {totalItems === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-200/60 rounded-sm shadow-xs">
              <HelpCircle className="h-12 w-12 text-neutral-300 mx-auto stroke-[1.5] mb-4" />
              <p className="text-neutral-500 font-light text-sm mb-4">Aradığınız kriterlere uygun indirimli ürün bulunamadı.</p>
              <button
                onClick={handleResetFilters}
                className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-3.5 px-8 transition-colors rounded-sm cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID LAYOUT */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentProducts.map((product) => {
                const discount = getDiscountRate(product.price, product.originalPrice);
                const isFav = favorites.some((fav) => fav.id === product.id);
                return (
                  <div 
                    key={product.id}
                    className="group relative flex flex-col bg-white border border-neutral-200/60 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-neutral-300"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden cursor-pointer" onClick={() => openQuickView(product)}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        <span className="text-[9px] tracking-widest font-bold uppercase py-1 px-2.5 bg-brand-terracotta text-white shadow-sm rounded-xs">
                          %{discount} İndirim
                        </span>
                        {!product.inStock && (
                          <span className="text-[9px] tracking-widest font-semibold uppercase py-1 px-2.5 bg-neutral-600 text-white shadow-sm rounded-xs">
                            Tükendi
                          </span>
                        )}
                      </div>
                      
                      {/* Heart Favorite Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-xs border border-neutral-100 transition-all duration-300 hover:scale-110 cursor-pointer ${
                          isFav ? 'text-brand-terracotta' : 'text-neutral-500 hover:text-brand-camel'
                        }`}
                        aria-label="Favori"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {/* Action Overlays */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickView(product);
                          }}
                          className="flex items-center gap-1.5 bg-white text-neutral-800 text-[10px] tracking-widest font-semibold uppercase py-2.5 px-4 rounded-xs shadow-md transition-all hover:bg-neutral-100 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detay</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.inStock) addToCart(product, 1);
                          }}
                          disabled={!product.inStock}
                          className={`flex items-center gap-1.5 text-white text-[10px] tracking-widest font-semibold uppercase py-2.5 px-4 rounded-xs shadow-md transition-all cursor-pointer ${
                            product.inStock ? 'bg-brand-camel hover:bg-brand-camel-dark' : 'bg-neutral-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>{product.inStock ? 'Ekle' : 'Stok Yok'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">
                          {product.category === 'living-room' && 'Oturma Odası'}
                          {product.category === 'bedroom' && 'Yatak Odası'}
                          {product.category === 'dining' && 'Yemek Odası'}
                          {product.category === 'accessories' && 'Aksesuar'}
                        </span>
                        <h4 
                          onClick={() => openQuickView(product)}
                          className="text-neutral-800 text-sm md:text-base font-normal tracking-wide hover:text-brand-camel transition-colors duration-300 line-clamp-1 cursor-pointer mb-2"
                        >
                          {product.name}
                        </h4>
                      </div>

                      {/* Prices & CTAs */}
                      <div className="mt-2 flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-neutral-400 line-through tracking-wider">
                            {formatPrice(product.originalPrice!)}
                          </span>
                          <span className="text-sm md:text-base font-semibold tracking-wider text-brand-terracotta">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.inStock) addToCart(product, 1);
                          }}
                          disabled={!product.inStock}
                          className={`hidden sm:flex items-center gap-1 border text-[10px] tracking-widest font-semibold uppercase py-2 px-3.5 transition-all duration-300 rounded-xs cursor-pointer ${
                            product.inStock 
                              ? 'border-neutral-200 text-neutral-700 hover:border-brand-camel hover:bg-brand-camel hover:text-white' 
                              : 'border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>{product.inStock ? 'Ekle' : 'Stok Yok'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST LAYOUT */
            <div className="space-y-6">
              {currentProducts.map((product) => {
                const discount = getDiscountRate(product.price, product.originalPrice);
                const isFav = favorites.some((fav) => fav.id === product.id);
                return (
                  <div 
                    key={product.id}
                    className="group relative flex flex-col md:flex-row bg-white border border-neutral-200/60 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-neutral-300"
                  >
                    {/* Left Column: Image Box */}
                    <div className="relative w-full md:w-64 xl:w-72 bg-neutral-50 flex-shrink-0 cursor-pointer" onClick={() => openQuickView(product)}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover aspect-[4/3] md:aspect-auto"
                        loading="lazy"
                      />
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        <span className="text-[9px] tracking-widest font-bold uppercase py-1 px-2.5 bg-brand-terracotta text-white shadow-sm rounded-xs">
                          %{discount} İndirim
                        </span>
                        {!product.inStock && (
                          <span className="text-[9px] tracking-widest font-semibold uppercase py-1 px-2.5 bg-neutral-600 text-white shadow-sm rounded-xs">
                            Tükendi
                          </span>
                        )}
                      </div>
                      
                      {/* Heart Favorite Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-xs border border-neutral-100 transition-all duration-300 hover:scale-110 cursor-pointer ${
                          isFav ? 'text-brand-terracotta' : 'text-neutral-500 hover:text-brand-camel'
                        }`}
                        aria-label="Favori"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Right Column: Specifications */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-widest block mb-1">
                              {product.category === 'living-room' && 'Oturma Odası'}
                              {product.category === 'bedroom' && 'Yatak Odası'}
                              {product.category === 'dining' && 'Yemek Odası'}
                              {product.category === 'accessories' && 'Aksesuar'}
                            </span>
                            <h4 
                              onClick={() => openQuickView(product)}
                              className="text-neutral-800 text-base md:text-lg font-normal tracking-wide hover:text-brand-camel transition-colors duration-300 cursor-pointer"
                            >
                              {product.name}
                            </h4>
                          </div>

                          {/* Ratings */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-neutral-700">{product.rating}</span>
                            <span className="text-neutral-300 text-xs">|</span>
                            <span className="text-[10px] text-neutral-400 font-light">({product.reviewsCount} Yorum)</span>
                          </div>
                        </div>

                        {/* Description Text */}
                        <p className="text-xs text-neutral-500 font-light leading-relaxed mb-4 max-w-2xl">
                          {product.description}
                        </p>

                        {/* Material Specs */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-neutral-400 font-light mb-4">
                          <span><strong>Malzeme:</strong> {product.material}</span>
                          <span><strong>Boyutlar:</strong> {product.dimensions}</span>
                        </div>
                      </div>

                      {/* Footer Actions / Price row */}
                      <div className="border-t border-neutral-100 pt-4 flex items-center justify-between gap-4">
                        <div className="flex items-end gap-3">
                          <span className="text-xs text-neutral-400 line-through tracking-wider">
                            {formatPrice(product.originalPrice!)}
                          </span>
                          <span className="text-lg font-bold tracking-wider text-brand-terracotta">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm font-semibold">
                            Tasarruf: {formatPrice(product.originalPrice! - product.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openQuickView(product)}
                            className="flex items-center gap-1.5 border border-neutral-200 text-neutral-700 hover:text-brand-dark hover:border-brand-dark text-xs tracking-wider uppercase font-semibold py-2.5 px-4 transition-all duration-300 rounded-xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Hızlı Bakış</span>
                          </button>
                          <button
                            onClick={() => {
                              if (product.inStock) addToCart(product, 1);
                            }}
                            disabled={!product.inStock}
                            className={`flex items-center gap-1.5 text-white text-xs tracking-wider uppercase font-semibold py-2.5 px-5 transition-all duration-300 rounded-xs shadow-xs cursor-pointer ${
                              product.inStock 
                                ? 'bg-brand-dark hover:bg-brand-camel' 
                                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                            }`}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>{product.inStock ? 'Sepete Ekle' : 'Stok Dışı'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xs border border-neutral-200 flex items-center justify-center transition-all ${
                  currentPage === 1 
                    ? 'text-neutral-300 bg-white cursor-not-allowed' 
                    : 'text-neutral-600 hover:bg-neutral-100 bg-white hover:text-brand-dark cursor-pointer'
                }`}
                aria-label="Önceki Sayfa"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-xs border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-brand-camel border-brand-camel text-white shadow-xs' 
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-brand-dark'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xs border border-neutral-200 flex items-center justify-center transition-all ${
                  currentPage === totalPages 
                    ? 'text-neutral-300 bg-white cursor-not-allowed' 
                    : 'text-neutral-600 hover:bg-neutral-100 bg-white hover:text-brand-dark cursor-pointer'
                }`}
                aria-label="Sonraki Sayfa"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SalePage;
