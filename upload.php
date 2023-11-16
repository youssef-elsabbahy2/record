<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['audio'])) {
    $targetDir = 'uploads/';
    $targetFile = $targetDir . 'recording.wav';
    
    if (move_uploaded_file($_FILES['audio']['tmp_name'], $targetFile)) {
        echo json_encode(['status' => 'success', 'message' => 'Recording uploaded successfully.']);
    } else {
        $error_message = 'Failed to upload the recording.';
        error_log($error_message);
        echo json_encode(['status' => 'error', 'message' => $error_message]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
}
?>
