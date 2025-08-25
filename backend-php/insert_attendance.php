<?php
require_once 'config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_json(405, ['success' => false, 'error' => 'Method not allowed']);
}

try {
    // Get database connection
    $pdo = get_pdo();
    
    $input = file_get_contents('php://input');
    $payload = json_decode($input, true);
    
    if (!$payload) {
        respond_json(400, ['success' => false, 'error' => 'Invalid JSON payload']);
    }
    
    // Extract data from payload
    $mot = trim((string)($payload['MOT'] ?? ''));
    $timeslot = trim((string)($payload['timeslot'] ?? ''));
    $dept = trim((string)($payload['dept'] ?? ''));
    $division = trim((string)($payload['division'] ?? ''));
    $subject = trim((string)($payload['subject'] ?? ''));
    $faculty_name = trim((string)($payload['faculty_name'] ?? ''));
    $sem = (int)($payload['sem'] ?? 0);
    $date = trim((string)($payload['date'] ?? ''));
    $student_id = trim((string)($payload['student_id'] ?? ''));
    $selfie = trim((string)($payload['selfie'] ?? ''));
    $gmail = trim((string)($payload['gmail'] ?? ''));
    
    // Validate required fields
    if ($mot === '' || $timeslot === '' || $dept === '' || $division === '' || 
        $subject === '' || $faculty_name === '' || $sem === 0 || $date === '' || 
        $student_id === '' || $selfie === '' || $gmail === '') {
        respond_json(400, ['success' => false, 'error' => 'All fields are required']);
    }
    
    // Validate department
    if (!in_array($dept, ['IT', 'CSE', 'CE'])) {
        respond_json(400, ['success' => false, 'error' => 'Invalid department']);
    }
    
    // Validate MOT
    if (!in_array($mot, ['lab', 'lecture'])) {
        respond_json(400, ['success' => false, 'error' => 'Invalid mode of teaching']);
    }
    
    // Validate semester
    if ($sem < 1 || $sem > 8) {
        respond_json(400, ['success' => false, 'error' => 'Invalid semester']);
    }
    
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        respond_json(400, ['success' => false, 'error' => 'Invalid date format']);
    }
    
    // Validate email format
    if (!filter_var($gmail, FILTER_VALIDATE_EMAIL)) {
        respond_json(400, ['success' => false, 'error' => 'Invalid email format']);
    }
    
    // Insert into database
    $sql = 'INSERT INTO `attendance_records` (`MOT`, `timeslot`, `dept`, `division`, `subject`, `faculty_name`, `sem`, `date`, `student_id`, `selfie`, `gmail`) VALUES (:mot, :timeslot, :dept, :division, :subject, :faculty_name, :sem, :date, :student_id, :selfie, :gmail)';
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':mot' => $mot,
        ':timeslot' => $timeslot,
        ':dept' => $dept,
        ':division' => $division,
        ':subject' => $subject,
        ':faculty_name' => $faculty_name,
        ':sem' => $sem,
        ':date' => $date,
        ':student_id' => $student_id,
        ':selfie' => $selfie,
        ':gmail' => $gmail
    ]);
    
    if ($result) {
        $attendance_id = $pdo->lastInsertId();
        respond_json(201, [
            'success' => true, 
            'message' => 'Attendance recorded successfully',
            'attendance_id' => $attendance_id
        ]);
    } else {
        respond_json(500, ['success' => false, 'error' => 'Failed to record attendance']);
    }
    
} catch (PDOException $e) {
    respond_json(500, ['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    respond_json(500, ['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
?>
