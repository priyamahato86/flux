"use client";

import { useState, useEffect, DragEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X } from "lucide-react";
import { toast } from "sonner";

// Define the type for the dataset object for better type safety
type Dataset = {
    id: string;
    title: string;
    slug: string;
    license: string;
    ownerId: string;
    description: string;
    authorNote: string;
    isPrivate: boolean;
    tags: string[];
    files: { name: string; size: string; }[];
};

export default function UploadDatasetPage() {
  const router = useRouter();
  const params = useParams();
  const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;
  
  const [datasetDraft, setDatasetDraft] = useState<Dataset | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    // Load the draft data from localStorage when the component mounts
    if (datasetid) {
        const draftRaw = localStorage.getItem(`dataset_draft_${datasetid}`);
        if (draftRaw) {
            setDatasetDraft(JSON.parse(draftRaw));
        } else {
            toast.error("Could not find dataset draft. Redirecting...");
            router.push('/ds/create');
        }
    }
  }, [datasetid, router]);

  const handlePublish = () => {
    if (!datasetDraft) {
        toast.error("Dataset information is missing.");
        return;
    }
    
    // In a real app, you would upload files and get back URLs.
    // Here, we'll just add the file names and sizes to the dataset object.
    const finalDataset: Dataset = {
        ...datasetDraft,
        files: files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(2)} KB` })),
    };
    
    // Get existing datasets from localStorage
    const storedDatasetsRaw = localStorage.getItem("datasets");
    const storedDatasets: Dataset[] = storedDatasetsRaw ? JSON.parse(storedDatasetsRaw) : [];

    // Add the new dataset to the list
    const updatedDatasets = [finalDataset, ...storedDatasets];

    // Save the final list back to localStorage
    localStorage.setItem("datasets", JSON.stringify(updatedDatasets));
    
    // Clean up the draft from localStorage
    localStorage.removeItem(`dataset_draft_${datasetid}`);

    toast.success("Dataset published successfully!");
    // Redirect to the public page for the dataset using its random id
    router.push(`/ds/${datasetid}`);
  };

  // --- Drag and Drop handlers ---
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };
  const removeFile = (index: number) => { setFiles(files.filter((_, i) => i !== index)); };

  if (!datasetDraft) {
      return <div className="container p-8 text-center">Loading dataset draft...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add Files to <span className="text-primary">{datasetDraft.title}</span></h1>
        <p className="text-muted-foreground">Upload your data files and links. Click publish when you're ready.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><CardTitle>Upload Files</CardTitle><CardDescription>Drag and drop your files or click to browse.</CardDescription></CardHeader>
            <CardContent>
              <div
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold">{isDragging ? "Drop files here" : "Click or drag files to upload"}</p>
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold">Pending Uploads:</h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)}><X className="h-4 w-4" /></Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
             <CardHeader><CardTitle>Upload from Links</CardTitle><CardDescription>Paste URLs, one per line.</CardDescription></CardHeader>
              <CardContent><Textarea placeholder="https://example.com/data.csv&#10;https://example.com/images.zip" className="min-h-[120px] font-mono text-sm" /></CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={handlePublish}>
            Publish Dataset
          </Button>
        </div>
      </div>
    </div>
  );
}

