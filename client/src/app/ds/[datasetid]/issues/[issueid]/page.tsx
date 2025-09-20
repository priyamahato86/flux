"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dot } from "lucide-react";

type Label = { name: string; color: string; };
type Issue = { id: number; title: string; author: string; time: string; label: Label; description: string; };

export default function IssueDetailPage() {
    const [issue, setIssue] = useState<Issue | null>(null);
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;
    const issueid = Array.isArray(params.issueid) ? params.issueid[0] : params.issueid;

    useEffect(() => {
        if (datasetid && issueid) {
            const storedIssues = localStorage.getItem(`issues_${datasetid}`);
            if (storedIssues) {
                const issues: Issue[] = JSON.parse(storedIssues);
                const currentIssue = issues.find(i => i.id === parseInt(issueid));
                setIssue(currentIssue || null);
            }
        }
    }, [datasetid, issueid]);

    if (!issue) {
        return <div className="text-center p-8">Issue not found or loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight">{issue.title} <span className="text-3xl font-light text-muted-foreground">#{issue.id}</span></h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <Dot className="h-6 w-6 text-green-600 -ml-2"/> Open
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">{issue.author}</span> opened this issue {issue.time}
                        </p>
                    </div>
                </div>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/50 border-b">
                         <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://github.com/${issue.author}.png`} alt={issue.author} />
                                <AvatarFallback>{issue.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold">{issue.author}</span>
                            <span className="text-sm text-muted-foreground">commented {issue.time}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p>{issue.description || "No description provided."}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader><h3 className="font-semibold">Labels</h3></CardHeader>
                    <CardContent>
                        <Badge style={{ backgroundColor: issue.label.color, color: 'white' }} className="border-transparent">{issue.label.name}</Badge>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
