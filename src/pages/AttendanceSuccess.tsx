import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PartyPopper, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AttendanceSuccess() {
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if this is an OAuth callback
        const code = searchParams.get('code');
        
        if (code) {
          // This is an OAuth callback - extract user info
          await processOAuthCallback(code);
        } else {
          // This is a direct visit to success page
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to process Google authentication. Please try again.",
          variant: "destructive",
        });
        // Redirect back to student auth
        if (sessionId) {
          navigate(`/student-auth/${sessionId}`);
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, sessionId, navigate, toast]);

  const processOAuthCallback = async (code: string) => {
    try {
      // For now, we'll simulate getting user info
      // In a real app, you'd exchange this code for tokens and get user info
      
      // Extract email from URL parameters (Google sometimes includes it)
      const email = searchParams.get('hd') ? `user@${searchParams.get('hd')}` : 'user@charusat.edu.in';
      
      // Store authentication data
      const authData = {
        email,
        sessionId,
        isValid: true,
        timestamp: new Date().toISOString(),
        name: email.split('@')[0],
        picture: ""
      };
      
      localStorage.setItem(`studentAuth_${sessionId}`, JSON.stringify(authData));
      
      setUserInfo(authData);
      setIsLoading(false);
      
      toast({
        title: "Authentication Successful!",
        description: `Welcome! You can now proceed to mark attendance.`,
      });
      
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-6">
        <div className="text-center space-y-6">
          <Loader2 className="h-16 w-16 text-green-600 animate-spin mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-700">
            Processing Authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we complete your sign-in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-6">
      <div className="text-center space-y-8">
        {/* Success Animation */}
        <div className="relative">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <CheckCircle className="h-20 w-20 text-white" />
          </div>
          
          {/* Floating celebration icons */}
          <div className="absolute -top-4 -left-4 text-yellow-500 animate-bounce">
            <PartyPopper className="h-8 w-8" />
          </div>
          <div className="absolute -top-4 -right-4 text-pink-500 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <PartyPopper className="h-8 w-8" />
          </div>
          <div className="absolute -bottom-4 -left-6 text-blue-500 animate-bounce" style={{ animationDelay: '1s' }}>
            <PartyPopper className="h-6 w-6" />
          </div>
          <div className="absolute -bottom-4 -right-6 text-purple-500 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <PartyPopper className="h-6 w-6" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            Authentication Successful!
          </h1>
          
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-xl text-gray-700 font-medium">
              🎉 Welcome! 🎉
            </p>
            {userInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-semibold">
                  Signed in as: {userInfo.email}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Session ID: {sessionId}
                </p>
              </div>
            )}
            <p className="text-lg text-gray-600 leading-relaxed">
              You have successfully authenticated with Google. You can now proceed to mark attendance.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
              <p className="text-green-800 font-semibold">
                ✅ You're all set!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Feel free to close this tab now.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
} 