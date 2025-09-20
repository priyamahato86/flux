"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookText,
  MessageSquare,
  GitMerge,
  BarChart3,
  Settings,
} from "lucide-react";

export function TabsNav({ datasetId }: { datasetId: string }) {
  const pathname = usePathname();
  
  const getActiveTab = () => {
    if (pathname.includes("/issues")) return "issues";
    if (pathname.includes("/pr")) return "pr";
    if (pathname.includes("/insights")) return "insights";
    if (pathname.includes("/settings")) return "settings";
    return "dataset";
  };

  const tabs = [
    { value: "dataset", label: "Dataset", icon: BookText, href: `/ds/${datasetId}` },
    { value: "issues", label: "Issues", icon: MessageSquare, href: `/ds/${datasetId}/issues` },
    { value: "pr", label: "Pull Requests", icon: GitMerge, href: `/ds/${datasetId}/pr` },
    { value: "insights", label: "Insights", icon: BarChart3, href: `/ds/${datasetId}/insights` },
    { value: "settings", label: "Settings", icon: Settings, href: `/ds/${datasetId}/settings` },
  ];

  return (
    <Tabs value={getActiveTab()} className="w-full">
      <TabsList className="border-b-2 rounded-none p-0 h-auto bg-transparent">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
            <Link href={tab.href}>
              <tab.icon className="mr-2 h-4 w-4" /> {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
