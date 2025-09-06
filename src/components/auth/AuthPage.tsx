import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Smartphone, Mail } from "lucide-react";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
    fullName: "",
    username: "",
    location: "",
    role: "member" as "member" | "admin"
  });

  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            username: formData.username,
            location: formData.location,
            role: formData.role
          }
        }
      });

      if (signUpError) {
        toast({
          title: "Error",
          description: signUpError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formData.phone,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            location: formData.location,
            role: formData.role
          }
        }
      });

      if (error) {
        let errorMessage = error.message;
        
        // Handle phone provider error specifically
        if (error.message.includes('Phone provider not supported') || 
            error.message.includes('SMS not configured') ||
            error.message.includes('provider')) {
          errorMessage = "Phone authentication is not configured. Please use email signup or contact support to enable SMS authentication.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formData.phone,
        token: formData.otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Phone verified successfully!"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formData.phone
      });

      if (error) {
        let errorMessage = error.message;
        
        // Handle phone provider error specifically
        if (error.message.includes('Phone provider not supported') || 
            error.message.includes('SMS not configured') ||
            error.message.includes('provider')) {
          errorMessage = "Phone authentication is not configured. Please use email signin or contact support to enable SMS authentication.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Goji Mountain Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-90 pointer-events-none"
        style={{
          backgroundImage: "url('/lovable-uploads/97d6d151-c5ea-473d-9760-e6950ec3c358.png')"
        }}
      />
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative z-10 safe-area-pb">
        <Card className="w-full max-w-sm sm:max-w-md bg-card/95 backdrop-blur-sm border-2 shadow-lg">
        <CardHeader className="text-center pb-4 px-4 sm:px-6">
          <img src="/goji-logo.png" alt="Goji" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3" />
          <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
            Welcome to Goji Community
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Join the language preservation community with email or phone</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="signin" className="text-sm sm:text-base">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-4">
              <div className="space-y-4">
                {/* Auth Method Selection */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base min-h-[44px]"
                    onClick={() => {
                      setAuthMethod('email');
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: "" }));
                    }}
                  >
                    <Mail className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Email</span>
                    <span className="xs:hidden">✉️</span>
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base min-h-[44px]"
                    onClick={() => {
                      setAuthMethod('phone');
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: "" }));
                    }}
                  >
                    <Smartphone className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Phone</span>
                    <span className="xs:hidden">📱</span>
                  </Button>
                </div>

                {/* Email Sign In */}
                {authMethod === 'email' && (
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-11 text-base"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-11 text-base pr-10"
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                )}

                {/* Phone Sign In */}
                {authMethod === 'phone' && !otpSent && (
                  <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-phone" className="text-sm font-medium">Phone Number</Label>
                      <Input
                        id="signin-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-11 text-base"
                        required
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Enter your phone number with country code (e.g., +1234567890). 
                        <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                          Note: SMS authentication may not be configured yet.
                        </span>
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Send Verification Code"}
                    </Button>
                  </form>
                )}

                {/* OTP Verification */}
                {authMethod === 'phone' && otpSent && (
                  <form onSubmit={verifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-otp" className="text-sm font-medium">Verification Code</Label>
                      <Input
                        id="signin-otp"
                        type="text"
                        placeholder="123456"
                        value={formData.otp}
                        onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                        maxLength={6}
                        className="h-11 text-base text-center text-lg tracking-widest"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        required
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code sent to {formData.phone}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setOtpSent(false);
                          setFormData(prev => ({ ...prev, otp: "" }));
                        }}
                        className="flex-1 h-11 text-base"
                      >
                        Change Number
                      </Button>
                      <Button type="submit" className="flex-1 h-11 text-base font-medium" disabled={isVerifying}>
                        {isVerifying ? "Verifying..." : "Verify & Sign In"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <div className="space-y-4">
                {/* Auth Method Selection */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base min-h-[44px]"
                    onClick={() => {
                      setAuthMethod('email');
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: "" }));
                    }}
                  >
                    <Mail className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Email</span>
                    <span className="xs:hidden">✉️</span>
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base min-h-[44px]"
                    onClick={() => {
                      setAuthMethod('phone');
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: "" }));
                    }}
                  >
                    <Smartphone className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Phone</span>
                    <span className="xs:hidden">📱</span>
                  </Button>
                </div>

                {/* Common Profile Fields */}
                {!otpSent && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="h-11 text-base"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="h-11 text-base"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Optional"
                        className="h-11 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                      <Select value={formData.role} onValueChange={(value: "member" | "admin") => setFormData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border shadow-md">
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Email Sign Up */}
                {authMethod === 'email' && (
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                )}

                {/* Phone Sign Up */}
                {authMethod === 'phone' && !otpSent && (
                  <form onSubmit={sendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-sm font-medium">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-11 text-base"
                        required
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Enter your phone number with country code (e.g., +1234567890). 
                        <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                          Note: SMS authentication may not be configured yet.
                        </span>
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Send Verification Code"}
                    </Button>
                  </form>
                )}

                {/* OTP Verification for Signup */}
                {authMethod === 'phone' && otpSent && (
                  <form onSubmit={verifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-otp" className="text-sm font-medium">Verification Code</Label>
                      <Input
                        id="signup-otp"
                        type="text"
                        placeholder="123456"
                        value={formData.otp}
                        onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                        maxLength={6}
                        className="h-11 text-base text-center text-lg tracking-widest"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        required
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code sent to {formData.phone}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setOtpSent(false);
                          setFormData(prev => ({ ...prev, otp: "" }));
                        }}
                        className="flex-1 h-11 text-base"
                      >
                        Change Number
                      </Button>
                      <Button type="submit" className="flex-1 h-11 text-base font-medium" disabled={isVerifying}>
                        {isVerifying ? "Verifying..." : "Verify & Create Account"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full mt-4 h-11 text-base font-medium"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm sm:text-base">Continue with Google</span>
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;