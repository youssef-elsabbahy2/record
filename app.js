let mediaRecorder;
let audioChunks = [];
let recordingTimeout; // متغير لتخزين مؤقت التسجيل
let deletedRecording = false; // متغير لتتبع ما إذا تم حذف التسجيل

// حدث النقر لبدء التسجيل
document.getElementById('startRecording').addEventListener('click', startRecording);

// حدث النقر لإيقاف التسجيل وحفظه
document.getElementById('stopRecording').addEventListener('click', stopRecording);

// حدث النقر لحذف التسجيل
document.getElementById('deleteRecording').addEventListener('click', deleteRecording);

// حدث النقر لرفع التسجيل
document.getElementById('uploadRecording').addEventListener('click', uploadRecording);

// حدث النقر لحفظ التسجيل على الكمبيوتر
document.getElementById('saveToDesktop').addEventListener('click', saveToDesktop);

// بدء التسجيل
function startRecording() {
    // إذا كان هناك مؤقت تسجيل سابق، قم بإزالته
    if (recordingTimeout) {
        clearTimeout(recordingTimeout);
    }

    // إعداد عنصر الرسالة
    const recordStatusElement = document.getElementById('recordStatus');
    recordStatusElement.innerText = '';

    // إعادة تهيئة متغير حذف التسجيل
    deletedRecording = false;

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('audioPlayer').src = audioUrl;

        
            };

            mediaRecorder.start();

            // تحديد وقت التسجيل (5 ثوانٍ)
            recordingTimeout = setTimeout(() => {
                stopRecording();
                // عرض رسالة الحد الأقصى بعد انتهاء وقت التسجيل
                if (!deletedRecording) {
                    recordStatusElement.innerText = 'The maximum recording limit has been reached.';
                }
            }, 5000); // 5000 مللي ثانية = 5 ثوانٍ
        })
        .catch(error => console.error('Error accessing microphone:', error));
}

// إيقاف التسجيل
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearTimeout(recordingTimeout); // إلغاء مؤقت التسجيل

      
    }
}

// حذف التسجيل
function deleteRecording() {
    audioChunks = [];
    document.getElementById('audioPlayer').src = '';

    // إذا تم حذف التسجيل، قم بتعيين المتغير
    deletedRecording = true;

    // إذا تم حذف التسجيل، قم بإزالة رسالة الحد الأقصى
    document.getElementById('recordStatus').innerText = '';
}

// حفظ التسجيل على الكمبيوتر
function saveRecording(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recording.wav';
    a.click();
    window.URL.revokeObjectURL(url);
}

// حفظ التسجيل على سطح المكتب
function saveToDesktop() {
    if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        saveRecording(audioBlob);
    } else {
        // عرض رسالة بعدم وجود تسجيل للحفظ
        document.getElementById('recordStatus').innerText = 'No recording to save.';
    }
}

// رفع التسجيل إلى السيرفر باستخدام PHP
function uploadRecording() {
    // إذا لم يتم تسجيل أي ملف صوتي، لا تقم بالرفع
    if (audioChunks.length === 0) {
        // عرض رسالة بعدم وجود تسجيل للرفع
        document.getElementById('recordStatus').innerText = 'No recording to upload.';
        return;
    }

    // إذا تم حذف التسجيل، لا تقم بالرفع
    if (deletedRecording) {
        console.log('Recording deleted. Upload canceled.');
        return;
    }

    const formData = new FormData();
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    formData.append('audio', audioBlob, 'recording.wav');

    console.log('Data sent to server:', formData); // تسجيل البيانات المرسلة لتحليلها

    fetch('upload.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text()) // قد يكون الرد نصًا، ليس JSON
        .then(data => {
            console.log('Server response:', data);
            try {
                const jsonData = JSON.parse(data);
                console.log('Parsed JSON data:', jsonData);
                // يمكنك إضافة المزيد من المنطق هنا
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        })
        .catch(error => console.error('Error uploading recording:', error));
}
