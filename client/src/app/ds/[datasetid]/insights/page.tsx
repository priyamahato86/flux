"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InsightsPage() {
    const params = useParams();
    const datasetid = Array.isArray(params.datasetid) ? params.datasetid[0] : params.datasetid;

    return (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 15rem)' }}>
            <Card className="w-full max-w-lg text-center p-6 sm:p-8 shadow-lg border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <BarChart3 className="h-12 w-12 text-primary" strokeWidth={1.5} />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Insights Coming Soon!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                        We are currently developing powerful analytics and visualization tools for your dataset. Check back soon to explore trends, data distributions, and other valuable insights.
                    </p>
                    {datasetid && (
                        <Link href={`/ds/${datasetid}`}>
                            <Button className="mt-8 w-full sm:w-auto">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dataset
                            </Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
