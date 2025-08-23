import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_CONFIG } from "@/config/google";

// Function to exchange authorization code for user info
async function getUserInfoFromCode(code: string) {
  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.CLIENT_ID || '',
        client_secret: GOOGLE_CONFIG.CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_CONFIG.REDIRECT_URI || '',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Use access token to get user info
    const userResponse = await fetch(GOOGLE_CONFIG.USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    return await userResponse.json();
  } catch (error) {
    console.error('Error getting user info from code:', error);
    return null;
  }
}

export function OAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get the authorization code from URL
        const code = searchParams.get('code');
        const sessionId = searchParams.get('state'); // We'll use state parameter to pass sessionId
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange authorization code for access token and get user info
        const userInfo = await getUserInfoFromCode(code);
        
        if (!userInfo || !userInfo.email) {
          throw new Error('Failed to get user information from Google');
        }
        
        // Validate CHARUSAT email
        if (!userInfo.email.endsWith('@charusat.edu.in')) {
          toast({
            title: "Invalid Email Domain",
            description: `Please use your CHARUSAT official account. You signed in with: ${userInfo.email}`,
            variant: "destructive",
          });
          // Redirect back to student auth with sessionId if available
          if (sessionId) {
            navigate(`/student-auth/${sessionId}`);
          } else {
            navigate('/');
          }
          return;
        }

        // Store authentication data
        const authData = {
          email: userInfo.email,
          sessionId: sessionId || 'default',
          isValid: true,
          timestamp: new Date().toISOString(),
          name: userInfo.name || userInfo.email.split('@')[0],
          picture: userInfo.picture || ""
        };
        
        localStorage.setItem(`studentAuth_${sessionId || 'default'}`, JSON.stringify(authData));
        
        console.log('✅ Authentication successful for:', userInfo.email);
        toast({
          title: "Authentication Successful!",
          description: `Welcome ${userInfo.name || userInfo.email.split('@')[0]}! Redirecting to attendance page...`,
        });

        // Redirect to StudentAttendance page for selfie capture
        if (sessionId) {
          navigate(`/student-attendance/${sessionId}`);
        } else {
          navigate('/student-attendance/default');
        }
        
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to process Google authentication. Please try again.",
          variant: "destructive",
        });
        // Redirect back to student auth with sessionId if available
        if (sessionId) {
          navigate(`/student-auth/${sessionId}`);
        } else {
          navigate('/');
        }
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="text-center space-y-6">
        <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Processing Google Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your sign-in and redirect you to the attendance page.
        </p>
      </div>
    </div>
  );
}
