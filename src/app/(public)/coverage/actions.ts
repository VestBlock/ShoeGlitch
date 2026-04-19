'use server';

import { checkCoverage } from '@/lib/coverage';

export async function checkZipAction(formData: FormData) {
  const zip = String(formData.get('zip') ?? '');
  return checkCoverage(zip);
}
