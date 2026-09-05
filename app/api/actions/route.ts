import { NextRequest, NextResponse } from 'next/server';
import { saveAction, getActionsByFarmId } from '@/lib/sheets';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { ActionRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const farmId = req.nextUrl.searchParams.get('farmId');
    if (!farmId) {
      return NextResponse.json(
        { success: false, error: 'Farm ID irakenewe' },
        { status: 400 }
      );
    }

    const actions = await getActionsByFarmId(farmId);
    return NextResponse.json({ success: true, actions });
  } catch (error: any) {
    console.error('Error in GET /api/actions:', error);
    return NextResponse.json(
      { success: false, error: 'Ntibyashobotse kubona urutonde rw\'ibikorwa.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { farmId, action_type, description, photo, status } = body;

    if (!farmId || !action_type) {
      return NextResponse.json(
        { success: false, error: 'Ubwoko bw\'igikorwa n\'ikiranga umurima birakenewe.' },
        { status: 400 }
      );
    }

    let photoUrl = '';
    if (photo && typeof photo === 'string' && photo.length > 50) {
      try {
        const uploadRes = await uploadImageToCloudinary(photo, 'ingazi_action_photos');
        photoUrl = uploadRes.url;
      } catch (err) {
        console.warn('Action photo upload error, using raw data fallback:', err);
        photoUrl = photo;
      }
    }

    const actionRecord: ActionRecord = {
      id: uuidv4(),
      farm_id: farmId,
      action_type: action_type.trim(),
      description: description ? description.trim() : '',
      photo_url: photoUrl,
      status: status || 'Byarangiye',
      created_at: new Date().toISOString(),
    };

    await saveAction(actionRecord);

    return NextResponse.json({
      success: true,
      action: actionRecord,
      message: 'Igikorwa cyanditswe neza!',
    });
  } catch (error: any) {
    console.error('Error in POST /api/actions:', error);
    return NextResponse.json(
      { success: false, error: 'Ntibyashobotse kwandika igikorwa. Gerageza nanone.' },
      { status: 500 }
    );
  }
}
