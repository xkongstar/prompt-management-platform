import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/prompts/[id] - Get a specific prompt
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/prompts/[id] - Update a specific prompt
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, tags } = body

    // Validation
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title must be less than 200 characters" }, { status: 400 })
    }

    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        content: content.trim(),
        tags: tags?.trim() || null,
      },
    })

    return NextResponse.json(updatedPrompt)
  } catch (error) {
    console.error("Error updating prompt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/prompts/[id] - Delete a specific prompt
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    await prisma.prompt.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Prompt deleted successfully" })
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
