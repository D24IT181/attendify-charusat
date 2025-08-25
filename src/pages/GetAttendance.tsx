import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Download, RotateCcw, ArrowLeft, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const GetAttendance = () => {
  const [formData, setFormData] = useState({
    department: "",
    division: "",
    timeSlot: "",
    semester: "",
    date: ""
  });
  const [teacherName, setTeacherName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBack = () => navigate("/teacher-dashboard");

  useEffect(() => {
    try {
      const stored = localStorage.getItem('teacherInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTeacherName(parsed?.name);
      }
    } catch {}
  }, []);

  const handleDownload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Excel Downloaded!",
        description: "Attendance report has been downloaded to your device",
      });
    }, 2000);
  };

  const handleReset = () => {
    toast({
      title: "Attendance Reset!",
      description: "All attendance data for this session has been cleared",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header 
        title="Get Attendance" 
        userRole="teacher" 
        userName={teacherName}
        onLogout={() => navigate("/login")}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Button onClick={handleBack} variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Filter Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Select onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Division</Label>
                  <Select onValueChange={(value) => setFormData({...formData, division: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={formData.department ? "Select division" : "Select department first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {formData.department && (
                        <>
                          <SelectItem value={`${formData.department} 1`}>{`${formData.department} 1`}</SelectItem>
                          <SelectItem value={`${formData.department} 2`}>{`${formData.department} 2`}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Time Slot</Label>
                  <Select onValueChange={(value) => setFormData({...formData, timeSlot: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="9:10 to 10:10">9:10 to 10:10</SelectItem>
                      <SelectItem value="10:10 to 11:10">10:10 to 11:10</SelectItem>
                      <SelectItem value="12:10 to 1:10">12:10 to 1:10</SelectItem>
                      <SelectItem value="1:10 to 2:10">1:10 to 2:10</SelectItem>
                      <SelectItem value="2:20 to 3:20">2:20 to 3:20</SelectItem>
                      <SelectItem value="3:20 to 4:20">3:20 to 4:20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Semester</Label>
                  <Select onValueChange={(value) => setFormData({...formData, semester: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <SelectItem key={i+1} value={`${i+1}`}>Semester {i+1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Input type="date" onChange={(e) => setFormData({...formData, date: e.target.value})} />
              
              <div className="flex gap-4">
                <Button onClick={handleDownload} variant="hero" className="flex-1" disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? "Downloading..." : "Download Excel"}
                </Button>
                <Button onClick={handleReset} variant="destructive" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Data
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span>Total Students</span>
                    <span className="font-bold">45</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span>Present</span>
                    <span className="font-bold text-green-600">38</span>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span>Absent</span>
                    <span className="font-bold text-red-600">7</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};