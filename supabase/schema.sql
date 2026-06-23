-- ============================================================
--  PERFECT FINISH — Supabase PostgreSQL Schema
--  Converted from MySQL / MariaDB
--  Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── PERFUMES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfumes (
  id           SERIAL PRIMARY KEY,
  perfume_name VARCHAR(120)   NOT NULL,
  category     VARCHAR(60)    NOT NULL,
  description  TEXT           NOT NULL,
  image_url    VARCHAR(300)   NOT NULL DEFAULT '/images/products/default.jpg',
  price        NUMERIC(10,2)  NOT NULL,
  badge        VARCHAR(40)    DEFAULT NULL,
  available    BOOLEAN        NOT NULL DEFAULT TRUE,
  sort_order   INTEGER        NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfumes_available   ON perfumes (available);
CREATE INDEX IF NOT EXISTS idx_perfumes_sort_order  ON perfumes (sort_order);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL PRIMARY KEY,
  customer_name  VARCHAR(100)  NOT NULL,
  customer_image VARCHAR(300)  DEFAULT NULL,
  location       VARCHAR(100)  DEFAULT NULL,
  rating         SMALLINT      NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text    TEXT          NOT NULL,
  approved       BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order     INTEGER       NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved    ON reviews (approved);
CREATE INDEX IF NOT EXISTS idx_reviews_sort_order  ON reviews (sort_order);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'dispatched',
  'delivered',
  'cancelled'
);

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  order_reference VARCHAR(20)        NOT NULL UNIQUE,
  first_name      VARCHAR(80)        NOT NULL,
  last_name       VARCHAR(80)        NOT NULL,
  email           VARCHAR(180)       DEFAULT NULL,
  phone           VARCHAR(30)        NOT NULL,
  address         VARCHAR(400)       NOT NULL,
  perfume_id      INTEGER            DEFAULT NULL REFERENCES perfumes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  perfume_name    VARCHAR(120)       NOT NULL,
  bottle_size     VARCHAR(10)        NOT NULL DEFAULT '30ml' CHECK (bottle_size IN ('30ml','50ml','100ml')),
  quantity        SMALLINT           NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 20),
  notes           TEXT               DEFAULT NULL,
  total_amount    NUMERIC(10,2)      NOT NULL DEFAULT 0.00,
  order_status    order_status_enum  NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_phone       ON orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_perfume_id  ON orders (perfume_id);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_perfumes_updated_at
  BEFORE UPDATE ON perfumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── SEED DATA — PERFUMES ─────────────────────────────────────
INSERT INTO perfumes (perfume_name, category, description, image_url, price, badge, available, sort_order) VALUES
  ('Noir Absolu',      'Eau de Parfum',    'A dark, brooding composition of black oud, smoked vetiver, and midnight amber.',                    '/images/products/noir-absolu.jpg',      18500.00, 'Bestseller', TRUE, 1),
  ('Rose Lumiere',     'Eau de Parfum',    'Delicate Bulgarian rose, lychee accord, and warm white musks woven into silk.',                     '/images/products/rose-lumiere.jpg',     16000.00, NULL,         TRUE, 2),
  ('Amber Royale',     'Extrait de Parfum','Resinous amber, Madagascan vanilla, and aged sandalwood in a declaration of opulence.',             '/images/products/amber-royale.jpg',     21000.00, 'Limited',    TRUE, 3),
  ('Citrus Elite',     'Eau de Toilette',  'Bergamot, Sicilian lemon, and neroli with a cedar dry-down. Effortless distinction.',               '/images/products/citrus-elite.jpg',     14500.00, NULL,         TRUE, 4),
  ('Bois Mystique',    'Eau de Parfum',    'Guaiac wood, smoked patchouli, and leather on a foundation of labdanum.',                           '/images/products/bois-mystique.jpg',    19500.00, NULL,         TRUE, 5),
  ('Floral Seduction', 'Eau de Parfum',    'Tuberose, jasmine sambac, and ylang-ylang in a heady, romantic arrangement.',                       '/images/products/floral-seduction.jpg', 15500.00, NULL,         TRUE, 6)
ON CONFLICT DO NOTHING;

-- ── SEED DATA — REVIEWS ──────────────────────────────────────
INSERT INTO reviews (customer_name, customer_image, location, rating, review_text, approved, sort_order) VALUES
  ('Amara Chukwu',   NULL, 'Lagos, Nigeria',        5, 'The custom blend they created for me has become my signature scent. People ask about it everywhere I go. Truly exceptional work.',                                           TRUE, 1),
  ('Tunde Martins',  NULL, 'Abuja, Nigeria',         5, 'Ordered the Noir Absolu and received it beautifully packaged within 24 hours. The longevity is insane — still going strong 10 hours later.',                              TRUE, 2),
  ('Fatima Okonkwo', NULL, 'Port Harcourt, Nigeria', 5, 'Perfect Finish does not feel like an online store. It feels like a private fragrance house. The attention to detail is remarkable.',                                       TRUE, 3),
  ('Kelechi Adaora', NULL, 'Enugu, Nigeria',         5, 'I was skeptical about ordering online but the team on WhatsApp guided me perfectly. Received exactly what I wanted. Now a loyal customer.',                                TRUE, 4),
  ('Biodun Idowu',   NULL, 'Ibadan, Nigeria',        5, 'Rose Lumiere was the perfect anniversary gift. She wore it the same evening and has not stopped. Perfect Finish delivers luxury, not just fragrance.',                     TRUE, 5)
ON CONFLICT DO NOTHING;