import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import cmacLogo from "@/assets/cmac-logo.png";
 import { lovable } from "@/integrations/lovable";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
   const [googleLoading, setGoogleLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const modeParam = searchParams.get("mode");
  const codeParam = searchParams.get("code");
  const isRecoveryMode = modeParam === "recovery";

  const [mode, setMode] = useState<"auth" | "recovery">(
    isRecoveryMode ? "recovery" : "auth"
  );

  const exchangeOnceRef = useRef(false);

  useEffect(() => {
    setMode(isRecoveryMode ? "recovery" : "auth");
  }, [isRecoveryMode]);

  useEffect(() => {
    if (!codeParam || exchangeOnceRef.current) return;
    exchangeOnceRef.current = true;

    setRecoveryLoading(true);
    supabase.auth
      .exchangeCodeForSession(codeParam)
      .then(({ error }) => {
        if (error) {
          toast({
            title: "Recovery link invalid",
            description: error.message,
            variant: "destructive",
          });
        }
      })
      .finally(() => setRecoveryLoading(false));
  }, [codeParam, toast]);

  const cleanedEmail = email.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(cleanedEmail, password);
        if (error) {
          const description =
            error.message === "Invalid login credentials"
              ? `Email or password is incorrect. Please verify the email address (we received: ${cleanedEmail}). If you're unsure, click “Forgot password?” to set a new one.`
              : error.message;

          toast({
            title: "Login failed",
            description,
            variant: "destructive",
          });
        } else {
          navigate("/");
        }
      } else {
        const { error } = await signUp(cleanedEmail, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created",
            description: "You can now sign in.",
          });
          setIsLogin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!cleanedEmail) {
      toast({
        title: "Enter your email",
        description: "Type your email address first, then click reset.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth?mode=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
        redirectTo,
      });

      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reset email sent",
        description: "Open the email link to set a new password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!cleanedEmail) {
      toast({
        title: "Enter your email",
        description: "Type your email address first, then click to send a sign-in link.",
        variant: "destructive",
      });
      return;
    }

    setMagicLinkLoading(true);
    try {
      const emailRedirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanedEmail,
        options: { emailRedirectTo },
      });

      if (error) {
        toast({
          title: "Couldn't send link",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sign-in link sent",
        description: "Check your email and open the link to sign in.",
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

   const handleGoogleSignIn = async () => {
     setGoogleLoading(true);
     try {
       const { error } = await lovable.auth.signInWithOAuth("google", {
         redirect_uri: window.location.origin,
       });
 
       if (error) {
         toast({
           title: "Google sign-in failed",
           description: error.message,
           variant: "destructive",
         });
       }
     } finally {
       setGoogleLoading(false);
     }
   };
 
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords don't match",
        description: "Make sure both password fields are the same.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "You're all set — signing you in now.",
      });

      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "recovery"
      ? "Set a new password"
      : isLogin
        ? "Welcome back"
        : "Get started";

  const description =
    mode === "recovery"
      ? "Choose a new password for your account."
      : isLogin
        ? "Sign in to your JobForge account"
        : "Create your JobForge account";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 pattern-grid relative overflow-hidden">
      <h1 className="sr-only">JobForge account access</h1>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-6 pb-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-sidebar shadow-lg">
              <img
                src={cmacLogo}
                alt="CMAC Roofing logo"
                className="h-10 object-contain invert"
                loading="lazy"
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {recoveryLoading ? (
            <div className="py-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <form
              onSubmit={mode === "recovery" ? handleUpdatePassword : handleSubmit}
              className="space-y-5"
            >
              {mode === "auth" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        Password
                      </Label>
                      {isLogin ? (
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                        >
                          Forgot password?
                        </button>
                      ) : null}
                    </div>

                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={loading || magicLinkLoading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                   <div className="relative my-4">
                     <div className="absolute inset-0 flex items-center">
                       <span className="w-full border-t border-border" />
                     </div>
                     <div className="relative flex justify-center text-xs uppercase">
                       <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                     </div>
                   </div>
 
                   <Button
                     type="button"
                     variant="outline"
                     className="w-full h-12 text-base"
                     onClick={handleGoogleSignIn}
                     disabled={loading || magicLinkLoading || googleLoading}
                   >
                     {googleLoading ? (
                       <span className="flex items-center gap-2">
                         <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                         Signing in...
                       </span>
                     ) : (
                       <span className="flex items-center gap-2">
                         <svg className="w-5 h-5" viewBox="0 0 24 24">
                           <path
                             fill="currentColor"
                             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                           />
                           <path
                             fill="currentColor"
                             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                           />
                           <path
                             fill="currentColor"
                             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                           />
                           <path
                             fill="currentColor"
                             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                           />
                         </svg>
                         Continue with Google
                       </span>
                     )}
                   </Button>
 
                  {isLogin ? (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full h-12 text-base"
                        onClick={handleMagicLink}
                        disabled={loading || magicLinkLoading}
                      >
                        {magicLinkLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Email me a sign-in link"
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        If your account was created in the backend and the password won’t work, use this or
                        “Forgot password?” to set a new password.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 text-center">
                    <span className="text-muted-foreground">
                      {isLogin ? "New to JobForge? " : "Already have an account? "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {isLogin ? "Create an account" : "Sign in"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-semibold">
                      New password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Create a new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-12"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword" className="text-sm font-semibold">
                      Confirm new password
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Re-enter the new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-12"
                      autoComplete="new-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Update password"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Back to sign in
                  </Button>
                </>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
