// import { cookies } from "next/headers";
// import { getCookie } from "cookies-next";
// import { redirect } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Github, Twitter, Linkedin, Book, FileText, PlusCircle } from "lucide-react";
// import Link from "next/link";

// // Helper function to fetch user's contributions based on the schema
// const getUserContributions = async (username: string) => {
//   // In a real app, this data would come from your database, joining the User model with their related content
//   return {
//     datasets: [
//       { id: 'cifar-10', title: 'CIFAR-10 Images', description: 'A collection of 60,000 32x32 colour images in 10 classes.', tags: ['Computer Vision', 'Images'] },
//       { id: 'imdb-reviews', title: 'IMDB Movie Reviews', description: 'A dataset for binary sentiment classification.', tags: ['NLP', 'Text'] },
//       { id: 'titanic', title: 'Titanic Survival Data', description: 'Predict survival on the Titanic.', tags: ['Classification', 'Tabular'] },
//       { id: 'boston-housing', title: 'Boston Housing Prices', description: 'A dataset for regression tasks.', tags: ['Regression', 'Housing'] },
//     ],
//     // "papers" can be analogous to the "notebooks" field in your schema
//     notebooks: [
//       { title: 'Attention Is All You Need: A Deep Dive', authors: 'Vaswani, A. et al.', venue: 'NeurIPS 2017' },
//       { title: 'Exploring Generative Adversarial Nets', authors: 'Goodfellow, I. et al.', venue: 'NeurIPS 2014' },
//     ]
//   };
// };

// export default async function UserProfilePage({
//   params,
// }: {
//   params: Promise<{ username: string }>;
// }) {
//   const { username } = await params;

//   const userCookie = await getCookie("ouser", { cookies });

//   if (!userCookie) {
//     redirect("/login");
//   }

//   // Assuming the cookie now contains a structure matching your User schema
//   const userData = JSON.parse(userCookie);

//   // Security check: ensure the logged-in user can only see their own profile
//   if (userData.username !== username) {
//     return (
//       <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
//             <p className="text-muted-foreground">You are not authorized to view this page.</p>
//           </div>
//       </div>
//     );
//   }

//   const userContributions = await getUserContributions(username);

//   return (
//     <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
//       {/* Updated grid layout to make the left sidebar wider */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {/* Left Sidebar: User Profile (now wider) */}
//         <aside className="md:col-span-1">
//           <Card className="h-full">
//             <CardContent className="pt-6 flex flex-col items-center text-center">
//               <Avatar className="h-24 w-24 mb-4">
//                 {/* The AvatarImage can now be used with the 'avatar' field from your schema */}
//                 {userData.avatar && <AvatarImage src={userData.avatar} alt={userData.username} />}
//                 <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
//                   {userData.name.charAt(0).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>
//               {/* Displaying name from schema */}
//               <h1 className="text-2xl font-bold">{userData.name}</h1>
//               {/* Displaying username from schema */}
//               <p className="text-sm text-muted-foreground">@{userData.username}</p>

//               {/* Displaying bio from schema */}
//               <p className="mt-4 text-sm text-center">
//                 {userData.bio || "AI enthusiast & Data Scientist. Passionate about open-source."}
//               </p>

//               <div className="flex items-center justify-center gap-4 mt-6">
//                 <Link href="#" className="text-muted-foreground hover:text-foreground"><Github size={20} /></Link>
//                 <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter size={20} /></Link>
//                 <Link href="#" className="text-muted-foreground hover:text-foreground"><Linkedin size={20} /></Link>
//               </div>
//             </CardContent>
//           </Card>
//         </aside>

//         {/* Right Content Area: Datasets and Notebooks (now narrower) */}
//         <main className="md:col-span-2 space-y-12">
//           {/* Datasets Section */}
//           <section>
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-2xl font-bold">Datasets ({userContributions.datasets.length})</h2>
//                 <Link href="/ds/create">
//                     <Button  size="sm">
//                         <PlusCircle size={16} className="mr-2" />
//                         Add Dataset
//                     </Button>
//                 </Link>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {userContributions.datasets.map((dataset) => (
//                 <Card key={dataset.id} className="hover:shadow-md transition-shadow">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Book size={18} />
//                         <Link href={`/ds/${dataset.id}`} className="hover:underline">{dataset.title}</Link>
//                     </CardTitle>
//                     <CardDescription>{dataset.description}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex flex-wrap gap-2">
//                       {dataset.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </section>

//           {/* Notebooks/Research Papers Section */}
//           <section>
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-2xl font-bold">Notebooks</h2>
//                 <Link href="/ds/create">
//                     <Button size="sm">
//                         <PlusCircle size={16} className="mr-2" />
//                         Add Notebook
//                     </Button>
//                 </Link>
//             </div>
//             <div className="space-y-4">
//               {userContributions.notebooks.map((notebook, index) => (
//                 <Card key={index} className="hover:shadow-md transition-shadow">
//                   <CardContent className="pt-6">
//                     <div className="flex items-start gap-4">
//                       <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
//                       <div>
//                         <h3 className="font-semibold">{notebook.title}</h3>
//                         <p className="text-sm text-muted-foreground">{notebook.authors} &middot; {notebook.venue}</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }

import { getCookie } from "cookies-next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Twitter,
  Linkedin,
  Book,
  FileText,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// Define types for our data structures
type UserData = {
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
};

type Dataset = {
  id: string; // This will be the slug for the URL
  title: string;
  description: string;
  tags: string[];
};

type Notebook = {
  title: string;
  authors: string;
  venue: string;
};

type UserContributions = {
  datasets: Dataset[];
  notebooks: Notebook[];
};

// Dummy data for notebooks remains as there's no creation page for them
const nb: Notebook[] = [
  {
    title: "Attention Is All You Need: A Deep Dive",
    authors: "Vaswani, A. et al.",
    venue: "NeurIPS 2017",
  },
  {
    title: "Exploring Generative Adversarial Nets",
    authors: "Goodfellow, I. et al.",
    venue: "NeurIPS 2014",
  },
];

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  //   const userCookie = await getCookie("ouser", { cookies });
  //   console.log("User Cookie:", userCookie);
  //   const parsedUserData = JSON.parse(userCookie as string);

  const user = await prisma.user.findUnique({
    where: { username },
  });

  const data = await prisma.dataset.findMany({
    where: { ownerId: user?.id },
  });

  console.log(data);

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} alt={user?.username || ""} />
                )}
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              <p className="mt-4 text-sm text-center">
                {user?.bio ||
                  "AI enthusiast & Data Scientist. Passionate about open-source."}
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Github size={20} />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Twitter size={20} />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Linkedin size={20} />
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Datasets ({data.length})</h2>
              <Link href="/ds/create">
                <Button variant="outline" size="sm">
                  <PlusCircle size={16} className="mr-2" />
                  Add Dataset
                </Button>
              </Link>
            </div>
            {data.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.map((data) => (
                  <Card
                    key={data.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book size={18} />
                        <Link
                          href={`/ds/${data.id}`}
                          className="hover:underline"
                        >
                          {data.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>{data.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No datasets created yet.
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Notebooks</h2>
              <Link href="/ds/create">
                <Button variant="outline" size="sm">
                  <PlusCircle size={16} className="mr-2" />
                  Add Notebook
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {nb.map((notebook, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{notebook.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {notebook.authors} &middot; {notebook.venue}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
