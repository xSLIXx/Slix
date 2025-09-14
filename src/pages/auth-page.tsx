import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, UserPlus, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              {isLogin ? (
                <Shield className="text-2xl text-primary-foreground" />
              ) : (
                <UserPlus className="text-2xl text-primary-foreground" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Prime UI</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Secure Authentication Portal" : "Join Prime UI Platform"}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-card border border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-foreground">Email or Username</Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    {...loginForm.register("username")}
                    placeholder="Enter your email or username"
                    className="mt-2"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      {...loginForm.register("password")}
                      placeholder="Enter your password"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      data-testid="button-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  data-testid="button-login"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="reg-username" className="text-foreground">Username</Label>
                  <Input
                    id="reg-username"
                    data-testid="input-register-username"
                    {...registerForm.register("username")}
                    placeholder="Choose a username"
                    className="mt-2"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    {...registerForm.register("email")}
                    placeholder="Enter your email"
                    className="mt-2"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-password" className="text-foreground">Password</Label>
                  <Input
                    id="reg-password"
                    data-testid="input-register-password"
                    type="password"
                    {...registerForm.register("password")}
                    placeholder="Create a strong password"
                    className="mt-2"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirm-password"
                      data-testid="input-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerForm.register("confirmPassword")}
                      placeholder="Confirm your password"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      data-testid="button-toggle-confirm-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a>
                  </Label>
                </div>

                <Button
                  type="submit"
                  data-testid="button-register"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  data-testid={isLogin ? "button-show-register" : "button-show-login"}
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
