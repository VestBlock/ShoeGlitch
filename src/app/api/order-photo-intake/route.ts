import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { uploadPhotoFiles } from '@/lib/order-photos';

export async function POST(request: Request) {
  let session;
  try {
    session = requireRole(await getSession(), 'customer');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in to upload photos.';
    return NextResponse.json({ error: message }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 });
  }

  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

  try {
    const uploaded = await uploadPhotoFiles(files, `intake/${session.userId}`);
    return NextResponse.json({ uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    const status = message.includes('signed in') || message.includes('restricted') ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
