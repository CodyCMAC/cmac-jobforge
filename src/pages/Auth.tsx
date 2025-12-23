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

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

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
                    disabled={loading}
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
