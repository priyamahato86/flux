"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";
import { ArrowRight, LogOut, User, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Container = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const Button = ({
  as: Tag = "button",
  className = "",
  children,
  ...props
}: any) => (
  <Tag
    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

type User = {
  username: string;
  email: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserCookie = async () => {
      const userCookie = await getCookie("ouser");
      if (userCookie && typeof userCookie === "string") {
        try {
          setUser(JSON.parse(userCookie));
        } catch (e) {
          console.error("Failed to parse user cookie:", e);
          setUser(null);
        }
      }
    };

    fetchUserCookie();
  }, []);

  const handleSignOut = () => {
    deleteCookie("ouser");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100/80 backdrop-blur bg-white/75">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="relative h-8 w-8 rounded-xl bg-[var(--primarySoft)]">
            <div className="absolute inset-0 m-[6px] rounded-lg bg-[var(--primary)]/90" />
          </div>
          <span className="text-[var(--ink)]">
            Flux <span className="text-[var(--primary)]">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--subtext)]">
          <Link href="/#features" className="hover:text-[var(--ink)]">
            Features
          </Link>
          <Link href="/#how" className="hover:text-[var(--ink)]">
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
            <Link href="/datasets" className="hover:text-[var(--ink)]">
              Datasets
            </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[var(--primary)] text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/u/${user.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button className="border border-slate-200 bg-white text-[var(--ink)] hover:bg-[var(--muted)]">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[var(--primary)] text-white hover:bg-[var(--ink)]">
                  Get Started <ArrowRight className="ml-1" size={16} />
                </Button>
              </Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
