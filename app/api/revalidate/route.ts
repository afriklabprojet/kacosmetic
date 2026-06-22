import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret")

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json() as {
    path?: string
    tag?: string
    type?: "path" | "tag"
  }

  if (body.tag) {
    revalidateTag(body.tag)
    return NextResponse.json({ revalidated: true, tag: body.tag })
  }

  if (body.path) {
    revalidatePath(body.path)
    return NextResponse.json({ revalidated: true, path: body.path })
  }

  return NextResponse.json({ error: "path or tag required" }, { status: 400 })
}
