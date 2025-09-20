// app/(auth)/signup/page.tsx
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

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignUp = async () => {
    // Validate form fields
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.name
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Store user data in cookie (30 days expiry)
      setCookie("ouser", JSON.stringify(data.user), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      toast.success("Account created successfully!");
      router.push(`/u/${data.user.username}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Wick"
              required
              value={formData.name}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johnwick"
              required
              value={formData.username}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6">
          <Button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full py-2 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
