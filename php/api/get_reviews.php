<?php
// =============================================================
//  PERFECT FINISH - GET Reviews
//  File   : php/api/get_reviews.php
//  Method : GET
//  Returns: JSON array of approved reviews
//  Called by script.js -> loadReviews()
// =============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();

    $stmt = $pdo->prepare(
        'SELECT
            id,
            customer_name,
            customer_image,
            location,
            rating,
            review_text
         FROM reviews
         WHERE approved = 1
         ORDER BY sort_order ASC'
    );
    $stmt->execute();
    $reviews = $stmt->fetchAll();

    foreach ($reviews as &$r) {
        $r['id']     = (int) $r['id'];
        $r['rating'] = (int) $r['rating'];

        // Generate initials from customer_name for avatar fallback
        $parts    = explode(' ', trim($r['customer_name']));
        $initials = '';
        foreach ($parts as $part) {
            $initials .= strtoupper(mb_substr($part, 0, 1));
        }
        $r['initials'] = mb_substr($initials, 0, 2);
    }
    unset($r);

    http_response_code(200);
    echo json_encode($reviews, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not load reviews. Please try again.',
    ]);
}
