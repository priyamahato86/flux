"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitPullRequest } from "lucide-react";

type PullRequest = { id: number; title: string; author: string; time: string; description: string; };

export default function PRDetailPage() {
    const [pr, setPR] = useState<PullRequest | null>(null);
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;
    const prid = Array.isArray(params.prid) ? params.prid[0] : params.prid;

    useEffect(() => {
        if (datasetid && prid) {
            const storedPRs = localStorage.getItem(`prs_${datasetid}`);
            if (storedPRs) {
                const prs: PullRequest[] = JSON.parse(storedPRs);
                const currentPR = prs.find(p => p.id === parseInt(prid));
                setPR(currentPR || null);
            }
        }
    }, [datasetid, prid]);

    if (!pr) {
        return <div className="text-center p-8">Pull Request not found or loading...</div>;
    }

    return (
        <div className="lg:col-span-2">
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">{pr.title} <span className="text-3xl font-light text-muted-foreground">#{pr.id}</span></h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <GitPullRequest className="h-4 w-4 text-green-600 mr-1"/> Open
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">{pr.author}</span> wants to merge changes
                    </p>
                </div>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 border-b">
                     <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://github.com/${pr.author}.png`} alt={pr.author} />
                            <AvatarFallback>{pr.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold">{pr.author}</span>
                        <span className="text-sm text-muted-foreground">commented {pr.time}</span>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <p>{pr.description || "No description provided."}</p>
                </CardContent>
            </Card>
        </div>
    );
}
