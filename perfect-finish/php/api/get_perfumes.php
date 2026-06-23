<?php
// =============================================================
//  PERFECT FINISH — GET Perfumes
//  File   : php/api/get_perfumes.php
//  Method : GET
//  Returns: JSON array of available perfumes
//  Called by script.js → loadProducts()
// =============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Only allow GET requests
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
            perfume_name,
            category,
            description,
            image_url,
            price,
            badge
         FROM perfumes
         WHERE available = 1
         ORDER BY sort_order ASC'
    );
    $stmt->execute();
    $perfumes = $stmt->fetchAll();

    // Cast types for clean JSON output
    foreach ($perfumes as &$p) {
        $p['id']    = (int)   $p['id'];
        $p['price'] = (float) $p['price'];
    }
    unset($p);

    http_response_code(200);
    echo json_encode($perfumes, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not load fragrances. Please try again.',
    ]);
}
