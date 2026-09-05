import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhone, saveUser, getFarmByUserId } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, phone } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Izina rirakenewe (Name is required)' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nimero ya telefone irakenewe (Phone is required)' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    let user = await getUserByPhone(cleanPhone);

    if (!user) {
      user = {
        id: uuidv4(),
        name: name.trim(),
        phone: cleanPhone,
        created_at: new Date().toISOString(),
      };
      await saveUser(user);
    }

    const farm = await getFarmByUserId(user.id);

    const res = NextResponse.json({
      success: true,
      user,
      farm,
    });

    // Set cookie for 30 days
    res.cookies.set('incuti_user_id', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Habaye ikibazo mu kwinjira. Gerageza nanone.' },
      { status: 500 }
    );
  }
}
