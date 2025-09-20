"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api2 from "@/lib/api2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Function to create a URL-friendly slug from a string
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
};

export default function CreateDatasetInitialPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [description, setDescription] = useState("");
  const [authorNote, setAuthorNote] = useState("");

  // const handleCreateDataset = () => {
  //   if (!name || !license) {
  //     toast.error("Dataset name and license are required.");
  //     return;
  //   }

  //   const userCookie = getCookie("ouser");
  //   if (!userCookie) {
  //     toast.error("You must be logged in to create a dataset.");
  //     router.push("/login");
  //     return;
  //   }
  //   const userData = JSON.parse(userCookie as string);

  //   // 1. Create the initial dataset object
  //   const slug = createSlug(name);
  //   const randomId = crypto.randomUUID();
  //   const newDatasetDraft = {
  //     id: randomId, // Use the random UUID for the unique ID
  //     title: name,
  //     slug: slug, // Keep the slug for user-friendly URLs
  //     license: license,
  //     ownerId: userData.id, // Assuming user object in cookie has an ID
  //     description,
  //     authorNote,
  //     isPrivate: false,
  //     tags: [],
  //     files: [], // Files will be added in the next step
  //   };

  //   // 2. Save this draft to localStorage using the random ID as the key
  //   localStorage.setItem(
  //     `dataset_draft_${randomId}`,
  //     JSON.stringify(newDatasetDraft)
  //   );

  //   // 3. Redirect to the upload page using the random ID
  //   toast.success("Dataset created. Now, add your files.");
  //   router.push(`/ds/create/${randomId}`);
  // };

  const handleCreateDataset = async () => {
    if (!name || !license) {
      toast.error("Dataset name and license are required.");
      return;
    }

    const userCookie = getCookie("ouser");
    if (!userCookie) {
      toast.error("You must be logged in to create a dataset.");
      router.push("/login");
      return;
    }
    const userData = JSON.parse(userCookie as string);

    const slug = createSlug(name);

    const newDatasetDraft = {
      name: name,
      slug,
      license,
      ownerId: userData.id,
      description,
      authorNote,
      isPrivate: false,
      tags: [],
      files: [], // initially empty
    };

    try {
      const { data } = await api2.post("/datasets", newDatasetDraft);

      toast.success("Dataset created. Now, add your files.");
      router.push(`/ds/create/${data.slug}`); // assuming API returns { id }
    } catch (error: any) {
      console.error(2, error);
      toast.error(error.response?.data?.message || "Failed to create dataset.");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create a New Dataset
        </h1>
        <p className="text-muted-foreground mt-2">
          Start by providing the core details for your dataset.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dataset Details</CardTitle>
          <CardDescription>
            This information will be publicly visible on the dataset page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name">Dataset Name</Label>
            <Input
              id="name"
              placeholder="e.g., CIFAR-10 Image Classification"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="license">License</Label>
            <Select onValueChange={setLicense} value={license}>
              <SelectTrigger id="license">
                <SelectValue placeholder="Select a license" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC0-1.0">
                  CC0 1.0 Universal (Public Domain)
                </SelectItem>
                <SelectItem value="MIT">MIT License</SelectItem>
                <SelectItem value="GPL-3.0">GPLv3</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A short summary of your dataset."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="authorNote">Author Note (Optional)</Label>
            <Textarea
              id="authorNote"
              placeholder="Any notes for this version of the dataset."
              value={authorNote}
              onChange={(e) => setAuthorNote(e.target.value)}
            />
          </div>
          <Button size="lg" className="w-full" onClick={handleCreateDataset}>
            Create Dataset and Add Files
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
