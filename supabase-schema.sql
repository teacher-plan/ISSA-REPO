-- Create products table
CREATE TABLE products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  image_url text,
  stock integer DEFAULT 0,
  description text,
  rating numeric DEFAULT 4.5,
  discount integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Allow authenticated users with admin role to insert/update/delete
CREATE POLICY "Admins can insert"
  ON products FOR INSERT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Sample products
-- Orders table
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  items jsonb NOT NULL DEFAULT '[]',
  total numeric NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  payment_intent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Reviews table
CREATE TABLE reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id bigint REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Wishlist table
CREATE TABLE wishlists (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id bigint REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (auth.uid() = user_id);

-- Sample products
INSERT INTO products (name, price, category, image_url, stock, description, rating) VALUES
  ('MacBook Pro 16" M4', 2499, 'Laptops', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 15, 'Apple M4 chip, 36GB RAM, 1TB SSD', 4.8),
  ('iPhone 16 Pro Max', 1199, 'Phones', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 30, 'A18 Pro chip, 256GB, Titanium frame', 4.7),
  ('Sony WH-1000XM6', 399, 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 50, 'Industry-leading noise cancellation', 4.6),
  ('Apple Watch Ultra 3', 799, 'Wearables', 'https://images.unsplash.com/photo-1546868871-af0de0ae72e9?w=400', 20, '49mm titanium case, GPS + Cellular', 4.5),
  ('Samsung Galaxy Book4 Pro', 1899, 'Laptops', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 10, 'Intel Core Ultra 9, 32GB RAM', 4.4),
  ('AirPods Pro 3', 249, 'Audio', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b3e8?w=400', 100, 'Adaptive audio, USB-C', 4.6);
