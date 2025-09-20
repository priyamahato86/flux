"use client";

import { Button } from "@/components/ui/button";
import api2 from "@/lib/api2";
import { Dataset } from "@prisma/client";
import { Download } from "lucide-react";

const Btn = ({ dataset }: { dataset: Dataset }) => {
  const handleClick = async () => {
    const { data } = await api2.get(`/datasets/${dataset?.slug}/download_url`);
    window.open(data.url, "_blank");
  };

  return (
    <Button onClick={handleClick}>
      <Download className="mr-2 h-4 w-4" /> Download
    </Button>
  );
};

export default Btn;
