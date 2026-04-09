import { NextResponse } from 'next/server';
import { issueAttestationChallenge } from '@/server/attestation/challenge';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const challenge = issueAttestationChallenge();
    return NextResponse.json({ challenge }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed_to_issue_challenge' },
      { status: 500 }
    );
  }
}
