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
    return "dataset";
  };

  const tabs = [
    {
      value: "dataset",
      label: "Dataset",
      icon: BookText,
      href: `/ds/${datasetId}`,
    },
    {
      value: "issues",
      label: "Issues",
      icon: MessageSquare,
      href: `/ds/${datasetId}/issues`,
    },
    {
      value: "pr",
      label: "Pull Requests",
      icon: GitMerge,
      href: `/ds/${datasetId}/pr`,
    },
    {
      value: "insights",
      label: "Insights",
      icon: BarChart3,
      href: `/ds/${datasetId}/insights`,
    },
  ];

  return (
    <Tabs value={getActiveTab()} className="w-full">
      <TabsList className="border-b border-gray-200 bg-white p-0 h-auto">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            asChild
            className="relative px-6 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors data-[state=active]:text-white data-[state=active]:bg-blue-600 data-[state=active]:shadow-none rounded-t-lg rounded-b-none"
          >
            <Link href={tab.href} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-500 opacity-0 transition-opacity data-[state=active]:opacity-100" />
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
