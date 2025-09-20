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
import { Progress } from "@/components/ui/progress";
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
import { Info, File, Folder } from "lucide-react";

// --- Data Fetching and Type Definitions ---
// In a real application, this function would fetch data from your database or API.
const getDatasetDetails = async (datasetId: string) => {
  // This is dummy data for demonstration purposes.
  return {
    id: datasetId,
    longTitle: "BI Intro to Data Cleaning, EDA and Machine Learning",
    usability: 9.41,
    license: "CC0: Public Domain",
    tags: ["Business", "Computer Science", "Education", "Data Cleaning", "Regression"],
    description: "This dataset, titled 'Intro to Data Cleaning, EDA, and Machine Learning,' is designed to help learners practice essential data science techniques. It contains information on students, including their demographic and academic data.",
    overview: {
      rows: 77,
      columns: 11,
      columnDetails: [
        { name: "fNAME, lNAME", description: "First and last names of the student." },
        { name: "Age", description: "Student's age, possibly affecting academic performance." }
      ]
    },
    files: [{ name: "bi.csv", size: "5.06 KB" }],
    previewData: [
        { fName: 'Bjorn', lName: 'Hansen', Age: 3, gender: 'Female', country: 'Norway', 'residency status': 'Private', 'Math Score': 53, 'Python Score': 61, 'DB Score': 52 },
        { fName: 'Emma', lName: 'Olsen', Age: 3, gender: 'Male', country: 'Uganda', 'residency status': 'Private', 'Math Score': 42, 'Python Score': 5, 'DB Score': 6 },
        { fName: 'David', lName: 'Kamau', Age: 2, gender: 'Male', country: 'Kenya', 'residency status': 'Private', 'Math Score': 67, 'Python Score': 88, 'DB Score': 91 },
    ],
  };
};

// Define a type for a single row of preview data for TypeScript safety.
type PreviewRow = Awaited<ReturnType<typeof getDatasetDetails>>['previewData'][number];

// --- Main Page Component ---
// This is an async Server Component, which is ideal for fetching data.
export default async function DatasetDetailsPage({ params }: { params: { datasetid: string } }) {
    const dataset = await getDatasetDetails(params.datasetid);
    
    // Get column headers dynamically from the first row of preview data.
    const previewColumns = dataset.previewData.length > 0 
        ? Object.keys(dataset.previewData[0]) as Array<keyof PreviewRow> 
        : [];
  
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Main Area: Contains the primary dataset information */}
            <div className="lg:col-span-3 space-y-8">
                <h2 className="text-2xl font-bold">{dataset.longTitle}</h2>
                
                <Card>
                    <CardHeader><CardTitle>About Dataset</CardTitle></CardHeader>
                    <CardContent><p className="text-foreground/80 leading-relaxed">{dataset.description}</p></CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Dataset Overview</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                            <li><b>{dataset.overview.rows} Rows and {dataset.overview.columns} Columns</b></li>
                            {dataset.overview.columnDetails.map(col => (<li key={col.name}><b>{col.name}</b>: {col.description}</li>))}
                        </ul>
                        <Button variant="link" className="p-0 h-auto mt-2">View more</Button>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Data Preview</CardTitle>
                        <CardDescription>Top rows from the primary file: {dataset.files[0].name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>{previewColumns.map(col => <TableHead key={col}>{col}</TableHead>)}</TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataset.previewData.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {previewColumns.map(col => (
                                                <TableCell key={col}>
                                                    {typeof row[col] === 'number' ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-8 text-right">{row[col]}%</span>
                                                            <Progress value={row[col] as number} className="w-24 h-2"/>
                                                        </div>
                                                    ) : (row[col])}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Sidebar: Contains metadata and quick-glance info */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                            Usability
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                                    <TooltipContent><p>Usability score for this dataset</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-3xl font-bold">{dataset.usability}</p></CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6 text-sm space-y-4">
                        <div>
                            <p className="font-semibold">License</p>
                            <p className="text-muted-foreground">{dataset.license}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Tags</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {dataset.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle className="text-lg">Data Explorer</CardTitle></CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible defaultValue="item-1">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm font-semibold">
                                    <div className="flex items-center gap-2"><Folder className="h-4 w-4"/><span>{dataset.id}</span></div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-4">
                                    {dataset.files.map(file => (<div key={file.name} className="flex items-center gap-2 py-1"><File className="h-4 w-4 text-muted-foreground"/><span className="text-sm">{file.name}</span></div>))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

