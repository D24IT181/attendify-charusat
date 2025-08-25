import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Camera, Eye, CheckCircle, AlertCircle, RotateCcw, Upload } from "lucide-react";
import { extractStudentId, formatAttendanceData } from "@/lib/studentUtils";
import { API_ENDPOINTS } from "@/config/api";

interface AuthData {
  email: string;
  name: string;
  picture: string;
  sessionId: string;
  isValid: boolean;
  timestamp: string;
}

export const StudentAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [captureAttempts, setCaptureAttempts] = useState(0);

  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceAlreadySubmitted, setAttendanceAlreadySubmitted] = useState(false);
  const [checkingAttendance, setCheckingAttendance] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [userEmail, setUserEmail] = useState('');
  const { toast } = useToast();

  // On mount, check if attendance already submitted
  useEffect(() => {
    if (!authData || !authData.email) {
      console.log('Waiting for authData.email...');
      setCheckingAttendance(true);
      return;
    }
    const key = `attendance_submitted_${sessionId}_${authData.email}`;
    const value = localStorage.getItem(key);
    if (value) {
      setAttendanceAlreadySubmitted(true);
      navigate(`/attendance-success/${sessionId}`, { replace: true });
    } else {
      setAttendanceAlreadySubmitted(false);
    }
    setCheckingAttendance(false);
  }, [sessionId, authData, navigate]);

  useEffect(() => {
    const storedAuth = localStorage.getItem(`studentAuth_${sessionId}`);
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        if (auth.isValid && auth.sessionId === sessionId) {
          setAuthData(auth);
        } else {
          navigate(`/student-auth/${sessionId}`);
          return;
        }
      } catch {
        navigate(`/student-auth/${sessionId}`);
        return;
      }
    } else {
      navigate(`/student-auth/${sessionId}`);
      return;
    }

    // Get session info
    const sessions = JSON.parse(localStorage.getItem('attendanceSessions') || '[]');
    const currentSession = sessions.find((s: any) => s.sessionId === sessionId);
    if (currentSession) {
      setSessionInfo(currentSession);
    } else {
      const testSession = {
        sessionId,
        subject: "Test Subject",
        department: "IT",
        semester: "5",
        division: "IT 1",
        lectureType: "lecture",
        timeSlot: "10:10 to 11:10",
        classroom: "608",
        date: new Date().toISOString().split('T')[0],
        attendanceLink: `${window.location.origin}/student-auth/${sessionId}`,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setSessionInfo(testSession);
    }
  }, [sessionId, navigate]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch {
      alert("Camera access denied or not available.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  // Blink detection improved
  const [prevBrightness, setPrevBrightness] = useState<number | null>(null);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);

  useEffect(() => {
    if (!isCapturing || capturedImage) return;
    let interval: NodeJS.Timeout;
    let closing = false;

    function detectBlink() {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Take brightness of center region
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const areaSize = Math.min(canvas.width, canvas.height) / 5;

      let total = 0, count = 0;
      for (let y = centerY - areaSize; y < centerY + areaSize; y += 2) {
        for (let x = centerX - areaSize; x < centerX + areaSize; x += 2) {
          const index = (y * canvas.width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          total += brightness;
          count++;
        }
      }

      const avg = total / count;

      if (prevBrightness !== null) {
        const drop = prevBrightness - avg;

        // Step 1: detect eyes closing
        if (!closing && drop > 35 && avg < 70) {
          closing = true;
        }

        // Step 2: detect reopening (blink complete)
        if (closing && avg > prevBrightness - 10) {
          setBlinkCount(prev => prev + 1);
          setBlinkDetected(true);

          setTimeout(() => {
            setBlinkDetected(false);
            handleCapture();
            setBlinkCount(0);
          }, 300);

          closing = false;
        }
      }

      setPrevBrightness(avg);
    }

    interval = setInterval(detectBlink, 120);
    return () => clearInterval(interval);
  }, [isCapturing, capturedImage, prevBrightness]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
  }, []);

  const handleManualCapture = () => {
    setCaptureAttempts(prev => prev + 1);
    if (videoRef.current && canvasRef.current) {
      handleCapture();
      toast({
        title: "Selfie Captured!",
        description: "Photo captured successfully. Please review and submit.",
      });
    } else {
      toast({
        title: "Camera Not Ready",
        description: "Please wait for camera to initialize",
        variant: "destructive"
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsBlinking(false);
    setCaptureAttempts(0);
    startCamera();
  };

  const handleSubmitAttendance = async () => {
    if (!capturedImage || !authData || !sessionInfo) return;
    setIsSubmitting(true);

    try {
      // Extract student ID from email
      const studentId = extractStudentId(authData.email);
      if (!studentId) {
        toast({
          title: "Invalid Email",
          description: "Please use a valid CHARUSAT email address",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Get session data from localStorage (stored by StudentAuth)
      const storedSessionData = localStorage.getItem(`sessionData_${sessionId}`);
      console.log('Stored Session Data Key:', `sessionData_${sessionId}`);
      console.log('Raw Stored Session Data:', storedSessionData);
      
      if (!storedSessionData) {
        toast({
          title: "Session Data Missing",
          description: "Session information not found. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const sessionData = JSON.parse(storedSessionData);
      console.log('Parsed Session Data:', sessionData);
      
      // Fallback: If session data is empty, use default values
      const finalSessionData = {
        subject: sessionData.subject || 'Test Subject',
        department: sessionData.department || 'IT',
        semester: sessionData.semester || '3',
        division: sessionData.division || 'IT 1',
        lectureType: sessionData.lectureType || 'lecture',
        timeSlot: sessionData.timeSlot || '9:10 to 10:10',
        classroom: sessionData.classroom || '608',
        date: sessionData.date || new Date().toISOString().split('T')[0],
        faculty: sessionData.faculty || 'Test Faculty'
      };
      
      console.log('Final Session Data (with fallbacks):', finalSessionData);
      
      // Format data for database
      const attendanceData = formatAttendanceData(
        finalSessionData,
        studentId,
        authData.email,
        capturedImage
      );

      // Debug: Log the data being sent
      console.log('Session Data:', sessionData);
      console.log('Formatted Attendance Data:', attendanceData);

      // Validate all required fields
      const requiredFields = ['MOT', 'timeslot', 'dept', 'division', 'subject', 'faculty_name', 'sem', 'date', 'student_id', 'selfie', 'gmail'];
      const missingFields = requiredFields.filter(field => !attendanceData[field] || attendanceData[field] === '');
      
      if (missingFields.length > 0) {
        console.error('Missing fields:', missingFields);
        toast({
          title: "Missing Data",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Submit to database
      const response = await fetch(API_ENDPOINTS.INSERT_ATTENDANCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });

      const result = await response.json();
      
      console.log('PHP Response:', result);

      if (result.success) {
        // Store local record for fallback
        const attendanceRecord = {
          sessionId,
          studentEmail: authData.email,
          studentName: authData.name,
          timestamp: new Date().toISOString(),
          image: capturedImage,
          status: 'present'
        };

        const existingRecords = JSON.parse(localStorage.getItem(`attendance_${sessionId}`) || '[]');
        existingRecords.push(attendanceRecord);
        localStorage.setItem(`attendance_${sessionId}`, JSON.stringify(existingRecords));

        // Mark attendance as submitted
        const key = `attendance_submitted_${sessionId}_${authData.email}`;
        localStorage.setItem(key, '1');

        toast({
          title: "Attendance Recorded!",
          description: "Your attendance has been successfully recorded in the database.",
        });

        navigate(`/attendance-success/${sessionId}`, { replace: true });
      } else {
        throw new Error(result.error || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (authData && sessionInfo) {
      setTimeout(() => {
        startCamera();
      }, 1000);
    }
    return () => {
      stopCamera();
    };
  }, [authData, sessionInfo, startCamera, stopCamera]);

  if (!authData || !authData.email || checkingAttendance) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }
  if (attendanceAlreadySubmitted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mark Your Attendance</CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Welcome, {authData.name}!</p>
              <p>Session: {sessionInfo.subject} - {sessionInfo.department} {sessionInfo.semester} Sem</p>
              <p>Date: {new Date(sessionInfo.date).toLocaleDateString()}</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!capturedImage ? (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">Selfie Capture Instructions</span>
                  </div>
                  <div className="space-y-2 text-blue-600 text-xs">
                    <p>1. <strong>Position your face</strong> in the camera view</p>
                    <p>2. <strong>Blink naturally</strong> while looking at the camera</p>
                    <p>3. <strong>Wait for capture</strong> - the photo will be taken automatically</p>
                    <p>4. <strong>Review and send</strong> your attendance</p>
                  </div>
                </div>

                {/* Camera */}
                <div className="flex flex-col items-center justify-center my-8">
                  {!capturedImage && (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        width={320}
                        height={240}
                        style={{
                          borderRadius: "1.5rem",
                          border: blinkDetected ? "4px solid #f59e42" : "4px solid #22c55e",
                          background: "#000",
                          objectFit: "cover",
                          display: isCapturing ? "block" : "none",
                        }}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      {!isCapturing && (
                        <Button onClick={startCamera} className="mt-4">
                          Start Camera
                        </Button>
                      )}
                      {isCapturing && (
                        <Button onClick={handleCapture} className="mt-4">
                          Capture
                        </Button>
                      )}
                      <div className="mt-2 text-sm text-gray-600">
                        {blinkDetected ? (
                          <span className="text-orange-600 font-bold">Blink detected! Capturing...</span>
                        ) : (
                          <div className="space-y-1">
                            <p>Blink to capture or use the button below</p>
                            <p className="text-xs text-blue-600">Blink count: {blinkCount}</p>
                            <p className="text-xs text-gray-500">Current brightness: {prevBrightness ? Math.round(prevBrightness) : 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {capturedImage && (
                    <div className="flex flex-col items-center">
                      <img src={capturedImage} alt="Selfie" className="rounded-xl border-4 border-green-500 w-64 h-48 object-cover" />
                      <Button className="mt-4" onClick={handleSubmitAttendance} disabled={isSubmitting}>Send Attendance</Button>
                    </div>
                  )}
                </div>

                {/* Manual attempts */}
                {captureAttempts > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-700 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Manual capture attempts: {captureAttempts}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-600 mb-4">
                    Selfie Captured Successfully!
                  </h3>
                  <div className="relative inline-block">
                    <img
                      src={capturedImage}
                      alt="Captured selfie"
                      className="rounded-lg border-4 border-green-300 max-w-sm shadow-lg"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Verified
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your photo has been captured. Please review and submit your attendance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Photo
                  </Button>
                  <Button
                    onClick={handleSubmitAttendance}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Send Attendance
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
