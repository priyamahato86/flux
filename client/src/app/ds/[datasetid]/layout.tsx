import { Button } from "@/components/ui/button";
import { Download, Pencil } from "lucide-react";
import { TabsNav } from "./tabs-nav"; 

const getDatasetDetails = async (datasetId: string) => {
  return { id: datasetId, title: "flux" };
};

export default async function DatasetIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { datasetid: string };
}) {
  const dataset = await getDatasetDetails(params.datasetid);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-blue-500 hover:underline cursor-pointer">
            {dataset.title}
          </h1>
          <span className="text-xs font-semibold border rounded-full px-2 py-0.5">
            Public
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </header>
      <TabsNav datasetId={params.datasetid} />

      <main className="mt-6">{children}</main>
    </div>
  );
}
