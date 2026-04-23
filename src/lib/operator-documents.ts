import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const OPERATOR_DOCUMENT_BUCKET = 'operator-documents';
export const MAX_OPERATOR_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_LICENSE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export type OperatorApplicationDocument = {
  id: string;
  application_id: string;
  document_type: 'driver_license';
  file_name: string;
  content_type: string;
  file_size: number;
  storage_bucket: string;
  storage_key: string;
  status: 'submitted' | 'verified' | 'rejected';
  signedUrl?: string | null;
  created_at: string;
};

function fileExt(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext && /^[a-z0-9]+$/.test(ext) ? ext : 'upload';
}

export function validateOperatorLicenseFile(file: File | null | undefined) {
  if (!file || file.size === 0) {
    throw new Error('A driver license upload is required for operator review.');
  }

  if (!ALLOWED_LICENSE_TYPES.has(file.type)) {
    throw new Error('Upload a JPG, PNG, WebP, or PDF copy of your driver license.');
  }

  if (file.size > MAX_OPERATOR_DOCUMENT_SIZE) {
    throw new Error('Driver license upload is too large. Max file size is 10MB.');
  }
}

async function ensureOperatorDocumentBucket() {
  const admin = createAdminSupabaseClient();
  const { data } = await admin.storage.getBucket(OPERATOR_DOCUMENT_BUCKET);
  if (data?.id) return;

  const { error } = await admin.storage.createBucket(OPERATOR_DOCUMENT_BUCKET, {
    public: false,
    fileSizeLimit: MAX_OPERATOR_DOCUMENT_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_LICENSE_TYPES),
  });

  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

export async function uploadOperatorLicenseDocument(params: {
  applicationId: string;
  file: File;
}) {
  validateOperatorLicenseFile(params.file);
  await ensureOperatorDocumentBucket();

  const admin = createAdminSupabaseClient();
  const key = [
    'applications',
    params.applicationId,
    `driver-license-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt(params.file.name)}`,
  ].join('/');
  const buffer = Buffer.from(await params.file.arrayBuffer());

  const { data: upload, error: uploadError } = await admin.storage
    .from(OPERATOR_DOCUMENT_BUCKET)
    .upload(key, buffer, {
      contentType: params.file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: doc, error: insertError } = await admin
    .from('operator_application_documents')
    .insert({
      application_id: params.applicationId,
      document_type: 'driver_license',
      file_name: params.file.name,
      content_type: params.file.type || 'application/octet-stream',
      file_size: params.file.size,
      storage_bucket: OPERATOR_DOCUMENT_BUCKET,
      storage_key: upload.path,
      status: 'submitted',
    })
    .select('*')
    .single();

  if (insertError) {
    await admin.storage.from(OPERATOR_DOCUMENT_BUCKET).remove([upload.path]);
    throw insertError;
  }

  return doc as OperatorApplicationDocument;
}

export async function getOperatorApplicationDocuments(applicationIds: string[]) {
  if (applicationIds.length === 0) return new Map<string, OperatorApplicationDocument[]>();

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('operator_application_documents')
    .select('*')
    .in('application_id', applicationIds)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const documents = await Promise.all(
    ((data ?? []) as OperatorApplicationDocument[]).map(async (doc) => {
      const { data: signed } = await admin.storage
        .from(doc.storage_bucket || OPERATOR_DOCUMENT_BUCKET)
        .createSignedUrl(doc.storage_key, 60 * 10);

      return {
        ...doc,
        signedUrl: signed?.signedUrl ?? null,
      };
    }),
  );

  return documents.reduce((map, doc) => {
    const list = map.get(doc.application_id) ?? [];
    list.push(doc);
    map.set(doc.application_id, list);
    return map;
  }, new Map<string, OperatorApplicationDocument[]>());
}

export async function hasOperatorLicenseDocument(applicationId: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('operator_application_documents')
    .select('id')
    .eq('application_id', applicationId)
    .eq('document_type', 'driver_license')
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
