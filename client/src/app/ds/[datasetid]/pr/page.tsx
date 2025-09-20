"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitPullRequest } from "lucide-react";

type PullRequest = { id: number; title: string; author: string; time: string; };

export default function PRListPage() {
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;

    useEffect(() => {
        if (datasetid) {
            const storedPRs = localStorage.getItem(`prs_${datasetid}`);
            if (storedPRs) {
                setPullRequests(JSON.parse(storedPRs));
            }
        }
    }, [datasetid]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1"><Input placeholder='is:pr is:open' className="w-full md:w-auto"/></div>
                <Button asChild className="bg-green-600 hover:bg-green-700"><Link href={`/ds/${datasetid}/pr/create`}>New pull request</Link></Button>
            </div>
            <div className="border rounded-lg mt-4">
                {pullRequests.length > 0 ? (
                    <div>
                        {pullRequests.map(pr => (
                            <div key={pr.id} className="flex items-center gap-3 p-4 border-b last:border-b-0">
                                <GitPullRequest className="text-green-500 h-5 w-5" />
                                <div className="flex-1">
                                    <Link href={`/ds/${datasetid}/pr/${pr.id}`} className="font-semibold hover:text-blue-600">{pr.title}</Link>
                                    <p className="text-xs text-muted-foreground mt-1">#{pr.id} opened {pr.time} by {pr.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mt-4">Welcome to pull requests!</h3>
                        <p className="text-muted-foreground mt-2">Pull requests help you collaborate on code with other people.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
