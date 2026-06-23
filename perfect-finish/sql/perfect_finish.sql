-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2026 at 09:36 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `perfect_finish`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_reference` varchar(20) NOT NULL,
  `first_name` varchar(80) NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `email` varchar(180) DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `address` varchar(400) NOT NULL,
  `perfume_id` int(10) UNSIGNED DEFAULT NULL,
  `perfume_name` varchar(120) NOT NULL,
  `bottle_size` enum('30ml','50ml','100ml') NOT NULL DEFAULT '30ml',
  `quantity` tinyint(4) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_status` enum('pending','confirmed','processing','dispatched','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `perfumes`
--

CREATE TABLE `perfumes` (
  `id` int(10) UNSIGNED NOT NULL,
  `perfume_name` varchar(120) NOT NULL,
  `category` varchar(60) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(300) NOT NULL DEFAULT 'images/products/default.jpg',
  `price` decimal(10,2) NOT NULL,
  `badge` varchar(40) DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `perfumes`
--

INSERT INTO `perfumes` (`id`, `perfume_name`, `category`, `description`, `image_url`, `price`, `badge`, `available`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Noir Absolu', 'Eau de Parfum', 'A dark, brooding composition of black oud, smoked vetiver, and midnight amber.', 'images/products/noir-absolu.jpg', '18500.00', 'Bestseller', 1, 1, '2026-06-22 12:02:09', '2026-06-22 12:02:09'),
(2, 'Rose Lumiere', 'Eau de Parfum', 'Delicate Bulgarian rose, lychee accord, and warm white musks woven into silk.', 'images/products/rose-lumiere.jpg', '16000.00', NULL, 1, 2, '2026-06-22 12:02:09', '2026-06-22 12:02:09'),
(3, 'Amber Royale', 'Extrait de Parfum', 'Resinous amber, Madagascan vanilla, and aged sandalwood in a declaration of opulence.', 'images/products/amber-royale.jpg', '21000.00', 'Limited', 1, 3, '2026-06-22 12:02:09', '2026-06-22 12:02:09'),
(4, 'Citrus Elite', 'Eau de Toilette', 'Bergamot, Sicilian lemon, and neroli with a cedar dry-down. Effortless distinction.', 'images/products/citrus-elite.jpg', '14500.00', NULL, 1, 4, '2026-06-22 12:02:09', '2026-06-22 12:02:09'),
(5, 'Bois Mystique', 'Eau de Parfum', 'Guaiac wood, smoked patchouli, and leather on a foundation of labdanum.', 'images/products/bois-mystique.jpg', '19500.00', NULL, 1, 5, '2026-06-22 12:02:09', '2026-06-22 12:02:09'),
(6, 'Floral Seduction', 'Eau de Parfum', 'Tuberose, jasmine sambac, and ylang-ylang in a heady, romantic arrangement.', 'images/products/floral-seduction.jpg', '15500.00', NULL, 1, 6, '2026-06-22 12:02:09', '2026-06-22 12:02:09');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_image` varchar(300) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `rating` tinyint(4) NOT NULL DEFAULT 5,
  `review_text` text NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `customer_name`, `customer_image`, `location`, `rating`, `review_text`, `approved`, `sort_order`, `created_at`) VALUES
(1, 'Amara Chukwu', NULL, 'Lagos, Nigeria', 5, 'The custom blend they created for me has become my signature scent. People ask about it everywhere I go. Truly exceptional work.', 1, 1, '2026-06-22 12:02:09'),
(2, 'Tunde Martins', NULL, 'Abuja, Nigeria', 5, 'Ordered the Noir Absolu and received it beautifully packaged within 24 hours. The longevity is insane - still going strong 10 hours later.', 1, 2, '2026-06-22 12:02:09'),
(3, 'Fatima Okonkwo', NULL, 'Port Harcourt, Nigeria', 5, 'Perfect Finish does not feel like an online store. It feels like a private fragrance house. The attention to detail is remarkable.', 1, 3, '2026-06-22 12:02:09'),
(4, 'Kelechi Adaora', NULL, 'Enugu, Nigeria', 5, 'I was skeptical about ordering online but the team on WhatsApp guided me perfectly. Received exactly what I wanted. Now a loyal customer.', 1, 4, '2026-06-22 12:02:09'),
(5, 'Biodun Idowu', NULL, 'Ibadan, Nigeria', 5, 'Rose Lumiere was the perfect anniversary gift. She wore it the same evening and has not stopped. Perfect Finish delivers luxury, not just fragrance.', 1, 5, '2026-06-22 12:02:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_order_reference` (`order_reference`),
  ADD KEY `idx_status` (`order_status`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `fk_order_perfume` (`perfume_id`);

--
-- Indexes for table `perfumes`
--
ALTER TABLE `perfumes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_available` (`available`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_approved` (`approved`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `perfumes`
--
ALTER TABLE `perfumes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_perfume` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
