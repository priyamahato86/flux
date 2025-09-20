// const Page = () => {
//   return (
//     <div>
//       <h1>Home</h1>
//     </div>
//   );
// };

// export default Page;

// app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome</h1>
      <p className="text-gray-600 mb-6">Dummy Auth with Next.js and Cookies</p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
