import { NextRequest, NextResponse } from 'next/server';
import { getLearningContent } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category') || undefined;
    const tag = req.nextUrl.searchParams.get('tag') || undefined;

    const items = await getLearningContent(category, tag);
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error in GET /api/learn:', error);
    return NextResponse.json(
      { success: false, error: 'Ntibyashobotse kubona amasomo.' },
      { status: 500 }
    );
  }
}
