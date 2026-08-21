export interface ProductImages {
  main: string;
  gallery: string[];
}

export interface ProductColorVariant {
  id?: string;
  name: string;
  color?: string; // hex code
  hex?: string;
  image?: string;
  tag?: string;
}

export interface ProductSetPiece {
  id?: string;
  title: string;
  dimensions?: string;
  isOptional?: boolean;
  pieceProductId?: string; // If piece is sold separately, links to real product ID/slug
  pieceProductName?: string;
}

export interface ProductDimensionSpec {
  width?: number;
  depth?: number;
  height?: number;
  raw?: string;
}

export interface Product {
  id: string;
  slug?: string;
  product_id?: string;
  name: string;
  category: string | { id: string; name: string; slug: string };
  category_id?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  image: string; // Ana Kapak Görseli (Görsel 1)
  images?: string[] | ProductImages; // [Görsel 1, Görsel 2, Görsel 3]
  image1?: string;
  image2?: string;
  image3?: string;
  badge?: string;
  description: string;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  dimensions: string; // Ölçüler (Örn: G: 240cm | D: 95cm | Y: 75cm)
  dimensionSpec?: ProductDimensionSpec;
  material: string; // Malzeme & Kumaş
  setContents?: string[] | string; // Takım İçeriği
  setPieces?: ProductSetPiece[]; // Yapılandırılmış Takım Parçaları
  colors?: ProductColorVariant[]; // Renk Seçenekleri & Görselleri
  selectedColor?: string; // Cart selection
  inStock?: boolean;
  salesCount?: number;
  vatRate?: number;
}

export interface Category {
  id: string;
  category_id?: string;
  name: string;
  image: string;
  slug: string;
  description?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  phone: string;
  email?: string;
  hours?: string;
  image?: string;
  mapUrl?: string;
  isActive?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface UserPresence {
  uid: string;
  online: boolean;
  last_seen: string;
}

export interface LiveChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
}

export interface InventoryLock {
  product_id: string;
  user_id: string;
  locked_quantity: number;
  expires_at: number;
}

