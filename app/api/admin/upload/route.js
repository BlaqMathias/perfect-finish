// app/api/admin/upload/route.js
// POST /api/admin/upload — upload fragrance image to Supabase Storage
// Returns: { url: "https://..." }

import { NextResponse }       from 'next/server';
import { jsonNoStore }        from '@/lib/noStore';
import { verifyAdminSession } from '@/lib/adminAuth';
import { getAdminClient }     from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const BUCKET = 'fragrance-images';

export async function POST(request) {
  const ok = await verifyAdminSession();
  if (!ok) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const db = getAdminClient();

  // Ensure bucket exists (create if not)
  const { data: buckets } = await db.storage.listBuckets();
  const exists = (buckets ?? []).some(b => b.name === BUCKET);
  if (!exists) {
    const { error: bucketErr } = await db.storage.createBucket(BUCKET, { public: true });
    if (bucketErr && !bucketErr.message.includes('already exists')) {
      return NextResponse.json(
        { message: `Could not create bucket: ${bucketErr.message}` },
        { status: 500 }
      );
    }
  }

  const formData = await request.formData();
  const file     = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
  }

  const ext      = file.name.split('.').pop().toLowerCase();
  const allowed  = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
  if (!allowed.includes(ext)) {
    return NextResponse.json(
      { message: 'Only jpg, png, webp, avif images are allowed.' },
      { status: 400 }
    );
  }

  const fileName  = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuf  = await file.arrayBuffer();
  const buffer    = Buffer.from(arrayBuf);

  const { error: uploadErr } = await db.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  if (uploadErr) {
    return NextResponse.json({ message: uploadErr.message }, { status: 500 });
  }

  const { data: publicData } = db.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({ url: publicData.publicUrl }, { status: 201 });
}
