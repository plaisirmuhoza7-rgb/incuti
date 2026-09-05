import { NextRequest, NextResponse } from 'next/server';
import { getFarmByUserId, saveFarm } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';
import { Farm } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || req.cookies.get('incuti_user_id')?.value;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID irakenewe' },
        { status: 400 }
      );
    }

    const farm = await getFarmByUserId(userId);
    return NextResponse.json({ success: true, farm });
  } catch (error: any) {
    console.error('Error in GET /api/farm:', error);
    return NextResponse.json(
      { success: false, error: 'Ntibyashobotse kubona amakuru y\'umurima.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, location_text, district, area_ha, crops, intercrop } = body;

    const currentUserId = userId || req.cookies.get('incuti_user_id')?.value;
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Ugomba kubanza kwinjira muri gahunda (User ID is required).' },
        { status: 401 }
      );
    }

    if (!district || !location_text) {
      return NextResponse.json(
        { success: false, error: 'Akarere n\'aho umurima uherereye birakenewe.' },
        { status: 400 }
      );
    }

    const existingFarm = await getFarmByUserId(currentUserId);

    const farm: Farm = {
      id: existingFarm ? existingFarm.id : uuidv4(),
      user_id: currentUserId,
      location_text: location_text.trim(),
      district: district.trim(),
      area_ha: Number(area_ha) || 0.1,
      crops: crops ? crops.trim() : 'Ibihingwa by\'ibanze',
      intercrop: intercrop ? intercrop.trim() : 'Oya',
      created_at: existingFarm ? existingFarm.created_at : new Date().toISOString(),
    };

    await saveFarm(farm);

    return NextResponse.json({
      success: true,
      farm,
      message: 'Amakuru y\'umurima yabitswe neza!',
    });
  } catch (error: any) {
    console.error('Error in POST /api/farm:', error);
    return NextResponse.json(
      { success: false, error: 'Ntibyashobotse kubika umurima. Gerageza nanone.' },
      { status: 500 }
    );
  }
}
