"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tag, Milestone, ChevronDown, Dot } from "lucide-react";

type Label = { name: string; color: string; };
type Issue = { id: number; title: string; author: string; time: string; label: Label; description: string; };
const LABELS: Label[] = [
  { name: 'bug', color: 'bg-red-500' },
  { name: 'feature', color: 'bg-purple-500' },
  { name: 'documentation', color: 'bg-blue-500' },
];

const FilterDropdown = ({ label, items }: { label: string; items: string[] }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="text-sm font-normal text-muted-foreground">{label} <ChevronDown className="h-4 w-4 ml-1" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="start"><DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel><DropdownMenuSeparator />{items.map(item => <DropdownMenuItem key={item}>{item}</DropdownMenuItem>)}</DropdownMenuContent>
    </DropdownMenu>
);

export default function IssuesListPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;

    useEffect(() => {
        if (datasetid) {
            const storedIssues = localStorage.getItem(`issues_${datasetid}`);
            if (storedIssues) {
                setIssues(JSON.parse(storedIssues));
            }
        }
    }, [datasetid]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1"><Input placeholder='is:issue is:open' className="w-full md:w-auto"/></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Tag className="mr-2 h-4 w-4"/> Labels</Button>
                    <Button variant="outline"><Milestone className="mr-2 h-4 w-4"/> Milestones</Button>
                    <Button asChild className="bg-green-600 hover:bg-green-700"><Link href={`/ds/${datasetid}/issues/create`}>New issue</Link></Button>
                </div>
            </div>
            <div className="border rounded-lg mt-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <button className="flex items-center gap-1"><Dot className="text-green-500 h-6 w-6"/> Open <Badge variant="secondary">{issues.length}</Badge></button>
                        <button className="flex items-center gap-1 text-muted-foreground">Closed <Badge variant="secondary">0</Badge></button>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <FilterDropdown label="Author" items={['thtskaran']} />
                        <FilterDropdown label="Labels" items={LABELS.map(l => l.name)} />
                    </div>
                </div>
                {issues.length > 0 ? (
                    <div>
                        {issues.map(issue => (
                            <div key={issue.id} className="flex items-center gap-3 p-4 border-b last:border-b-0">
                                <Dot className="text-green-500 h-6 w-6" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/ds/${datasetid}/issues/${issue.id}`} className="font-semibold hover:text-blue-600">{issue.title}</Link>
                                        <Badge style={{ backgroundColor: issue.label.color, color: 'white' }} className="border-transparent">{issue.label.name}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">#{issue.id} opened {issue.time} by {issue.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : ( <div className="p-16 text-center"><h3 className="text-xl font-semibold">No results</h3><p className="text-muted-foreground mt-2">Try adjusting your search filters.</p></div> )}
            </div>
        </div>
    );
}

