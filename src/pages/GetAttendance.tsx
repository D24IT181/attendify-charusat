import { useState } from "react";
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
    className: "",
    timeSlot: "",
    faculty: "",
    subject: "",
    semester: "",
    date: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBack = () => navigate("/teacher-dashboard");

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
        userName="Dr. John Smith"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class</Label>
                  <Select onValueChange={(value) => setFormData({...formData, className: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="A">Class A</SelectItem>
                      <SelectItem value="B">Class B</SelectItem>
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
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Input placeholder="Subject" onChange={(e) => setFormData({...formData, subject: e.target.value})} />
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