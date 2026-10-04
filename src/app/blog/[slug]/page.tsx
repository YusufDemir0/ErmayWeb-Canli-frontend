import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, ChevronRight, MessageSquare } from 'lucide-react';
import apiClient from '../../../services/api';
import type { BlogPost } from '../../../types';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiClient.get<{ success: boolean; post: BlogPost }>(`/blogs/${slug}`);
    const post = res.data?.post;

    if (!post) {
      return {
        title: 'Blog Yazısı Bulunamadı | Ermay Mobilya',
      };
    }

    return {
      title: `${post.title} | Ermay Mobilya Blog`,
      description: post.summary || `${post.title} hakkında detaylı mimari rehber ve dekorasyon tüyoları.`,
      keywords: post.tags?.join(', ') || 'ahşap mobilya, modoko, dekorasyon, ofis tasarımı',
      openGraph: {
        title: `${post.title} | Ermay Mobilya`,
        description: post.summary || post.title,
        url: `https://ermaymobilya.com/blog/${post.slug}`,
        siteName: 'Ermay Mobilya',
        images: post.coverImage ? [{ url: post.coverImage }] : undefined,
        locale: 'tr_TR',
        type: 'article',
      },
      alternates: {
        canonical: `https://ermaymobilya.com/blog/${post.slug}`,
      },
    };
  } catch {
    return { title: 'Blog | Ermay Mobilya' };
  }
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  let post: BlogPost | null = null;

  try {
    const res = await apiClient.get<{ success: boolean; post: BlogPost }>(`/blogs/${slug}`);
    if (res.data?.success && res.data.post) {
      post = res.data.post;
    }
  } catch (err) {
    console.warn('Blog post fetch error:', err);
  }

  if (!post) {
    notFound();
  }

  // Schema.org Article Schema for Rich AI Engine Knowledge Extraction
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image: post.coverImage || 'https://ermaymobilya.com/default-furniture.webp',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author || 'Ermay Mobilya Mimari Ekibi',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ermay Mobilya',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ermaymobilya.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ermaymobilya.com/blog/${post.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://ermaymobilya.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://ermaymobilya.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://ermaymobilya.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <article className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-mono">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <Link href="/blog" className="hover:text-neutral-900 transition-colors">Blog</Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-900 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article Header Card */}
        <header className="space-y-6 mb-10">
          {post.category && (
            <span className="inline-block px-3 py-1 bg-[#C5A880]/15 text-[#8C6D46] border border-[#C5A880]/30 text-[11px] font-bold uppercase tracking-widest rounded-xs">
              {post.category}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-neutral-900 leading-tight">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed border-l-2 border-[#C5A880] pl-4 italic">
              {post.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-neutral-200/80 text-xs text-neutral-500">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <User className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>{post.author || 'Ermay Mobilya Mimari Ekibi'}</span>
              </span>

              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>

              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                <span>{post.readTimeMin || 4} dakika okuma</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/905324194151?text=${encodeURIComponent(`Merhaba, "${post.title}" başlıklı blog yazınızı okudum, bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs transition-colors font-bold text-xs shadow-2xs"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Mimara Danış</span>
              </a>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-16/9 rounded-xs overflow-hidden mb-12 shadow-md border border-neutral-200/80 bg-neutral-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="bg-white p-6 sm:p-10 lg:p-12 rounded-xs border border-neutral-200/80 shadow-xs mb-12 space-y-6">
          <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line font-light">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 border-t border-neutral-100 flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-neutral-400 mr-1" />
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs rounded-xs font-mono transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA & Back Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border border-[#C5A880]/30 rounded-xs shadow-xs">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 hover:text-[#8C6D46] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tüm Blog Yazılarına Dön</span>
          </Link>

          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold rounded-xs transition-colors shadow-2xs"
          >
            <span>Koleksiyonu Keşfet</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
