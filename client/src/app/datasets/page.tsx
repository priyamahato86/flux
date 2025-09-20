import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, User } from "lucide-react";
import Link from "next/link";

type DatasetOwner = {
  name: string;
  username: string;
};
type Dataset = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  license: string;
  tags: string[];
  owner: DatasetOwner;
  updatedAt: string; 
};

const getDummyDatasets = async (): Promise<Dataset[]> => {
  return [
    {
      id: "cifar-10-id",
      name: "CIFAR-10 Image Classification",
      slug: "cifar-10",
      description: "A collection of 60,000 32x32 colour images in 10 classes, widely used for machine learning research.",
      license: "MIT",
      tags: ["Computer Vision", "Images", "Classification"],
      owner: { name: "Alex Krizhevsky", username: "akrizhevsky" },
      updatedAt: "2 days ago",
    },
    {
      id: "imdb-reviews-id",
      name: "IMDB Movie Reviews",
      slug: "imdb-reviews",
      description: "A large dataset of movie reviews for binary sentiment classification, containing 25,000 reviews for training and 25,000 for testing.",
      license: "CC0: Public Domain",
      tags: ["NLP", "Text", "Sentiment Analysis"],
      owner: { name: "Andrew Maas", username: "amaas" },
      updatedAt: "5 days ago",
    },
    {
        id: 'titanic-id',
        name: 'Titanic Survival Data',
        slug: 'titanic',
        description: 'A classic dataset for binary classification to predict the survival of passengers aboard the Titanic.',
        license: 'CC BY-SA 4.0',
        tags: ['Classification', 'Tabular', 'Beginner'],
        owner: { name: 'Frank Harrell', username: 'fharrell' },
        updatedAt: '1 week ago',
    },
    {
        id: 'boston-housing-id',
        name: 'Boston Housing Prices',
        slug: 'boston-housing',
        description: 'A dataset containing information about housing in the suburbs of Boston, used for regression tasks.',
        license: 'Public Domain',
        tags: ['Regression', 'Housing', 'Real Estate'],
        owner: { name: 'David Harrison', username: 'dharrison' },
        updatedAt: '3 weeks ago',
    },
    {
        id: 'iris-flower-id',
        name: 'Iris Flower Dataset',
        slug: 'iris-flower',
        description: 'A classic multivariate dataset containing 3 species of Iris flowers. Ideal for testing classification algorithms.',
        license: 'BSD-3-Clause',
        tags: ['Classification', 'Biology', 'Classic'],
        owner: { name: 'Ronald Fisher', username: 'rfisher' },
        updatedAt: '1 month ago',
    },
    {
        id: 'mnist-digits-id',
        name: 'MNIST Handwritten Digits',
        slug: 'mnist-digits',
        description: 'A large database of handwritten digits that is commonly used for training various image processing systems.',
        license: 'CC BY-SA 3.0',
        tags: ['Computer Vision', 'Image Classification', 'Digits'],
        owner: { name: 'Yann LeCun', username: 'ylecun' },
        updatedAt: '2 months ago',
    },
  ];
};

export default async function DatasetsPage() {
  const datasets = await getDummyDatasets();

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Explore Datasets</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse and discover datasets for your next data science project.
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <Card key={dataset.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  <Database className="h-6 w-6 mt-1 text-primary" />
                  <div className="flex-1">
                    <Link href={`/ds/${dataset.slug}`} className="hover:underline">
                      {dataset.name}
                    </Link>
                    <CardDescription className="flex items-center gap-1.5 text-xs pt-1">
                        <User size={12}/> by {dataset.owner.name}
                    </CardDescription>
                  </div>
                </CardTitle>
                <p className="pt-2 text-sm text-muted-foreground line-clamp-3">
                    {dataset.description}
                </p>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-between items-center">
                 <div className="flex flex-wrap gap-2">
                    {dataset.tags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                 </div>
                 <span className="text-xs text-muted-foreground whitespace-nowrap">{dataset.updatedAt}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
