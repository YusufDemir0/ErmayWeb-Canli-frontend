'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  SlidersHorizontal, Star, ShoppingBag, Eye, Heart, 
  ChevronRight, X, Check, Filter, RotateCcw 
} from 'lucide-react';
import type { Product, ProductImages } from '../types';
import { useCMSStore } from '../stores/useCMSStore';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';

interface CategoryPageProps {
  categorySlug: string;
  initialProducts?: Product[];
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  initialProducts = [],
}) => {
  const firebaseProducts = useCMSStore((state) => state.products);
  const firebaseCategories = useCMSStore((state) => state.categories);
  const allProducts = firebaseProducts.length > 0 ? firebaseProducts : initialProducts;
  
  const searchQuery = useUIStore((state) => state.searchQuery);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  // --- FILTERS STATE ---
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>(categorySlug);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | ''>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | ''>('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Available Materials
  const MATERIALS_LIST = [
    'İtalyan Hakiki Derisi',
    'Masif Ceviz Ahşap',
    'Mermer & Pirinç',
    'Ergonomik Kumaş',
    'Ahşap',
  ];

  // Resolve Category Name & Category List
  const categoryList = firebaseCategories.length > 0 ? firebaseCategories : [
    { id: 'cat-1', name: 'Koltuk Takımları', slug: 'koltuk-takimlari', image: '' },
    { id: 'cat-2', name: 'Yemek Odası', slug: 'yemek-odalari', image: '' },
    { id: 'cat-3', name: 'Makam Takımları', slug: 'makam-takimlari', image: '' },
    { id: 'cat-4', name: 'Yatak Odası', slug: 'yatak-odalari', image: '' },
    { id: 'cat-5', name: 'TV Üniteleri', slug: 'tv-uniteleri', image: '' },
    { id: 'cat-6', name: 'Aksesuarlar', slug: 'aksesuarlar', image: '' },
  ];

  const currentCategory = categoryList.find(c => c.slug === selectedCatSlug || c.id === selectedCatSlug);
  const categoryName = currentCategory ? currentCategory.name : (selectedCatSlug === 'hepsi' || selectedCatSlug === 'all' ? 'Tüm Ürünler' : 'Koleksiyonlar');

  // Filter products
  const filteredProducts = allProducts.filter((p) => {
    // Güvenli slug ve ID çözümleme:
    const productCatSlug = typeof p.category === 'object' && p.category !== null
      ? (p.category as { slug?: string }).slug
      : String(p.category || '');

    const pCatId = (p as any).categoryId || (p as any).category_id;

    // 1. Matches Category
    const matchesCategory =
      selectedCatSlug === 'hepsi' ||
      selectedCatSlug === 'all' ||
      productCatSlug === selectedCatSlug ||
      pCatId === selectedCatSlug ||
      (currentCategory && (pCatId === currentCategory.id || productCatSlug === currentCategory.slug));

    // 2. Matches search query
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Price inputs
    const matchesMin = appliedMinPrice === '' || p.price >= appliedMinPrice;
    const matchesMax = appliedMaxPrice === '' || p.price <= appliedMaxPrice;

    // 4. Material filter
    const matchesMaterial = selectedMaterials.length === 0 || selectedMaterials.some(m => p.material?.toLowerCase().includes(m.toLowerCase()));

    // 5. Rating filter
    const matchesRating = minRating === null || p.rating >= minRating;

    // 6. Stock filter
    const matchesStock = !inStockOnly || p.inStock;

    return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesMaterial && matchesRating && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popular') return (b.salesCount || 0) - (a.salesCount || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Pagination
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePriceFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setCurrentPage(1);
  };

  const handleQuickPrice = (min: number | '', max: number | '') => {
    setMinPrice(min);
    setMaxPrice(max);
    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
    setCurrentPage(1);
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCatSlug('hepsi');
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setSelectedMaterials([]);
    setMinRating(null);
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

  const getProductImage = (product: Product): string => {
    if (product.images && typeof product.images === 'object' && 'main' in product.images) {
      return (product.images as ProductImages).main;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '';
  };

  const hasActiveFilters = selectedCatSlug !== 'hepsi' || appliedMinPrice !== '' || appliedMaxPrice !== '' || selectedMaterials.length > 0 || minRating !== null || inStockOnly;

  return (
    <div className="w-full bg-[#FBF9F5] min-h-screen text-neutral-800">
      
      {/* Breadcrumbs & Header */}
      <div className="bg-white border-b border-[#E5DEC9] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-1.5">
            <Link href="/" className="hover:text-[#C5A880] transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-neutral-800 font-semibold">{categoryName}</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 uppercase">
            {categoryName}
          </h1>
        </div>
      </div>

      {/* Main Grid: Left Filters + Right Products (Ref Hepsiburada style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ---------------------------------------------------- */}
        {/* LEFT SIDEBAR FILTER PANEL                             */}
        {/* ---------------------------------------------------- */}
        <aside className="lg:col-span-1 bg-white p-5 rounded-xs border border-[#E5DEC9] shadow-xs space-y-6 h-fit">
          
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#C5A880]" />
              Filtreler
            </span>
            {hasActiveFilters && (
              <button 
                onClick={handleResetFilters}
                className="text-xs text-[#C5A880] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Temizle</span>
              </button>
            )}
          </div>

          {/* 1. Category Tree */}
          <div className="border-b border-[#E5DEC9] pb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Kategoriler
            </h3>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setSelectedCatSlug('hepsi')}
                className={`w-full text-left py-1.5 px-2.5 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCatSlug === 'hepsi' ? 'bg-[#C5A880] text-white font-bold' : 'text-neutral-700 hover:bg-[#FBF9F5]'
                }`}
              >
                <span>Tüm Kategoriler</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              {categoryList.map((cat) => {
                const isSelected = selectedCatSlug === cat.slug || selectedCatSlug === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatSlug(cat.slug || cat.id)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-[#C5A880] text-white font-bold' : 'text-neutral-700 hover:bg-[#FBF9F5]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Price Range Filter */}
          <div className="border-b border-[#E5DEC9] pb-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Fiyat Aralığı (TL)
            </h3>
            
            {/* Quick Price Range Pills */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button
                onClick={() => handleQuickPrice('', 15000)}
                className="px-2.5 py-1 rounded-xs bg-[#FBF9F5] border border-[#E5DEC9] text-neutral-700 hover:border-[#C5A880]"
              >
                0 - 15.000 TL
              </button>
              <button
                onClick={() => handleQuickPrice(15000, 35000)}
                className="px-2.5 py-1 rounded-xs bg-[#FBF9F5] border border-[#E5DEC9] text-neutral-700 hover:border-[#C5A880]"
              >
                15.000 - 35.000 TL
              </button>
              <button
                onClick={() => handleQuickPrice(35000, '')}
                className="px-2.5 py-1 rounded-xs bg-[#FBF9F5] border border-[#E5DEC9] text-neutral-700 hover:border-[#C5A880]"
              >
                35.000 TL +
              </button>
            </div>

            <form onSubmit={handlePriceFilterSubmit} className="space-y-2 pt-1">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="En az"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-[#E5DEC9] p-2 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-[#FBF9F5]"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  placeholder="En çok"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-[#E5DEC9] p-2 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-[#FBF9F5]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs uppercase font-bold tracking-wider py-2 rounded-xs transition-colors cursor-pointer"
              >
                Fiyat Uygula
              </button>
            </form>
          </div>

          {/* 3. Material & Collection Checkboxes */}
          <div className="border-b border-[#E5DEC9] pb-5 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Malzeme / İmalat
            </h3>
            <div className="space-y-2 text-xs">
              {MATERIALS_LIST.map((mat) => {
                const isChecked = selectedMaterials.includes(mat);
                return (
                  <label key={mat} className="flex items-center gap-2.5 cursor-pointer text-neutral-700 hover:text-neutral-900">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMaterial(mat)}
                      className="h-4 w-4 accent-[#C5A880] rounded-xs"
                    />
                    <span>{mat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Rating Filter */}
          <div className="border-b border-[#E5DEC9] pb-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Müşteri Puanı
            </h3>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setMinRating(minRating === 4 ? null : 4)}
                className={`w-full text-left py-1.5 px-2 rounded-xs flex items-center justify-between transition-colors ${
                  minRating === 4 ? 'bg-[#FBF9F5] border border-[#C5A880] font-bold text-[#C5A880]' : 'hover:bg-[#FBF9F5] text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="text-neutral-700 ml-1 text-xs">4.0 ve üzeri</span>
                </div>
              </button>
            </div>
          </div>

          {/* 5. Stock Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Sadece Stoktakiler</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="h-4 w-4 accent-[#C5A880] rounded-xs"
              />
            </label>
          </div>

        </aside>

        {/* ---------------------------------------------------- */}
        {/* RIGHT PRODUCTS & ACTIVE FILTER BAR                    */}
        {/* ---------------------------------------------------- */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Top Sort & Active Filter Bar */}
          <div className="bg-white p-4 rounded-xs border border-[#E5DEC9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="text-center md:text-left">
              <span className="text-xs text-neutral-500 block">Katalog Sonuçları</span>
              <p className="text-sm font-bold text-neutral-900 mt-0.5">{totalItems} Ürün Bulundu</p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-neutral-500 whitespace-nowrap">Sıralama:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-[#E5DEC9] p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-white font-semibold text-neutral-800 cursor-pointer"
              >
                <option value="default">Önerilen Sıralama</option>
                <option value="price-asc">Fiyata Göre: Artan</option>
                <option value="price-desc">Fiyata Göre: Azalan</option>
                <option value="popular">En Çok Satanlar</option>
                <option value="rating">Müşteri Puanı</option>
              </select>
            </div>

          </div>

          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-[#FBF9F5] p-3 rounded-xs border border-[#E5DEC9]">
              <span className="text-[11px] font-bold text-neutral-500 uppercase mr-1">Aktif Filtreler:</span>
              
              {selectedCatSlug !== 'hepsi' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-[#C5A880] text-[#B4966E] px-2.5 py-1 rounded-xs shadow-xs">
                  {categoryName}
                  <X className="h-3 w-3 cursor-pointer hover:text-rose-500" onClick={() => setSelectedCatSlug('hepsi')} />
                </span>
              )}

              {(appliedMinPrice !== '' || appliedMaxPrice !== '') && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-[#C5A880] text-[#B4966E] px-2.5 py-1 rounded-xs shadow-xs">
                  {appliedMinPrice || 0} TL - {appliedMaxPrice || '∞'} TL
                  <X className="h-3 w-3 cursor-pointer hover:text-rose-500" onClick={() => { setAppliedMinPrice(''); setAppliedMaxPrice(''); setMinPrice(''); setMaxPrice(''); }} />
                </span>
              )}

              {selectedMaterials.map(mat => (
                <span key={mat} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-[#C5A880] text-[#B4966E] px-2.5 py-1 rounded-xs shadow-xs">
                  {mat}
                  <X className="h-3 w-3 cursor-pointer hover:text-rose-500" onClick={() => toggleMaterial(mat)} />
                </span>
              ))}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-[#C5A880] text-[#B4966E] px-2.5 py-1 rounded-xs shadow-xs">
                  Stoktakiler
                  <X className="h-3 w-3 cursor-pointer hover:text-rose-500" onClick={() => setInStockOnly(false)} />
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
              >
                Tümünü Temizle
              </button>
            </div>
          )}

          {/* Product Grid */}
          {currentProducts.length === 0 ? (
            <div className="bg-white rounded-xs border border-[#E5DEC9] p-12 text-center space-y-4 shadow-xs">
              <Filter className="h-12 w-12 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800 uppercase">Aramanıza Uygun Ürün Bulunamadı</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
                Filtre parametrelerini değiştirebilir veya temizleyerek tüm ürünleri inceleyebilirsiniz.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-block bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xs transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => {
                const origPrice = product.originalPrice;
                const isDiscounted = !!origPrice && origPrice > product.price;
                const fav = isFavorite(product.id);

                return (
                  <div 
                    key={product.id}
                    className="group relative flex flex-col bg-white border border-[#E5DEC9] rounded-xs overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#C5A880]"
                  >
                    {/* Image */}
                    <Link href={`/urun/${product.id}`} className="relative aspect-[4/3] bg-[#FBF9F5] overflow-hidden block">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-[#E5DEC9] shadow-xs transition-all hover:scale-110 cursor-pointer ${
                          fav ? 'text-rose-500' : 'text-neutral-400 hover:text-[#C5A880]'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
                      </button>
                    </Link>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest block mb-1">
                          {product.material || 'Ermay Özel Tasarım'}
                        </span>
                        <Link 
                          href={`/urun/${product.id}`}
                          className="font-bold text-sm text-neutral-900 hover:text-[#C5A880] transition-colors line-clamp-1 block"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="flex items-end justify-between pt-2 border-t border-[#F4EFE6]">
                        <div>
                          {isDiscounted && (
                            <span className="text-xs text-neutral-400 line-through block">
                              {formatPrice(origPrice)}
                            </span>
                          )}
                          <span className="text-base font-extrabold text-[#C87A53]">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(product, 1)}
                          className="bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Ekle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#C5A880] text-white shadow-xs'
                      : 'bg-white text-neutral-700 border border-[#E5DEC9] hover:bg-[#FBF9F5]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default CategoryPage;
