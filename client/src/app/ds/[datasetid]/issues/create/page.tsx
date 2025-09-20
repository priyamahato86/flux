"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { getCookie } from "cookies-next";

type Label = { name: string; color: string };
type Issue = {
  title: string;
  author: string;
  time: string;
  label: Label;
};
const LABELS: Label[] = [
  { name: "bug", color: "bg-red-500" },
  { name: "feature", color: "bg-purple-500" },
  { name: "documentation", color: "bg-blue-500" },
];

export default function CreateIssuePage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const cookies = getCookie("ouser");
  const user = cookies ? JSON.parse(cookies as string) : null;

  const handleSubmit = async () => {
    if (!title) {
      toast.error("Title is required.");
      return;
    }

    const data = await api.post("/api/issues", {
      datasetId: params.datasetid,
      title,
      description,
      userId: user.id,
    });

    toast.success("Issue created!");
    router.push(`/ds/${params.datasetid}/issues`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create a new issue</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>Submit new issue</Button>
      </div>
    </div>
  );
}
