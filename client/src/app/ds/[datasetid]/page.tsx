// app/ds/[datasetid]/page.tsx
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { 
//   Download, 
//   MessageSquare, 
//   BookText,
//   Info,
//   File,
//   Folder,
//   GitMerge,
//   BarChart3,
//   Settings,
//   Pencil,
//   Tag,
//   Milestone,
//   ChevronDown,
//   Dot
// } from "lucide-react";

// // Dummy data remains the same
// const getDatasetDetails = async (datasetId: string) => {
//   return {
//     id: datasetId,
//     title: "flux",
//     author: "thtskaran",
//     longTitle: "BI Intro to Data Cleaning, EDA and Machine Learning",
//     updatedAt: "18 hours ago",
//     usability: 9.41,
//     license: "CC0: Public Domain",
//     tags: ["Business", "Computer Science", "Education", "Data Cleaning", "Regression"],
//     description: "This dataset, titled 'Intro to Data Cleaning, EDA, and Machine Learning,' is designed to help learners practice essential data science techniques.",
//     overview: {
//         rows: 77,
//         columns: 11,
//         columnDetails: [
//             { name: "fNAME, lNAME", description: "First and last names of the student." },
//             { name: "Age", description: "Student's age, possibly affecting academic performance." },
//         ]
//     },
//     files: [{ name: "bi.csv", size: "5.06 KB" }],
//     previewData: [
//         { fName: 'Bjorn', lName: 'Hansen', Age: 3, gender: 'Female', country: 'Norway', 'residency status': 'Private', 'Math Score': 53, 'Python Score': 61, 'DB Score': 52 },
//         { fName: 'Emma', lName: 'Olsen', Age: 3, gender: 'Male', country: 'Uganda', 'residency status': 'Private', 'Math Score': 42, 'Python Score': 5, 'DB Score': 6 },
//     ],
//   };
// };

// // A helper component for filter dropdowns to avoid repetition
// const FilterDropdown = ({ label, items }: { label: string; items: string[] }) => (
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//       <Button variant="ghost" className="text-sm font-normal text-muted-foreground">
//         {label} <ChevronDown className="h-4 w-4 ml-1" />
//       </Button>
//     </DropdownMenuTrigger>
//     <DropdownMenuContent align="start">
//       <DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel>
//       <DropdownMenuSeparator />
//       {items.map(item => <DropdownMenuItem key={item}>{item}</DropdownMenuItem>)}
//     </DropdownMenuContent>
//   </DropdownMenu>
// );


// export default async function DatasetDetailsPage({
//   params,
// }: {
//   params: { datasetid: string };
// }) {
//   const dataset = await getDatasetDetails(params.datasetid);
//   const previewColumns = dataset.previewData.length > 0 ? Object.keys(dataset.previewData[0]) : [];

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       {/* --- GitHub-Style Header --- */}
//       <header className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//               <h1 className="text-xl font-semibold text-blue-500 hover:underline cursor-pointer">{dataset.title}</h1>
//               <span className="text-xs font-semibold border rounded-full px-2 py-0.5">Public</span>
//           </div>
//           <div className="flex items-center gap-2">
//               <Button variant="outline"> <Pencil className="mr-2 h-4 w-4" /> Edit</Button>
//               <Button> <Download className="mr-2 h-4 w-4" /> Download</Button>
//           </div>
//       </header>
      
//       {/* --- GitHub-Style Tab Navigation --- */}
//       <Tabs defaultValue="dataset" className="w-full">
//         <TabsList className="border-b-2 rounded-none p-0 h-auto bg-transparent">
//           {/* Tabs Triggers for Dataset, PR, etc. remain the same */}
//             <TabsTrigger value="dataset" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <BookText className="mr-2 h-4 w-4" /> Dataset
//             </TabsTrigger>
//             <TabsTrigger value="issues" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <MessageSquare className="mr-2 h-4 w-4" /> Issues
//             </TabsTrigger>
//             <TabsTrigger value="pr" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <GitMerge className="mr-2 h-4 w-4" /> Pull Requests
//             </TabsTrigger>
//             <TabsTrigger value="insights" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <BarChart3 className="mr-2 h-4 w-4" /> Insights
//             </TabsTrigger>
//             <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <Settings className="mr-2 h-4 w-4" /> Settings
//             </TabsTrigger>
//         </TabsList>

//         {/* --- Kaggle-Style Content for the "Dataset" Tab --- */}
//         <TabsContent value="dataset" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//             {/* Left Main Area */}
//             <div className="lg:col-span-3 space-y-8">
//               <h2 className="text-2xl font-bold">{dataset.longTitle}</h2>
//               {/* All the Kaggle-style cards for the dataset go here... */}
//             </div>
//             {/* Right Sidebar */}
//             <div className="lg:col-span-1 space-y-6">
//               {/* All the sidebar cards for the dataset go here... */}
//             </div>
//           </div>
//         </TabsContent>

//         {/* --- GitHub-Style UI for "Issues" Tab --- */}
//         <TabsContent value="issues" className="mt-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div className="flex-1">
//                   <Input 
//                       placeholder='is:issue is:open'
//                       className="w-full md:w-auto"
//                   />
//               </div>
//               <div className="flex items-center gap-2">
//                   <Button variant="outline"><Tag className="mr-2 h-4 w-4"/> Labels</Button>
//                   <Button variant="outline"><Milestone className="mr-2 h-4 w-4"/> Milestones</Button>
//                   <Button className="bg-green-600 hover:bg-green-700">New issue</Button>
//               </div>
//           </div>

//           <div className="border rounded-lg mt-4">
//               <div className="flex items-center justify-between p-4 border-b">
//                   <div className="flex items-center gap-4 text-sm font-medium">
//                       <button className="flex items-center gap-1">
//                           <Dot className="text-green-500 h-6 w-6"/> Open <Badge variant="secondary">0</Badge>
//                       </button>
//                       <button className="flex items-center gap-1 text-muted-foreground">
//                           Closed <Badge variant="secondary">0</Badge>
//                       </button>
//                   </div>
//                   <div className="flex items-center gap-4">
//                       <FilterDropdown label="Author" items={['thtskaran', 'another-user']} />
//                       <FilterDropdown label="Labels" items={['bug', 'documentation', 'enhancement']} />
//                       <FilterDropdown label="Projects" items={['Project Alpha']} />
//                       <FilterDropdown label="Milestones" items={['v1.0 Launch']} />
//                       <FilterDropdown label="Assignees" items={['thtskaran']} />
//                       <FilterDropdown label="Sort" items={['Newest', 'Oldest', 'Most commented']} />
//                   </div>
//               </div>
//               <div className="p-16 text-center">
//                   <h3 className="text-xl font-semibold">No results</h3>
//                   <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
//               </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="pr"><Card className="mt-6"><CardHeader><CardTitle>Pull Requests</CardTitle></CardHeader><CardContent><p>Pull Requests are not yet enabled.</p></CardContent></Card></TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { 
//   Download, 
//   MessageSquare, 
//   BookText,
//   Info,
//   File,
//   Folder,
//   GitMerge,
//   BarChart3,
//   Settings,
//   Pencil,
//   Tag,
//   Milestone,
//   ChevronDown,
//   Dot
// } from "lucide-react";

// const getDatasetDetails = async (datasetId: string) => {
//   return {
//     id: datasetId,
//     title: "flux",
//     author: "thtskaran",
//     longTitle: "BI Intro to Data Cleaning, EDA and Machine Learning",
//     updatedAt: "18 hours ago",
//     usability: 9.41,
//     license: "CC0: Public Domain",
//     tags: ["Business", "Computer Science", "Education", "Data Cleaning", "Regression"],
//     description: "This dataset, titled 'Intro to Data Cleaning, EDA, and Machine Learning,' is designed to help learners practice essential data science techniques.",
//     overview: {
//         rows: 77,
//         columns: 11,
//         columnDetails: [
//             { name: "fNAME, lNAME", description: "First and last names of the student." },
//             { name: "Age", description: "Student's age, possibly affecting academic performance." },
//         ]
//     },
//     files: [{ name: "bi.csv", size: "5.06 KB" }],
//     previewData: [
//         { fName: 'Bjorn', lName: 'Hansen', Age: 3, gender: 'Female', country: 'Norway', 'residency status': 'Private', 'Math Score': 53, 'Python Score': 61, 'DB Score': 52 },
//         { fName: 'Emma', lName: 'Olsen', Age: 3, gender: 'Male', country: 'Uganda', 'residency status': 'Private', 'Math Score': 42, 'Python Score': 5, 'DB Score': 6 },
//     ],
//   };
// };

// type PreviewRow = Awaited<ReturnType<typeof getDatasetDetails>>['previewData'][number];

// const FilterDropdown = ({ label, items }: { label: string; items: string[] }) => (
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//       <Button variant="ghost" className="text-sm font-normal text-muted-foreground">
//         {label} <ChevronDown className="h-4 w-4 ml-1" />
//       </Button>
//     </DropdownMenuTrigger>
//     <DropdownMenuContent align="start">
//       <DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel>
//       <DropdownMenuSeparator />
//       {items.map(item => <DropdownMenuItem key={item}>{item}</DropdownMenuItem>)}
//     </DropdownMenuContent>
//   </DropdownMenu>
// );

// export default async function DatasetDetailsPage({
//   params,
// }: {
//   params: { datasetid: string };
// }) {
//   const dataset = await getDatasetDetails(params.datasetid);
//   const previewColumns = dataset.previewData.length > 0 
//     ? Object.keys(dataset.previewData[0]) as Array<keyof PreviewRow>
//     : [];

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       <header className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//               <h1 className="text-xl font-semibold text-blue-500 hover:underline cursor-pointer">{dataset.title}</h1>
//               <span className="text-xs font-semibold border rounded-full px-2 py-0.5">Public</span>
//           </div>
//           <div className="flex items-center gap-2">
//               <Button variant="outline"> <Pencil className="mr-2 h-4 w-4" /> Edit</Button>
//               <Button> <Download className="mr-2 h-4 w-4" /> Download</Button>
//           </div>
//       </header>
      
//       <Tabs defaultValue="dataset" className="w-full">
//         <TabsList className="border-b-2 rounded-none p-0 h-auto bg-transparent">
//             <TabsTrigger value="dataset" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <BookText className="mr-2 h-4 w-4" /> Dataset
//             </TabsTrigger>
//             <TabsTrigger value="issues" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <MessageSquare className="mr-2 h-4 w-4" /> Issues
//             </TabsTrigger>
//             <TabsTrigger value="pr" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <GitMerge className="mr-2 h-4 w-4" /> Pull Requests
//             </TabsTrigger>
//             <TabsTrigger value="insights" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <BarChart3 className="mr-2 h-4 w-4" /> Insights
//             </TabsTrigger>
//             <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
//                 <Settings className="mr-2 h-4 w-4" /> Settings
//             </TabsTrigger>
//         </TabsList>

//         <TabsContent value="dataset" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//             <div className="lg:col-span-3 space-y-8">
//               <h2 className="text-2xl font-bold">{dataset.longTitle}</h2>
//               <Card>
//                 <CardHeader><CardTitle>About Dataset</CardTitle></CardHeader>
//                 <CardContent><p className="text-foreground/80">{dataset.description}</p></CardContent>
//               </Card>

//               <Card>
//                 <CardHeader><CardTitle>Dataset Overview</CardTitle></CardHeader>
//                 <CardContent>
//                   <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
//                     <li><b>{dataset.overview.rows} Rows and {dataset.overview.columns} Columns</b></li>
//                     {dataset.overview.columnDetails.map(col => (<li key={col.name}><b>{col.name}</b>: {col.description}</li>))}
//                   </ul>
//                   <Button variant="link" className="p-0 h-auto mt-2">View more</Button>
//                 </CardContent>
//               </Card>

//               <Card>
//                  <CardHeader>
//                     <CardTitle>Data Preview</CardTitle>
//                     <CardDescription>Top rows from the primary file: {dataset.files[0].name}</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="overflow-x-auto">
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>{previewColumns.map(col => <TableHead key={col}>{col}</TableHead>)}</TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {dataset.previewData.map((row, rowIndex) => (
//                                     <TableRow key={rowIndex}>
//                                         {previewColumns.map(col => (
//                                             <TableCell key={col}>
//                                                 {typeof row[col] === 'number' ? (
//                                                     <div className="flex items-center gap-2">
//                                                         <span className="w-8 text-right">{row[col]}%</span>
//                                                         <Progress value={row[col] as number} className="w-24 h-2"/>
//                                                     </div>
//                                                 ) : (row[col])}
//                                             </TableCell>
//                                         ))}
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </div>
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="lg:col-span-1 space-y-6">
//               <Card>
//                 <CardHeader>
//                     <CardTitle className="text-lg flex justify-between items-center">
//                         Usability
//                         <TooltipProvider>
//                             <Tooltip>
//                                 <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
//                                 <TooltipContent><p>Usability score for this dataset</p></TooltipContent>
//                             </Tooltip>
//                         </TooltipProvider>
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent><p className="text-3xl font-bold">{dataset.usability}</p></CardContent>
//               </Card>
//               <Card>
//                   <CardContent className="pt-6 text-sm space-y-3">
//                       <div>
//                           <p className="font-semibold">License</p>
//                           <p className="text-muted-foreground">{dataset.license}</p>
//                       </div>
//                        <div>
//                           <p className="font-semibold">Tags</p>
//                           <div className="flex flex-wrap gap-2 mt-2">
//                               {dataset.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
//                           </div>
//                       </div>
//                   </CardContent>
//               </Card>
//               <Card>
//                 <CardHeader><CardTitle className="text-lg">Data Explorer</CardTitle></CardHeader>
//                 <CardContent>
//                     <Accordion type="single" collapsible defaultValue="item-1">
//                       <AccordionItem value="item-1">
//                         <AccordionTrigger className="text-sm font-semibold">
//                           <div className="flex items-center gap-2"><Folder className="h-4 w-4"/><span>{dataset.id}</span></div>
//                         </AccordionTrigger>
//                         <AccordionContent className="pl-4">
//                             {dataset.files.map(file => (<div key={file.name} className="flex items-center gap-2 py-1"><File className="h-4 w-4 text-muted-foreground"/><span className="text-sm">{file.name}</span></div>))}
//                         </AccordionContent>
//                       </AccordionItem>
//                     </Accordion>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="issues" className="mt-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div className="flex-1">
//                   <Input 
//                       placeholder='is:issue is:open'
//                       className="w-full md:w-auto"
//                   />
//               </div>
//               <div className="flex items-center gap-2">
//                   <Button variant="outline"><Tag className="mr-2 h-4 w-4"/> Labels</Button>
//                   <Button variant="outline"><Milestone className="mr-2 h-4 w-4"/> Milestones</Button>
//                   <Button className="bg-green-600 hover:bg-green-700">New issue</Button>
//               </div>
//           </div>

//           <div className="border rounded-lg mt-4">
//               <div className="flex items-center justify-between p-4 border-b">
//                   <div className="flex items-center gap-4 text-sm font-medium">
//                       <button className="flex items-center gap-1">
//                           <Dot className="text-green-500 h-6 w-6"/> Open <Badge variant="secondary">0</Badge>
//                       </button>
//                       <button className="flex items-center gap-1 text-muted-foreground">
//                           Closed <Badge variant="secondary">0</Badge>
//                       </button>
//                   </div>
//                   <div className="hidden md:flex items-center gap-4">
//                       <FilterDropdown label="Author" items={['thtskaran', 'another-user']} />
//                       <FilterDropdown label="Labels" items={['bug', 'documentation', 'enhancement']} />
//                       <FilterDropdown label="Projects" items={['Project Alpha']} />
//                       <FilterDropdown label="Milestones" items={['v1.0 Launch']} />
//                       <FilterDropdown label="Assignees" items={['thtskaran']} />
//                       <FilterDropdown label="Sort" items={['Newest', 'Oldest', 'Most commented']} />
//                   </div>
//               </div>
//               <div className="p-16 text-center">
//                   <h3 className="text-xl font-semibold">No results</h3>
//                   <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
//               </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="pr"><Card className="mt-6"><CardHeader><CardTitle>Pull Requests</CardTitle></CardHeader><CardContent><p>Pull Requests are not yet enabled.</p></CardContent></Card></TabsContent>
//         <TabsContent value="insights"><Card className="mt-6"><CardHeader><CardTitle>Insights</CardTitle></CardHeader><CardContent><p>Insights are not yet enabled.</p></CardContent></Card></TabsContent>
//         <TabsContent value="settings"><Card className="mt-6"><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent><p>Settings are not yet enabled.</p></CardContent></Card></TabsContent>
//       </Tabs>
//     </div>
//   );
// }

"use client"; // Required for state and interactivity in the Issues tab

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Download, 
  MessageSquare, 
  BookText,
  Info,
  File,
  Folder,
  GitMerge,
  BarChart3,
  Settings,
  Pencil,
  Tag,
  Milestone,
  ChevronDown,
  Dot
} from "lucide-react";
import { toast } from "sonner";

// --- Data & Type Definitions ---
const getDatasetDetails = async (datasetId: string) => {
  return {
    id: datasetId,
    title: "flux",
    author: "thtskaran",
    longTitle: "BI Intro to Data Cleaning, EDA and Machine Learning",
    updatedAt: "18 hours ago",
    usability: 9.41,
    license: "CC0: Public Domain",
    tags: ["Business", "Computer Science", "Education", "Data Cleaning", "Regression"],
    description: "This dataset, titled 'Intro to Data Cleaning, EDA, and Machine Learning,' is designed to help learners practice essential data science techniques.",
    overview: { rows: 77, columns: 11, columnDetails: [{ name: "fNAME, lNAME", description: "First and last names of the student." },{ name: "Age", description: "Student's age, possibly affecting academic performance." }] },
    files: [{ name: "bi.csv", size: "5.06 KB" }],
    previewData: [
        { fName: 'Bjorn', lName: 'Hansen', Age: 3, gender: 'Female', country: 'Norway', 'residency status': 'Private', 'Math Score': 53, 'Python Score': 61, 'DB Score': 52 },
        { fName: 'Emma', lName: 'Olsen', Age: 3, gender: 'Male', country: 'Uganda', 'residency status': 'Private', 'Math Score': 42, 'Python Score': 5, 'DB Score': 6 },
    ],
  };
};

type PreviewRow = Awaited<ReturnType<typeof getDatasetDetails>>['previewData'][number];

type Label = { name: string; color: string; };
type Issue = { id: number; title: string; author: string; time: string; label: Label; };

const LABELS: Label[] = [
  { name: 'bug', color: 'bg-red-500' },
  { name: 'feature', color: 'bg-purple-500' },
  { name: 'documentation', color: 'bg-blue-500' },
  { name: 'enhancement', color: 'bg-green-500' },
];

const initialIssues: Issue[] = [
    { id: 1, title: "Data preview table not responsive on small screens", author: "thtskaran", time: "2 hours ago", label: LABELS[0] },
    { id: 2, title: "Add support for CSV file downloads", author: "another-user", time: "5 hours ago", label: LABELS[1] },
];

// --- Reusable Components ---
const FilterDropdown = ({ label, items }: { label: string; items: string[] }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="text-sm font-normal text-muted-foreground">{label} <ChevronDown className="h-4 w-4 ml-1" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {items.map(item => <DropdownMenuItem key={item}>{item}</DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Client Component for the Issues Tab ---
const IssuesTab = () => {
    const [issues, setIssues] = useState<Issue[]>(initialIssues);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newIssueTitle, setNewIssueTitle] = useState("");
    const [newIssueDescription, setNewIssueDescription] = useState("");

    const handleCreateIssue = () => {
        if (!newIssueTitle) {
            toast.error("Title is required to create an issue.");
            return;
        }
        const randomLabel = LABELS[Math.floor(Math.random() * LABELS.length)];
        const newIssue: Issue = {
            id: issues.length + 1,
            title: newIssueTitle,
            author: 'thtskaran', // Or get from auth context
            time: 'just now',
            label: randomLabel
        };
        setIssues([newIssue, ...issues]);
        setIsDialogOpen(false);
        setNewIssueTitle("");
        setNewIssueDescription("");
        toast.success("New issue created successfully!");
    };

    return (
        <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1"><Input placeholder='is:issue is:open' className="w-full md:w-auto"/></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Tag className="mr-2 h-4 w-4"/> Labels</Button>
                    <Button variant="outline"><Milestone className="mr-2 h-4 w-4"/> Milestones</Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700">New issue</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create a new issue</DialogTitle>
                                <DialogDescription>Provide a title and description for your issue.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input id="title" placeholder="Title" value={newIssueTitle} onChange={(e) => setNewIssueTitle(e.target.value)} />
                                <Textarea id="description" placeholder="Leave a comment" value={newIssueDescription} onChange={(e) => setNewIssueDescription(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateIssue}>Submit new issue</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="border rounded-lg mt-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <button className="flex items-center gap-1"><Dot className="text-green-500 h-6 w-6"/> Open <Badge variant="secondary">{issues.length}</Badge></button>
                        <button className="flex items-center gap-1 text-muted-foreground">Closed <Badge variant="secondary">0</Badge></button>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <FilterDropdown label="Author" items={['thtskaran', 'another-user']} />
                        <FilterDropdown label="Labels" items={LABELS.map(l => l.name)} />
                        <FilterDropdown label="Sort" items={['Newest', 'Oldest']} />
                    </div>
                </div>
                {issues.length > 0 ? (
                    <div>
                        {issues.map(issue => (
                            <div key={issue.id} className="flex items-center gap-3 p-4 border-b last:border-b-0">
                                <Dot className="text-green-500 h-6 w-6" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <a href="#" className="font-semibold hover:text-blue-600">{issue.title}</a>
                                        <Badge style={{ backgroundColor: issue.label.color, color: 'white' }} className="border-transparent">{issue.label.name}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">#{issue.id} opened {issue.time} by {issue.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <h3 className="text-xl font-semibold">No results</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Client Component for the Pull Requests Tab ---
const PullRequestsTab = () => {
    const [pullRequests, setPullRequests] = useState<PullRequest[]>(initialPRs);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPRTitle, setNewPRTitle] = useState("");
    const [newPRDescription, setNewPRDescription] = useState("");
    const modifiedFiles: ModifiedFile[] = [{ name: "bi.csv", changes: "+10 -5" }];

    const handleCreatePR = () => {
        if (!newPRTitle) { toast.error("Title is required to create a pull request."); return; }
        const newPR: PullRequest = { id: pullRequests.length + 1, title: newPRTitle, author: 'thtskaran', time: 'just now' };
        setPullRequests([newPR, ...pullRequests]);
        setIsDialogOpen(false);
        setNewPRTitle("");
        setNewPRDescription("");
        toast.success("New pull request created successfully!");
    };

    return (
        <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1"><Input placeholder='is:pr is:open' className="w-full md:w-auto"/></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Tag className="mr-2 h-4 w-4"/> Labels</Button>
                    <Button variant="outline"><Milestone className="mr-2 h-4 w-4"/> Milestones</Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700">New pull request</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <DialogHeader><DialogTitle>Create a new pull request</DialogTitle><DialogDescription>Suggest changes to the dataset.</DialogDescription></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input id="title" placeholder="Title" value={newPRTitle} onChange={(e) => setNewPRTitle(e.target.value)} />
                                <Textarea id="description" placeholder="Leave a comment" value={newPRDescription} onChange={(e) => setNewPRDescription(e.target.value)} />
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Modified Files</CardTitle></CardHeader>
                                    <CardContent>
                                        {modifiedFiles.map(file => (
                                            <div key={file.name} className="flex items-center justify-between text-sm">
                                                <span>{file.name}</span>
                                                <span className="font-mono text-green-500">{file.changes}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                            <DialogFooter><Button onClick={handleCreatePR}>Create pull request</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="border rounded-lg mt-4">
                {pullRequests.length > 0 ? (
                     <div>
                        {pullRequests.map(pr => (
                            <div key={pr.id} className="flex items-center gap-3 p-4 border-b last:border-b-0">
                                <GitPullRequest className="text-green-500 h-6 w-6" />
                                <div className="flex-1">
                                    <a href="#" className="font-semibold hover:text-blue-600">{pr.title}</a>
                                    <p className="text-xs text-muted-foreground mt-1">#{pr.id} opened {pr.time} by {pr.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mt-4">Welcome to pull requests!</h3>
                        <p className="text-muted-foreground mt-2">To get started, you should create a pull request.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---
// Note: This needs to be a client component to host the interactive IssuesTab
export default function DatasetDetailsPage() {
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;
    
    const [dataset, setDataset] = useState<Awaited<ReturnType<typeof getDatasetDetails>> | null>(null);

    useEffect(() => {
        let isMounted = true; // Flag to check if the component is still mounted

        if (datasetid) {
            getDatasetDetails(datasetid).then(data => {
                if (isMounted) {
                    setDataset(data);
                }
            });
        }

        // Cleanup function: runs when the component unmounts
        return () => {
            isMounted = false;
        };
    }, [datasetid]);

    if (!dataset) {
        return <div className="container mx-auto p-8">Loading...</div>;
    }
    
    const previewColumns = dataset.previewData.length > 0 
        ? Object.keys(dataset.previewData[0]) as Array<keyof PreviewRow>
        : [];
  
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-blue-500 hover:underline cursor-pointer">{dataset.title}</h1>
                    <span className="text-xs font-semibold border rounded-full px-2 py-0.5">Public</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"> <Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                    <Button> <Download className="mr-2 h-4 w-4" /> Download</Button>
                </div>
            </header>
          
            <Tabs defaultValue="dataset" className="w-full">
                <TabsList className="border-b-2 rounded-none p-0 h-auto bg-transparent">
                    <TabsTrigger value="dataset" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"><BookText className="mr-2 h-4 w-4" /> Dataset</TabsTrigger>
                    <TabsTrigger value="issues" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"><MessageSquare className="mr-2 h-4 w-4" /> Issues</TabsTrigger>
                    <TabsTrigger value="pr" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"><GitMerge className="mr-2 h-4 w-4" /> Pull Requests</TabsTrigger>
                    <TabsTrigger value="insights" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"><BarChart3 className="mr-2 h-4 w-4" /> Insights</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="dataset" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 space-y-8">
                            <h2 className="text-2xl font-bold">{dataset.longTitle}</h2>
                            <Card><CardHeader><CardTitle>About Dataset</CardTitle></CardHeader><CardContent><p className="text-foreground/80">{dataset.description}</p></CardContent></Card>
                            <Card><CardHeader><CardTitle>Dataset Overview</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80"><li><b>{dataset.overview.rows} Rows and {dataset.overview.columns} Columns</b></li>{dataset.overview.columnDetails.map(col => (<li key={col.name}><b>{col.name}</b>: {col.description}</li>))}</ul><Button variant="link" className="p-0 h-auto mt-2">View more</Button></CardContent></Card>
                            <Card>
                                <CardHeader><CardTitle>Data Preview</CardTitle><CardDescription>Top rows from the primary file: {dataset.files[0].name}</CardDescription></CardHeader>
                                <CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow>{previewColumns.map(col => <TableHead key={col}>{col}</TableHead>)}</TableRow></TableHeader><TableBody>{dataset.previewData.map((row, rowIndex) => (<TableRow key={rowIndex}>{previewColumns.map(col => (<TableCell key={col}>{typeof row[col] === 'number' ? (<div className="flex items-center gap-2"><span className="w-8 text-right">{row[col]}%</span><Progress value={row[col] as number} className="w-24 h-2"/></div>) : (row[col])}</TableCell>))}</TableRow>))}</TableBody></Table></div></CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card><CardHeader><CardTitle className="text-lg flex justify-between items-center">Usability<TooltipProvider><Tooltip><TooltipTrigger><Info className="h-4 w-4 text-muted-foreground"/></TooltipTrigger><TooltipContent><p>Usability score for this dataset</p></TooltipContent></Tooltip></TooltipProvider></CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dataset.usability}</p></CardContent></Card>
                            <Card><CardContent className="pt-6 text-sm space-y-3"><div><p className="font-semibold">License</p><p className="text-muted-foreground">{dataset.license}</p></div><div><p className="font-semibold">Tags</p><div className="flex flex-wrap gap-2 mt-2">{dataset.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div></div></CardContent></Card>
                            <Card><CardHeader><CardTitle className="text-lg">Data Explorer</CardTitle></CardHeader><CardContent><Accordion type="single" collapsible defaultValue="item-1"><AccordionItem value="item-1"><AccordionTrigger className="text-sm font-semibold"><div className="flex items-center gap-2"><Folder className="h-4 w-4"/><span>{dataset.id}</span></div></AccordionTrigger><AccordionContent className="pl-4">{dataset.files.map(file => (<div key={file.name} className="flex items-center gap-2 py-1"><File className="h-4 w-4 text-muted-foreground"/><span className="text-sm">{file.name}</span></div>))}</AccordionContent></AccordionItem></Accordion></CardContent></Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="issues"><IssuesTab /></TabsContent>
                <TabsContent value="pr"><Card className="mt-6"><CardHeader><CardTitle>Pull Requests</CardTitle></CardHeader><CardContent><p>Pull Requests are not yet enabled.</p></CardContent></Card></TabsContent>
                <TabsContent value="insights"><Card className="mt-6"><CardHeader><CardTitle>Insights</CardTitle></CardHeader><CardContent><p>Insights are not yet enabled.</p></CardContent></Card></TabsContent>
                <TabsContent value="settings"><Card className="mt-6"><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent><p>Settings are not yet enabled.</p></CardContent></Card></TabsContent>
            </Tabs>
        </div>
    );
}



