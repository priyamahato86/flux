"use client";

import { useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";

// --- Type Definitions ---
type PullRequest = { id: number; title: string; author: string; time: string; description: string; };

export default function CreatePRPage() {
    const router = useRouter();
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = () => {
        if (!title) {
            toast.error("Title is required.");
            return;
        }

        const storedPRsRaw = localStorage.getItem(`prs_${datasetid}`);
        const storedPRs: PullRequest[] = storedPRsRaw ? JSON.parse(storedPRsRaw) : [];
        
        const newPR: PullRequest = {
            id: (storedPRs[0]?.id || 0) + 1,
            title,
            description,
            author: "thtskaran",
            time: "just now",
        };

        const updatedPRs = [newPR, ...storedPRs];
        localStorage.setItem(`prs_${datasetid}`, JSON.stringify(updatedPRs));
        
        toast.success("Pull request created!");
        router.push(`/ds/${datasetid}/pr`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Create a new pull request</h1>
            
            <div className="space-y-4">
                <Input 
                    placeholder="Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="text-lg p-6"
                />
                <Textarea 
                    placeholder="Leave a comment" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[200px]"
                />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Upload updated files</CardTitle>
                    {/* Hidden file input that we'll trigger with the button */}
                    <input 
                        type="file" 
                        id="file-upload" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                    <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Attach files
                    </Button>
                </CardHeader>
                <CardContent>
                    {uploadedFiles.length > 0 ? (
                        <ul className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between font-mono text-sm">
                                    <span>{file.name}</span>
                                    <span className="text-muted-foreground">{Math.round(file.size / 1024)} KB</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No files selected.</p>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} size="lg">Create pull request</Button>
            </div>
        </div>
    );
}


