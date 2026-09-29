import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import apiClient from '../../services/api';
import type { BlogPost } from '../../types';

export const revalidate = 60; // ISR 60 saniye

export const metadata: Metadata = {
  title: 'Blog & Mimari Dekorasyon Rehberi | Ermay Mobilya Modoko',
  description: 'Masif ahşap mobilya bakımı, lüks iç mekan mimari trendleri, Modoko atölye imalat süreçleri ve dekorasyon önerileri. Ermay Mobilya uzman mimari ekibinden rehberler.',
  keywords: 'mobilya blog, masif ahşap bakımı, lüks mobilya trendleri, ofis dekorasyonu, makam odası tasarımı, modoko mobilya atölyesi, ahşap mobilya rehberi, iç mimarlık önerileri',
  openGraph: {
    title: 'Blog & Mimari Dekorasyon Rehberi | Ermay Mobilya',
    description: 'Masif ahşap mobilya bakımı, lüks iç mekan trendleri ve dekorasyon önerileri.',
    url: 'https://ermaymobilya.com/blog',
    siteName: 'Ermay Mobilya',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/blog',
  },
};

export default async function BlogIndexPage() {
  let posts: BlogPost[] = [];

  try {
    const res = await apiClient.get<{ success: boolean; posts: BlogPost[] }>('/blogs?limit=30');
    if (res.data?.success && Array.isArray(res.data.posts)) {
      posts = res.data.posts;
    }
  } catch (err) {
    console.warn('Blog listesi SSR yükleme uyarısı:', err);
  }

  // Schema.org Blog & Collection Schema for AI Engine Crawlers
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Ermay Mobilya Ofis & Çalışma Alanı Rehberi',
    description: 'Ofis mobilyası seçimi, fabrika üretim standartları ve ergonomik çalışma alanı planlamasına dair kapsamlı rehberler.',
    url: 'https://ermaymobilya.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Ermay Mobilya',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ermaymobilya.com/logo.png',
      },
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.summary,
      url: `https://ermaymobilya.com/blog/${p.slug}`,
      datePublished: p.publishedAt,
      author: {
        '@type': 'Person',
        name: p.author || 'Ermay Mobilya Mimari Ekibi',
      },
    })),
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 text-[#8C6D46] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MİMARİ REHBER & BİLGİ BANKASI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-neutral-900 tracking-tight">
            Tasarım, Zanaat ve Dekorasyon
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            Modoko atölyelerimizdeki 40 yıllık masif ahşap ustalığı, ergonomik ofis ve ev mobilyası tasarımları ve yapay zeka destekli mimari trend analizleri.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xs border border-neutral-200/80 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <BookOpen className="h-12 w-12 text-[#C5A880] mx-auto opacity-70" />
            <h2 className="text-lg font-serif font-bold text-neutral-900">Henüz Blog Yazısı Eklenmedi</h2>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Yönetici panelinden yeni blog yazıları ekleyerek arama motorları ve yapay zeka botları için SEO gücünüzü artırabilirsiniz.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold rounded-xs transition-colors"
            >
              <span>Admin Paneline Git</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-neutral-200/80 hover:border-[#C5A880]/70 rounded-xs overflow-hidden flex flex-col transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-lg group"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="block relative aspect-16/10 overflow-hidden bg-neutral-100">
                  <img
                    src={post.coverImage || '/default-furniture.webp'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-neutral-800 uppercase tracking-wider rounded-xs border border-neutral-200/50 shadow-2xs">
                      {post.category}
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTimeMin || 4} dk okuma</span>
                      </div>
                    </div>

                    <h2 className="text-lg font-serif font-bold text-neutral-900 group-hover:text-[#8C6D46] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {post.summary && (
                      <p className="text-xs text-neutral-600 font-light line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author || 'Ermay Mobilya'}</span>
                    </span>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-[#8C6D46] hover:text-neutral-900 font-bold tracking-wide transition-colors group-hover:translate-x-0.5"
                    >
                      <span>Devamını Oku</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
