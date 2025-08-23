import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { QrCode, Download, UserCheck, Clock, BookOpen, Users, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get teacher info from localStorage (set during login)
    const storedTeacherInfo = localStorage.getItem('teacherInfo');
    if (storedTeacherInfo) {
      try {
        const teacherData = JSON.parse(storedTeacherInfo);
        setTeacherInfo(teacherData);
      } catch (error) {
        console.error('Error parsing teacher info:', error);
        toast({
          title: "Error",
          description: "Failed to load teacher information",
          variant: "destructive",
        });
      }
    } else {
      // If no teacher info, redirect to login
      toast({
        title: "Session Expired",
        description: "Please login again",
        variant: "destructive",
      });
      navigate("/login");
    }
    setIsLoading(false);
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('teacherInfo');
    navigate("/login");
  };

  const handleTakeAttendance = () => {
    navigate("/take-attendance");
  };

  const handleGetAttendance = () => {
    navigate("/get-attendance");
  };

    if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!teacherInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No teacher information found</p>
          <Button onClick={() => navigate("/login")} variant="hero">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header 
        title="Teacher Dashboard" 
        userRole="teacher" 
        userName={teacherInfo.name}
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Welcome back, {teacherInfo.name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your classes and track student attendance efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Today's Classes</p>
                  <p className="text-3xl font-bold">4</p>
                  <p className="text-xs opacity-75 mt-1">Scheduled for today</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Calendar className="h-10 w-10 opacity-90" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Completed</p>
                  <p className="text-3xl font-bold">2</p>
                  <p className="text-xs opacity-75 mt-1">Attendance taken</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <UserCheck className="h-10 w-10 opacity-90" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Pending</p>
                  <p className="text-3xl font-bold">2</p>
                  <p className="text-xs opacity-75 mt-1">Awaiting QR scan</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <QrCode className="h-10 w-10 opacity-90" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Avg Attendance</p>
                  <p className="text-3xl font-bold">78%</p>
                  <p className="text-xs opacity-75 mt-1">This week</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingUp className="h-10 w-10 opacity-90" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Take Attendance
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Create a new attendance session and generate QR code for students to mark their presence
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Generate QR Code & Link</p>
                <p>✓ Real-time Student Check-in</p>
                <p>✓ Selfie Verification</p>
              </div>
              
              <Button 
                onClick={handleTakeAttendance}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Start Taking Attendance
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-orange-400 rounded-full flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-secondary to-orange-400 bg-clip-text text-transparent">
                Get Attendance
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                View and download attendance reports for your classes with detailed analytics
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Download Excel Reports</p>
                <p>✓ Filter by Date & Class</p>
                <p>✓ Reset Attendance Data</p>
              </div>
              
              <Button 
                onClick={handleGetAttendance}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                View Attendance Reports
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};