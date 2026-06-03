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
INSERT INTO products (name, price, category, image_url, stock, description, rating) VALUES
  ('MacBook Pro 16" M4', 2499, 'Laptops', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 15, 'Apple M4 chip, 36GB RAM, 1TB SSD', 4.8),
  ('iPhone 16 Pro Max', 1199, 'Phones', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 30, 'A18 Pro chip, 256GB, Titanium frame', 4.7),
  ('Sony WH-1000XM6', 399, 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 50, 'Industry-leading noise cancellation', 4.6),
  ('Apple Watch Ultra 3', 799, 'Wearables', 'https://images.unsplash.com/photo-1546868871-af0de0ae72e9?w=400', 20, '49mm titanium case, GPS + Cellular', 4.5),
  ('Samsung Galaxy Book4 Pro', 1899, 'Laptops', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 10, 'Intel Core Ultra 9, 32GB RAM', 4.4),
  ('AirPods Pro 3', 249, 'Audio', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b3e8?w=400', 100, 'Adaptive audio, USB-C', 4.6);
