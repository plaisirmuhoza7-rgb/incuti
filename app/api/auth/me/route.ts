import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getFarmByUserId } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieUserId = req.cookies.get('incuti_user_id')?.value;
    const queryUserId = req.nextUrl.searchParams.get('userId');
    const userId = queryUserId || cookieUserId;

    if (!userId) {
      return NextResponse.json({
        success: true,
        user: null,
        farm: null,
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
        farm: null,
      });
    }

    const farm = await getFarmByUserId(user.id);

    return NextResponse.json({
      success: true,
      user,
      farm,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Habaye ikibazo mu gusoma umwirondoro.' },
      { status: 500 }
    );
  }
}
