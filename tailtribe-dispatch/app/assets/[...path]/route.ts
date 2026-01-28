import { NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

export const runtime = 'nodejs'

// Hotfix (production blocker): some deployments return 404 for `/assets/*` even though
// files exist under `public/assets`. Serve them via a route handler as a fallback.
//
// This intentionally prioritizes reliability over ideal static serving.

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets')

function contentTypeFromExt(ext: string) {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.ico':
      return 'image/x-icon'
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.txt':
      return 'text/plain; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(_req: Request, ctx: { params: { path: string[] } }) {
  // If the folder doesn't exist at runtime, we can't serve anything.
  if (!existsSync(ASSETS_DIR)) {
    return NextResponse.json({ error: 'assets_not_available' }, { status: 404 })
  }

  const rel = (ctx.params?.path ?? []).join('/')
  const safeRel = rel.replace(/\\/g, '/')
  const abs = path.join(ASSETS_DIR, safeRel)
  const resolved = path.resolve(abs)

  // Prevent path traversal (../).
  if (!resolved.startsWith(path.resolve(ASSETS_DIR) + path.sep)) {
    return NextResponse.json({ error: 'invalid_path' }, { status: 400 })
  }

  try {
    const buf = await fs.readFile(resolved)
    const ext = path.extname(resolved)
    const ct = contentTypeFromExt(ext)

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': ct,
        // The app already appends `?v=...` for cache busting; make it cacheable.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
}

