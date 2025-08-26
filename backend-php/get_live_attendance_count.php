<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond_json(405, ['success' => false, 'error' => 'Method not allowed']);
}

// Get query parameters
$subject = trim((string)($_GET['subject'] ?? ''));
$dept = trim((string)($_GET['dept'] ?? ''));
$division = trim((string)($_GET['division'] ?? ''));
$date = trim((string)($_GET['date'] ?? date('Y-m-d')));
$lectureType = trim((string)($_GET['lectureType'] ?? ''));
$timeSlot = trim((string)($_GET['timeSlot'] ?? ''));

// At least subject and date are required
if ($subject === '' || $date === '') {
    respond_json(400, ['success' => false, 'error' => 'Subject and date are required']);
}

try {
    $pdo = get_pdo();
    
    // Build the query to count students who have marked attendance
    $whereConditions = [];
    $params = [];
    
    if ($subject !== '') {
        $whereConditions[] = 'subject = :subject';
        $params[':subject'] = $subject;
    }
    
    if ($dept !== '') {
        $whereConditions[] = 'dept = :dept';
        $params[':dept'] = strtoupper($dept);
    }
    
    if ($division !== '') {
        $whereConditions[] = 'division = :division';
        $params[':division'] = $division;
    }
    
    if ($date !== '') {
        $whereConditions[] = 'date = :date';
        $params[':date'] = $date;
    }
    
    if ($lectureType !== '') {
        $whereConditions[] = 'MOT = :lecture_type';
        $params[':lecture_type'] = strtolower($lectureType);
    }
    
    if ($timeSlot !== '') {
        $whereConditions[] = 'timeslot = :time_slot';
        $params[':time_slot'] = $timeSlot;
    }
    
    $whereClause = '';
    if (!empty($whereConditions)) {
        $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
    }
    
    // Get total count of students who marked attendance
    $countSql = "SELECT 
                    COUNT(*) as total_present,
                    COUNT(DISTINCT student_id) as unique_students,
                    COUNT(DISTINCT subject) as total_subjects
                  FROM `attendance_records` 
                  {$whereClause}";
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $countResult = $countStmt->fetch();
    
    // Get recent attendance records (last 10)
    $recentSql = "SELECT 
                     student_id,
                     gmail,
                     attendance_time,
                     MOT,
                     timeslot
                   FROM `attendance_records` 
                   {$whereClause}
                   ORDER BY attendance_time DESC
                   LIMIT 10";
    
    $recentStmt = $pdo->prepare($recentSql);
    $recentStmt->execute($params);
    $recentRecords = $recentStmt->fetchAll();
    
    // Get department-wise breakdown if department is specified
    $deptBreakdown = null;
    if ($dept === '') {
        $deptBreakdownSql = "SELECT 
                               dept,
                               COUNT(*) as count
                             FROM `attendance_records` 
                             {$whereClause}
                             GROUP BY dept
                             ORDER BY count DESC";
        
        $deptBreakdownStmt = $pdo->prepare($deptBreakdownSql);
        $deptBreakdownStmt->execute($params);
        $deptBreakdown = $deptBreakdownStmt->fetchAll();
    }
    
    respond_json(200, [
        'success' => true,
        'attendance_summary' => [
            'total_present' => (int)$countResult['total_present'],
            'unique_students' => (int)$countResult['unique_students'],
            'total_subjects' => (int)$countResult['total_subjects'],
            'date' => $date,
            'subject' => $subject,
            'department' => $dept,
            'division' => $division,
            'lecture_type' => $lectureType,
            'time_slot' => $timeSlot
        ],
        'recent_attendance' => $recentRecords,
        'department_breakdown' => $deptBreakdown,
        'last_updated' => date('Y-m-d H:i:s'),
        'filters_applied' => [
            'subject' => $subject,
            'dept' => $dept,
            'division' => $division,
            'date' => $date,
            'lectureType' => $lectureType,
            'timeSlot' => $timeSlot
        ]
    ]);
    
} catch (Throwable $e) {
    respond_json(500, ['success' => false, 'error' => 'Failed to fetch attendance count: ' . $e->getMessage()]);
}
?>


