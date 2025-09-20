"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      
      setCookie("ouser", JSON.stringify(data.user), {
        maxAge: 60 * 60 * 24 * 30, 
        path: "/",
      });

      toast.success("Logged in successfully!");
      router.push(`/u/${data.user.username}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johnwick"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="......"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-2 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
