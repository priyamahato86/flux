// app/u/[username]/page.tsx
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

// Make the component async
export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  // Await the promise to get the actual cookie value
  const userCookie = await getCookie("ouser", { cookies });

  if (!userCookie) {
    redirect("/login");
  }

  // Now userCookie is a string, so JSON.parse will work
  const userData = JSON.parse(userCookie);

  if (userData.username !== username) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-3xl">
          Welcome, {userData.username}!
        </CardTitle>
        <CardDescription>This is your profile page.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Username:</span> {userData.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {userData.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
