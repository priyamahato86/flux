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
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

const getDatasetDetails = async (datasetId: string) => {
  return {
    id: datasetId,
    longTitle: "BI Intro to Data Cleaning, EDA and Machine Learning",
    usability: 9.41,
    license: "CC0: Public Domain",
    tags: [
      "Business",
      "Computer Science",
      "Education",
      "Data Cleaning",
      "Regression",
    ],
    description:
      "This dataset, titled 'Intro to Data Cleaning, EDA, and Machine Learning,' is designed to help learners practice essential data science techniques. It contains information on students, including their demographic and academic data.",
    overview: {
      rows: 77,
      columns: 11,
      columnDetails: [
        {
          name: "fNAME, lNAME",
          description: "First and last names of the student.",
        },
        {
          name: "Age",
          description:
            "Student's age, possibly affecting academic performance.",
        },
      ],
    },
    files: [{ name: "bi.csv", size: "5.06 KB" }],
    previewData: [
      {
        fName: "Bjorn",
        lName: "Hansen",
        Age: 3,
        gender: "Female",
        country: "Norway",
        "residency status": "Private",
        "Math Score": 53,
        "Python Score": 61,
        "DB Score": 52,
      },
      {
        fName: "Emma",
        lName: "Olsen",
        Age: 3,
        gender: "Male",
        country: "Uganda",
        "residency status": "Private",
        "Math Score": 42,
        "Python Score": 5,
        "DB Score": 6,
      },
      {
        fName: "David",
        lName: "Kamau",
        Age: 2,
        gender: "Male",
        country: "Kenya",
        "residency status": "Private",
        "Math Score": 67,
        "Python Score": 88,
        "DB Score": 91,
      },
    ],
  };
};

export interface DatasetCard {
  title: string;
  generatedAt: string;
  description?: string;
  datasetOverview: DatasetOverview;
  schema: Record<string, string>;
  dataQuality: DataQuality;
  statisticalSummary: Record<string, StatisticalColumn>;
  aiModelCard: AIModelCard;
  recommendedUses: string[];
  limitations: string[];
}

export interface DatasetOverview {
  insights: string[];
  totalRows: number | null;
  totalColumns: number | null;
  sampleData: SampleRow[];
}

export type SampleRow = Record<string, string | number>;

export interface DataQuality {
  rows: number | null;
  cols: number | null;
  nullCounts: Record<string, number>;
  completenessScore: number;
}

export interface StatisticalColumn {
  count: number | null;
  mean: number | null;
  std: number | null;
  min: number | null;
  "25%": number | null;
  "50%": number | null;
  "75%": number | null;
  max: number | null;
  unique: number | null;
  top: string | null;
  freq: number | null;
}

export interface AIModelCard {
  overview: ModelOverview;
  dataDescription: DataDescription;
  dataCollection: DataCollection;
  dataQuality: ModelDataQuality;
  intendedUseCases: string[];
  limitations: string[];
  technicalDetails: TechnicalDetails;
}

export interface ModelOverview {
  purpose: string;
  domain: string;
  keyCharacteristics: string[];
}

export interface DataDescription {
  structure: string;
  features: string[];
  targetVariable?: string | null;
}

export interface DataCollection {
  methodology: string;
  sources: string;
  timeframe: string;
}

export interface ModelDataQuality {
  completeness: string;
  consistency: string;
  potentialIssues: string[];
}

export interface TechnicalDetails {
  format: string;
  recommendedPreprocessing: string[];
}

type PreviewRow = Awaited<
  ReturnType<typeof getDatasetDetails>
>["previewData"][number];

export default async function DatasetDetailsPage({
  params,
}: {
  params: Promise<{ datasetid: string }>;
}) {
  const { datasetid } = await params;
  const dataset = await getDatasetDetails(datasetid);

  //   console.log(datasetid);

  const data = await prisma.dataset.findUnique({
    where: { id: datasetid },
  });

  if (!data) {
    return notFound();
  }
  //   data.dataCard

  const previewColumns =
    dataset.previewData.length > 0
      ? (Object.keys(dataset.previewData[0]) as Array<keyof PreviewRow>)
      : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <h2 className="text-2xl font-bold">{data.name}</h2>

        <Card>
          <CardHeader>
            <CardTitle>About Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed">
              {data.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dataset Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-foreground/80">
              {Object.entries(data.dataCard as unknown as DatasetCard).map(
                ([key, value]) => (
                  <div key={key}>
                    <p className="font-semibold capitalize">{key}</p>
                    <div className="pl-4">
                      {typeof value === "object" && value !== null ? (
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <p>{value}</p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              Usability
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Usability score for this dataset</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dataset.usability}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-sm space-y-4">
            <div>
              <p className="font-semibold">License</p>
              <p className="text-muted-foreground">{data.license}</p>
            </div>
            <div>
              <p className="font-semibold">Tags</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <span>{dataset.id}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-4">
                  {dataset.files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 py-1"
                    >
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
