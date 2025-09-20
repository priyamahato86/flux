import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const datasetId = searchParams.get("datasetId");

  if (!datasetId) {
    return NextResponse.json(
      { error: "datasetId is required" },
      { status: 400 }
    );
  }

  try {
    const issues = await prisma.issue.findMany({
      where: { datasetId: datasetId },
    });

    return NextResponse.json({ data: issues });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { datasetId, title, description, userId } = body;

    const newIssue = await prisma.issue.create({
      data: {
        title,
        description,
        author: {
          connect: { id: userId },
        },
        dataset: { connect: { id: datasetId } },
      },
    });

    return NextResponse.json({ data: newIssue }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
