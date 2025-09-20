"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, X } from "lucide-react";

const countWords = (str: string) => {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

export default function DatasetPage({
  params,
}: {
  params: { datasetid: string };
}) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [authorNote, setAuthorNote] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const authorNoteWordCount = countWords(authorNote);
  const descriptionWordCount = countWords(description);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); 
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dataset Details</h1>
        <p className="text-muted-foreground">
          Editing dataset: <span className="font-mono">{params.datasetid}</span>
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop your files or click to browse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold">
                  {isDragging
                    ? "Drop files here"
                    : "Click or drag files to this area to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports multiple files of any type.
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold">Uploaded Files:</h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
             <Card>
              <CardHeader>
                <CardTitle>Author Note</CardTitle>
                <CardDescription>A brief note for this version of the dataset.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Added new validation splits, fixed labels for class X..."
                  className="min-h-[100px]"
                  value={authorNote}
                  onChange={(e) => setAuthorNote(e.target.value)}
                />
                <p className={`text-sm mt-2 ${authorNoteWordCount > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {authorNoteWordCount} / 100 words
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dataset Description</CardTitle>
                <CardDescription>A comprehensive description of your dataset.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Provide details about the data source, collection methods, features, and potential uses..."
                  className="min-h-[200px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                 <p className={`text-sm mt-2 ${descriptionWordCount > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {descriptionWordCount} / 500 words
                </p>
              </CardContent>
            </Card>
          </div>

        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version">Dataset Version</Label>
                <Select defaultValue="v2">
                  <SelectTrigger id="version">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">v1</SelectItem>
                    <SelectItem value="v2">v2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle>Upload from Links</CardTitle>
                <CardDescription>Paste URLs, one per line.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Textarea
                  placeholder="https://example.com/data.csv&#10;https://example.com/images.zip"
                  className="min-h-[120px] font-mono text-sm"
                />
              </CardContent>
          </Card>

          <Button size="lg" className="w-full">
            Publish Dataset
          </Button>
        </div>
      </div>
    </div>
  );
}