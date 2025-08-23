import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { QrCode, Link2, Copy, CheckCircle, ArrowLeft, Users, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

export const QRCodePage = () => {
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(true);
  
  // Session form state
  const [attendanceSession, setAttendanceSession] = useState({
    subject: "",
    department: "",
    semester: "",
    division: "",
    lectureType: "lecture",
    timeSlot: "",
    classroom: "608",
    date: new Date().toISOString().split('T')[0],
  });
  
  // Generated session data
  const [sessionData, setSessionData] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if session data was passed from navigation
  useEffect(() => {
    if (location.state) {
      // Ensure the session data has the attendanceLink property
      const sessionFromNavigation = location.state;
      if (!sessionFromNavigation.attendanceLink) {
        // Generate the attendance link if it's missing
        const sessionId = sessionFromNavigation.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const attendanceLink = `${window.location.origin}/student-auth/${sessionId}`;
        
        const completeSessionData = {
          ...sessionFromNavigation,
          sessionId,
          attendanceLink,
        };
        
        setSessionData(completeSessionData);
      } else {
        setSessionData(sessionFromNavigation);
      }
      
      setShowSessionForm(false);
    }
  }, [location.state]);

  // Check for existing sessions in localStorage on mount
  useEffect(() => {
    if (!location.state) {
      const existingSessions = JSON.parse(localStorage.getItem('attendanceSessions') || '[]');
      if (existingSessions.length > 0) {
        const latestSession = existingSessions[existingSessions.length - 1];
        
        if (latestSession.attendanceLink) {
          setSessionData(latestSession);
          setShowSessionForm(false);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Simulate real-time attendance updates
    const interval = setInterval(() => {
      setAttendanceCount(prev => {
        const increment = Math.random() > 0.7 ? 1 : 0;
        return prev + increment;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceSession.subject || !attendanceSession.department || 
        !attendanceSession.semester || !attendanceSession.division || 
        !attendanceSession.timeSlot) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingSession(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const attendanceLink = `${window.location.origin}/student-auth/${sessionId}`;
      
      const newSessionData = {
        sessionId,
        attendanceLink,
        subject: attendanceSession.subject,
        department: attendanceSession.department,
        semester: attendanceSession.semester,
        division: attendanceSession.division,
        lectureType: attendanceSession.lectureType,
        timeSlot: attendanceSession.timeSlot,
        classroom: attendanceSession.classroom,
        date: attendanceSession.date,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      // Store in localStorage
      const existingSessions = JSON.parse(localStorage.getItem('attendanceSessions') || '[]');
      existingSessions.push(newSessionData);
      localStorage.setItem('attendanceSessions', JSON.stringify(existingSessions));
      
      setSessionData(newSessionData);
      setShowSessionForm(false);
      
      toast({
        title: "Attendance Session Created!",
        description: "QR code and link have been generated successfully",
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create attendance session",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSessionInputChange = (field: string, value: string) => {
    setAttendanceSession(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyLink = async () => {
    if (!sessionData?.attendanceLink) return;
    
    try {
      await navigator.clipboard.writeText(sessionData.attendanceLink);
      setIsLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Attendance link has been copied to clipboard",
      });
      setTimeout(() => setIsLinkCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewSession = () => {
    setSessionData(null);
    setShowSessionForm(true);
    setAttendanceSession({
      subject: "",
      department: "",
      semester: "",
      division: "",
      lectureType: "lecture",
      timeSlot: "",
      classroom: "608",
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header 
        title="Attendance Session Management" 
        userRole="admin" 
        userName="Admin"
        onLogout={() => navigate("/login")}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {showSessionForm ? (
          // Session Creation Form
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Plus className="h-6 w-6 text-primary" />
                Create Attendance Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="e.g., Data Structures"
                    value={attendanceSession.subject}
                    onChange={(e) => handleSessionInputChange("subject", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={attendanceSession.department}
                    onChange={(e) => handleSessionInputChange("department", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="CSE">CSE</option>
                    <option value="CE">CE</option>
                    <option value="ME">ME</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    value={attendanceSession.semester}
                    onChange={(e) => handleSessionInputChange("semester", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <select
                    id="division"
                    value={attendanceSession.division}
                    onChange={(e) => handleSessionInputChange("division", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="">Select Division</option>
                    {attendanceSession.department && (
                      <>
                        <option value={`${attendanceSession.department} 1`}>{attendanceSession.department} 1</option>
                        <option value={`${attendanceSession.department} 2`}>{attendanceSession.department} 2</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lectureType">Lecture Type</Label>
                  <select
                    id="lectureType"
                    value={attendanceSession.lectureType}
                    onChange={(e) => handleSessionInputChange("lectureType", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <select
                    id="timeSlot"
                    value={attendanceSession.timeSlot}
                    onChange={(e) => handleSessionInputChange("timeSlot", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="">Select Time Slot</option>
                    {attendanceSession.lectureType === "lab" ? (
                      <>
                        <option value="9:10 to 11:10">9:10 to 11:10</option>
                        <option value="12:10 to 2:10">12:10 to 2:10</option>
                        <option value="2:20 to 4:20">2:20 to 4:20</option>
                      </>
                    ) : (
                      <>
                        <option value="9:10 to 10:10">9:10 to 10:10</option>
                        <option value="10:10 to 11:10">10:10 to 11:10</option>
                        <option value="12:10 to 1:10">12:10 to 1:10</option>
                        <option value="1:10 to 2:10">1:10 to 2:10</option>
                        <option value="2:20 to 3:20">2:20 to 3:20</option>
                        <option value="3:20 to 4:20">3:20 to 4:20</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="classroom">Classroom</Label>
                  <Input
                    id="classroom"
                    type="text"
                    value={attendanceSession.classroom}
                    onChange={(e) => handleSessionInputChange("classroom", e.target.value)}
                    className="bg-background"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={attendanceSession.date}
                    onChange={(e) => handleSessionInputChange("date", e.target.value)}
                    className="bg-background"
                    required
                  />
                </div>
                
                <div className="md:col-span-2 lg:col-span-3">
                  <Button type="submit" variant="hero" className="w-full" disabled={isLoadingSession}>
                    {isLoadingSession ? "Creating Session..." : "Create Attendance Session"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          // QR Code Display
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Session Info & QR Code */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Attendance QR Code
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-6">
                {/* Session Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Subject:</strong> {sessionData?.subject || 'N/A'}</div>
                    <div><strong>Department:</strong> {sessionData?.department || 'N/A'}</div>
                    <div><strong>Semester:</strong> {sessionData?.semester || 'N/A'}</div>
                    <div><strong>Division:</strong> {sessionData?.division || 'N/A'}</div>
                    <div><strong>Time:</strong> {sessionData?.timeSlot || 'N/A'}</div>
                    <div><strong>Type:</strong> {sessionData?.lectureType || 'N/A'}</div>
                    <div><strong>Classroom:</strong> {sessionData?.classroom || 'N/A'}</div>
                    <div><strong>Date:</strong> {sessionData?.date ? new Date(sessionData.date).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary/20">
                    {sessionData?.attendanceLink ? (
                      <QRCode
                        value={sessionData.attendanceLink}
                        size={200}
                        level="M"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                        <p>QR Code will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Students can scan this QR code to mark their attendance
                </p>
              </CardContent>
            </Card>

            {/* Attendance Link & Live Count */}
            <div className="space-y-6">
              {/* Live Attendance Count */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Students Present</p>
                      <p className="text-4xl font-bold">{attendanceCount}</p>
                      <p className="text-sm opacity-75">Live count updating...</p>
                    </div>
                    <Users className="h-16 w-16 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Link */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    Attendance Link
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 break-all text-sm font-mono">
                    {sessionData?.attendanceLink || 'No attendance link available'}
                  </div>
                  
                  <Button
                    onClick={handleCopyLink}
                    variant={isLinkCopied ? "default" : "outline"}
                    className="w-full"
                  >
                    {isLinkCopied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Share this link with students or display the QR code
                  </p>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Instructions for Students</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>1. Scan the QR code or click the attendance link</p>
                    <p>2. Sign in with your @charusat.edu.in Google account</p>
                    <p>3. Take a live selfie for verification</p>
                    <p>4. Submit to mark attendance</p>
                  </div>
                </CardContent>
              </Card>

              {/* Create New Session Button */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Button
                    onClick={handleCreateNewSession}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};