import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { getApplication, saveApplication, uploadVerificationFile } from '@/lib/partner/store';
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from '@/lib/partner/types';

type Params = { params: Promise<{ id: string }> };

const FIELD_MAP = {
  businessCard: 'businessCard',
  headshot: 'headshot',
  license: 'license',
  brokerageVerification: 'brokerageVerification',
} as const;

type UploadField = keyof typeof FIELD_MAP;

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) return errorResponse('Application not found.', 404);
  if (app.status !== 'Draft') return errorResponse('Uploads are locked after submission.', 403);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('Invalid upload payload.');
  }

  const field = formData.get('field') as UploadField | null;
  const file = formData.get('file');

  if (!field || !FIELD_MAP[field]) return errorResponse('Invalid upload field.');
  if (!(file instanceof File)) return errorResponse('No file provided.');

  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return errorResponse('Invalid file type. Upload JPG, PNG, WEBP, or PDF.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return errorResponse('File exceeds 5 MB limit.');
  }

  try {
    const storagePath = await uploadVerificationFile(id, field, file);

    app.verification[field] = storagePath;
    app.auditTrail.push({
      action: `Uploaded ${field}`,
      timestamp: new Date().toISOString(),
      actor: 'applicant',
    });

    await saveApplication(app);

    return jsonResponse({
      success: true,
      file: { field, name: storagePath },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return errorResponse(message, 500);
  }
}
