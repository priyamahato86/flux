import { Button } from "@/components/ui/button";
import { Download, Pencil } from "lucide-react";
import { TabsNav } from "./tabs-nav";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Btn from "./Btn";

export default async function DatasetIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ datasetid: string }>;
}) {
  const { datasetid } = await params;

  const data = await prisma.dataset.findUnique({
    where: { id: datasetid },
  });

  if (!data) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/ds/${data?.id}`}
            className="text-xl font-semibold text-blue-500 cursor-pointer"
          >
            {data?.name}
          </Link>
          <span className="text-xs font-semibold border rounded-full px-2 py-0.5">
            Public
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Btn dataset={data} />
        </div>
      </header>
      <TabsNav datasetId={datasetid} />

      <main className="mt-6">{children}</main>
    </div>
  );
}
