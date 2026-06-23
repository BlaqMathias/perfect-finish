-- ============================================================
--  PERFECT FINISH — Supabase PostgreSQL Schema
--  Production-safe version without default image fallback
-- ============================================================

-- ── PERFUMES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfumes (
  id            SERIAL PRIMARY KEY,
  perfume_name  VARCHAR(255)  NOT NULL,
  category      VARCHAR(120)  NOT NULL,
  description   TEXT          NOT NULL,
  image_url     TEXT          DEFAULT NULL,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  badge         VARCHAR(80)   DEFAULT NULL,
  available     BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfumes_available ON perfumes (available);
CREATE INDEX IF NOT EXISTS idx_perfumes_sort_order ON perfumes (sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfumes_name_unique ON perfumes (perfume_name);


-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              SERIAL PRIMARY KEY,
  customer_name   VARCHAR(255) NOT NULL,
  customer_image  TEXT         DEFAULT NULL,
  location        VARCHAR(150) DEFAULT NULL,
  rating          SMALLINT     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT         NOT NULL,
  approved        BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order      INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews (approved);
CREATE INDEX IF NOT EXISTS idx_reviews_sort_order ON reviews (sort_order);


-- ── ORDER STATUS ENUM ─────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
    CREATE TYPE order_status_enum AS ENUM (
      'pending',
      'confirmed',
      'processing',
      'dispatched',
      'delivered',
      'cancelled'
    );
  END IF;
END
$$;


-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  order_reference  VARCHAR(40)        NOT NULL UNIQUE,
  first_name       VARCHAR(120)       NOT NULL,
  last_name        VARCHAR(120)       NOT NULL,
  email            VARCHAR(255)       DEFAULT NULL,
  phone            VARCHAR(50)        NOT NULL,
  address          TEXT               NOT NULL,
  perfume_id       INTEGER            DEFAULT NULL REFERENCES perfumes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  perfume_name     VARCHAR(255)       NOT NULL,
  bottle_size      VARCHAR(20)        NOT NULL DEFAULT '30ml' CHECK (bottle_size IN ('30ml','50ml','100ml')),
  quantity         SMALLINT           NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 20),
  notes            TEXT               DEFAULT NULL,
  total_amount     NUMERIC(10,2)      NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  order_status     order_status_enum  NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders (order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_perfume_id ON orders (perfume_id);


-- ── AUTO-UPDATE updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_perfumes_updated_at ON perfumes;
CREATE TRIGGER trg_perfumes_updated_at
  BEFORE UPDATE ON perfumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- ── SEED DATA — PERFUMES ─────────────────────────────────────
INSERT INTO perfumes
(perfume_name, category, description, image_url, price, badge, available, sort_order)
VALUES
(
  'Noir Absolu',
  'Eau de Parfum',
  'A dark, brooding composition of black oud, smoked vetiver, and midnight amber.',
  '/images/products/noir-absolu.webp',
  18500.00,
  'Bestseller',
  TRUE,
  1
),
(
  'Rose Lumiere',
  'Eau de Parfum',
  'Delicate Bulgarian rose, lychee accord, and warm white musks woven into silk.',
  '/images/products/rose-lumiere.webp',
  16000.00,
  NULL,
  TRUE,
  2
),
(
  'Amber Royale',
  'Extrait de Parfum',
  'Resinous amber, Madagascan vanilla, and aged sandalwood in a declaration of opulence.',
  '/images/products/amber-royale.webp',
  21000.00,
  'Limited',
  TRUE,
  3
),
(
  'Citrus Elite',
  'Eau de Toilette',
  'Bergamot, Sicilian lemon, and neroli with a cedar dry-down. Effortless distinction.',
  '/images/products/citrus-elite.webp',
  14500.00,
  NULL,
  TRUE,
  4
),
(
  'Bois Mystique',
  'Eau de Parfum',
  'Guaiac wood, smoked patchouli, and leather on a foundation of labdanum.',
  '/images/products/bois-mystique.webp',
  19500.00,
  NULL,
  TRUE,
  5
),
(
  'Floral Seduction',
  'Eau de Parfum',
  'Tuberose, jasmine sambac, and ylang-ylang in a heady, romantic arrangement.',
  '/images/products/floral-seduction.webp',
  15500.00,
  NULL,
  TRUE,
  6
)
ON CONFLICT (perfume_name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  badge = EXCLUDED.badge,
  available = EXCLUDED.available,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();


-- ── SEED DATA — REVIEWS ──────────────────────────────────────
INSERT INTO reviews
(customer_name, customer_image, location, rating, review_text, approved, sort_order)
SELECT *
FROM (
  VALUES
  (
    'Amara Chukwu',
    NULL,
    'Lagos, Nigeria',
    5,
    'The custom blend they created for me has become my signature scent. People ask about it everywhere I go. Truly exceptional work.',
    TRUE,
    1
  ),
  (
    'Tunde Martins',
    NULL,
    'Abuja, Nigeria',
    5,
    'Ordered the Noir Absolu and received it beautifully packaged within 24 hours. The longevity is insane — still going strong 10 hours later.',
    TRUE,
    2
  ),
  (
    'Fatima Okonkwo',
    NULL,
    'Port Harcourt, Nigeria',
    5,
    'Perfect Finish does not feel like an online store. It feels like a private fragrance house. The attention to detail is remarkable.',
    TRUE,
    3
  ),
  (
    'Kelechi Adaora',
    NULL,
    'Enugu, Nigeria',
    5,
    'I was skeptical about ordering online but the team on WhatsApp guided me perfectly. Received exactly what I wanted. Now a loyal customer.',
    TRUE,
    4
  ),
  (
    'Biodun Idowu',
    NULL,
    'Ibadan, Nigeria',
    5,
    'Rose Lumiere was the perfect anniversary gift. She wore it the same evening and has not stopped. Perfect Finish delivers luxury, not just fragrance.',
    TRUE,
    5
  )
) AS seed_reviews(customer_name, customer_image, location, rating, review_text, approved, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM reviews
  WHERE reviews.customer_name = seed_reviews.customer_name
  AND reviews.review_text = seed_reviews.review_text
);