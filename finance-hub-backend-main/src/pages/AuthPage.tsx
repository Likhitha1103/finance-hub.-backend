import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Mail, Lock, Shield, Sparkles, TrendingUp, Wallet } from "lucide-react";

const roles = [
  { value: "viewer", label: "Viewer", icon: TrendingUp, description: "View reports only" },
  { value: "analyst", label: "Analyst", icon: Sparkles, description: "Analyze data & transactions" },
  { value: "admin", label: "Admin", icon: Shield, description: "Full system access" },
] as const;

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("viewer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Email and password are required.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      await login(email, password, role);
      navigate("/dashboard", { replace: true });
      toast({ title: "Welcome back!", description: `Signed in as ${role}.` });
    } catch (error: any) {
      toast({ title: "Login failed", description: error?.message ?? "Unable to sign in.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.value === role);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl mb-6">
              <Wallet className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Finance Hub</h1>
            <p className="text-slate-300 text-lg">Your gateway to financial insights</p>
          </div>

          {/* Main login card */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-semibold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-300">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email input */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>

                {/* Password input */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>

                {/* Role selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Select your role</label>
                  <Select value={role} onValueChange={(value) => setRole(value as typeof role)}>
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {roles.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <option.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-slate-400">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sign in button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Sign in as {selectedRole?.label}
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer text */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Use any mock credentials. Role selection determines available pages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="text-slate-300">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-400" />
              <p className="text-xs">Real-time Analytics</p>
            </div>
            <div className="text-slate-300">
              <Shield className="h-6 w-6 mx-auto mb-2 text-pink-400" />
              <p className="text-xs">Secure Access</p>
            </div>
            <div className="text-slate-300">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-xs">Smart Insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
