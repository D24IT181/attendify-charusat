import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { UserPlus, Users, Mail, Lock, User, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "/Attendance_Project/attendify-charusat/backend-php";

export const AdminDashboard = () => {
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [removeEmail, setRemoveEmail] = useState("");
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState(false);
  const [teacherCount, setTeacherCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchTeacherCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_teachers_count.php`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTeacherCount(data.count);
      } else {
        console.error('Failed to fetch teacher count:', data.error);
      }
    } catch (err) {
      console.error('Error fetching teacher count:', err);
    } finally {
      setIsLoadingCount(false);
    }
  };

  const handleLogout = () => {
    navigate("/login?role=admin");
  };

  useEffect(() => {
    fetchTeacherCount();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAdd(true);
    try {
      const res = await fetch(`${API_BASE}/add_teacher.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Full_Name: teacherForm.name,
          Email: teacherForm.email,
          Password: teacherForm.password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Teacher Registered Successfully!", description: `${teacherForm.name} has been added to the system` });
        setTeacherForm({ name: "", email: "", password: "" });
        fetchTeacherCount();
      } else {
        toast({ title: "Failed to add teacher", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setIsLoadingAdd(false);
    }
  };

  const handleRemoveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingRemove(true);
    try {
      const res = await fetch(`${API_BASE}/remove_teacher.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: removeEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Teacher Removed", description: `${removeEmail} has been removed from the system` });
        setRemoveEmail("");
        fetchTeacherCount();
      } else {
        toast({ title: "Failed to remove teacher", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setIsLoadingRemove(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTeacherForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header 
        title="Admin Dashboard" 
        userRole="admin" 
        userName="Admin"
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-primary to-primary-glow text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Teachers</p>
                  <p className="text-3xl font-bold">
                    {isLoadingCount ? "..." : teacherCount}
                  </p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-secondary to-orange-400 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Sessions</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <UserPlus className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Students</p>
                  <p className="text-3xl font-bold">1,247</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Management */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <UserPlus className="h-6 w-6 text-primary" />
                Add Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter teacher's full name"
                      value={teacherForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="teacher@charusat.edu.in"
                      value={teacherForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password for teacher"
                      value={teacherForm.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" variant="hero" className="w-full" disabled={isLoadingAdd}>
                    {isLoadingAdd ? "Registering..." : "Register Teacher"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <UserMinus className="h-6 w-6 text-destructive" />
                Remove Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRemoveTeacher} className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="removeEmail">Teacher Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="removeEmail"
                      type="email"
                      placeholder="teacher@charusat.edu.in"
                      value={removeEmail}
                      onChange={(e) => setRemoveEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="destructive" disabled={isLoadingRemove}>
                  {isLoadingRemove ? "Removing..." : "Remove Teacher"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};