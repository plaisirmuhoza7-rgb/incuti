import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { analyzeFarmImageWithGemini } from '@/lib/gemini';
import { saveScan, getScansByFarmId, getLearningContent } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';
import { ScanRecord, LearningContentItem } from '@/lib/types';

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

    const scans = await getScansByFarmId(farmId);
    return NextResponse.json({ success: true, scans });
  } catch (error: any) {
    console.error('Error in GET /api/scan:', error);
    return NextResponse.json(
      { success: false, error: 'Ntibyashobotse kubona ibisubizo by\'isuzuma.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { farmId, image, mimeType } = body;

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: 'Farm ID irakenewe mbere yo gusuzuma.' },
        { status: 400 }
      );
    }

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Ifoto y\'umurima irakenewe (Image is required).' },
        { status: 400 }
      );
    }

    // 1. Upload to Cloudinary
    let imageUrl = '';
    try {
      const uploadRes = await uploadImageToCloudinary(image, 'ingazi_farm_scans');
      imageUrl = uploadRes.url;
    } catch (uploadErr) {
      console.warn('Cloudinary upload warning:', uploadErr);
      imageUrl = image; // fallback to base64 uri if upload issues
    }

    // 2. Analyze with Gemini Vision
    const analysis = await analyzeFarmImageWithGemini(image, mimeType || 'image/jpeg');

    // 3. Save to Google Sheets Scans tab
    const scanRecord: ScanRecord = {
      id: uuidv4(),
      farm_id: farmId,
      image_url: imageUrl,
      observation: analysis.observation,
      risk_level: analysis.risk_level,
      recommendations: analysis.recommendations,
      explanation: analysis.explanation,
      confidence: analysis.confidence,
      created_at: new Date().toISOString(),
    };

    await saveScan(scanRecord);

    // 4. Find matching LearningContent by risk tags
    const allLearning = await getLearningContent();
    const tagsToMatch: string[] = [];

    if (analysis.risk_level === 'high') {
      tagsToMatch.push('erosion', 'drought', 'pest', 'disease');
    } else if (analysis.risk_level === 'moderate') {
      tagsToMatch.push('soil_cover', 'mulching', 'nutrient_deficiency');
    } else {
      tagsToMatch.push('soil_health', 'intercropping', 'minimum_tillage');
    }

    // Check words in observation
    const obsLower = (analysis.observation + ' ' + (analysis.explanation || '')).toLowerCase();
    if (obsLower.includes('isuri') || obsLower.includes('amazi')) tagsToMatch.push('erosion');
    if (obsLower.includes('sasira') || obsLower.includes('gupfuka')) tagsToMatch.push('mulching', 'soil_cover');
    if (obsLower.includes('imborera') || obsLower.includes('ifumbire')) tagsToMatch.push('manure', 'soil_health');
    if (obsLower.includes('udukoko') || obsLower.includes('indwara')) tagsToMatch.push('pest', 'disease');

    const matchedLearning = allLearning.filter((item) => {
      const itemTags = item.related_risk_tags.split(',').map((t) => t.trim().toLowerCase());
      return tagsToMatch.some((tag) => itemTags.includes(tag));
    }).slice(0, 3);

    return NextResponse.json({
      success: true,
      scan: scanRecord,
      analysis,
      related_learning: matchedLearning.length > 0 ? matchedLearning : allLearning.slice(0, 2),
    });
  } catch (error: any) {
    console.error('Error in POST /api/scan:', error);
    return NextResponse.json(
      { success: false, error: 'Isuzuma ryahuye n\'ikibazo. Gerageza nanone.' },
      { status: 500 }
    );
  }
}
