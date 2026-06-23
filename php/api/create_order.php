<?php
// =============================================================
//  PERFECT FINISH - Create Order
//  File   : php/api/create_order.php
//  Method : POST
//  Body   : JSON
//  Returns: JSON with order_reference on success
//  Called by script.js -> handleOrderSubmit()
// =============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// ----------------------------------------------------------
//  1. Parse JSON body
// ----------------------------------------------------------
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body || !is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

// ----------------------------------------------------------
//  2. Helper: sanitise a string input
// ----------------------------------------------------------
function clean(string $value): string
{
    return trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
}

// ----------------------------------------------------------
//  3. Extract and sanitise fields
// ----------------------------------------------------------
$perfumeId   = isset($body['perfume_id']) ? (int) $body['perfume_id'] : null;
$perfumeName = isset($body['perfume_name']) ? clean($body['perfume_name']) : '';
$bottleSize  = isset($body['bottle_size'])  ? clean($body['bottle_size'])  : '30ml';
$quantity    = isset($body['quantity'])     ? (int) $body['quantity']      : 1;
$firstName   = isset($body['first_name'])   ? clean($body['first_name'])   : '';
$lastName    = isset($body['last_name'])    ? clean($body['last_name'])    : '';
$phone       = isset($body['phone'])        ? clean($body['phone'])        : '';
$email       = isset($body['email'])        ? clean($body['email'])        : '';
$address     = isset($body['address'])      ? clean($body['address'])      : '';
$notes       = isset($body['notes'])        ? clean($body['notes'])        : '';

// ----------------------------------------------------------
//  4. Validate required fields
// ----------------------------------------------------------
$errors = [];

if ($perfumeName === '') {
    $errors[] = 'Please select a fragrance.';
}

if (!in_array($bottleSize, ['30ml', '50ml', '100ml'], true)) {
    $errors[] = 'Invalid bottle size selected.';
}

if ($quantity < 1 || $quantity > 20) {
    $errors[] = 'Quantity must be between 1 and 20.';
}

if ($firstName === '') {
    $errors[] = 'First name is required.';
}

if ($lastName === '') {
    $errors[] = 'Last name is required.';
}

if ($phone === '') {
    $errors[] = 'Phone number is required.';
}

if ($address === '') {
    $errors[] = 'Delivery address is required.';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => $errors[0]]);
    exit;
}

// ----------------------------------------------------------
//  5. Calculate total server-side (never trust the client)
// ----------------------------------------------------------
$totalAmount = 0.00;
$multipliers = SIZE_MULTIPLIERS;

try {
    $pdo = getDB();

    if ($perfumeName !== 'Custom Blend' && $perfumeId !== null && $perfumeId > 0) {
        // Fetch price from DB
        $stmt = $pdo->prepare(
            'SELECT price FROM perfumes WHERE id = ? AND available = 1 LIMIT 1'
        );
        $stmt->execute([$perfumeId]);
        $perfume = $stmt->fetch();

        if ($perfume) {
            $multiplier  = $multipliers[$bottleSize] ?? 1.0;
            $totalAmount = round((float) $perfume['price'] * $multiplier * $quantity, 2);
        }
        // If perfume not found, total stays 0 (will say "to be quoted")
    }
    // Custom Blend -> totalAmount stays 0.00 (quoted later)

    // ----------------------------------------------------------
    //  6. Insert the order
    // ----------------------------------------------------------
    $insertStmt = $pdo->prepare(
        'INSERT INTO orders
            (order_reference, first_name, last_name, email, phone, address,
             perfume_id, perfume_name, bottle_size, quantity, notes, total_amount, order_status)
         VALUES
            (:ref, :first_name, :last_name, :email, :phone, :address,
             :perfume_id, :perfume_name, :bottle_size, :quantity, :notes, :total_amount, "pending")'
    );

    // Temporary placeholder reference — we will update it after getting the real ID
    $insertStmt->execute([
        ':ref'          => 'PF-TEMP',
        ':first_name'   => $firstName,
        ':last_name'    => $lastName,
        ':email'        => $email,
        ':phone'        => $phone,
        ':address'      => $address,
        ':perfume_id'   => ($perfumeId > 0) ? $perfumeId : null,
        ':perfume_name' => $perfumeName,
        ':bottle_size'  => $bottleSize,
        ':quantity'     => $quantity,
        ':notes'        => $notes,
        ':total_amount' => $totalAmount,
    ]);

    $newId = (int) $pdo->lastInsertId();

    // ----------------------------------------------------------
    //  7. Generate order reference: PF-YYYY-XXXXX
    // ----------------------------------------------------------
    $year      = date('Y');
    $reference = 'PF-' . $year . '-' . str_pad($newId, 5, '0', STR_PAD_LEFT);

    // Update the row with the real reference
    $updateStmt = $pdo->prepare(
        'UPDATE orders SET order_reference = ? WHERE id = ?'
    );
    $updateStmt->execute([$reference, $newId]);

    // ----------------------------------------------------------
    //  8. Return success response
    // ----------------------------------------------------------
    http_response_code(200);
    echo json_encode([
        'success'         => true,
        'order_reference' => $reference,
        'first_name'      => $firstName,
        'last_name'       => $lastName,
        'fragrance'       => $perfumeName,
        'bottle_size'     => $bottleSize,
        'quantity'        => $quantity,
        'total_amount'    => $totalAmount,
        'phone'           => $phone,
        'address'         => $address,
        'notes'           => $notes,
        'wa_number'       => WA_NUMBER,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'We could not process your order. Please try again or contact us on WhatsApp.',
    ]);
}
