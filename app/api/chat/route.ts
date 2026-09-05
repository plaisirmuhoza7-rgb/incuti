import { NextRequest, NextResponse } from 'next/server';
import { askIncutiChat, removeAsterisks } from '@/lib/gemini';
import { getLearningContent, saveChatLog } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';
import { ChatLogRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, question } = body;

    const currentUserId = userId || req.cookies.get('incuti_user_id')?.value || 'anonymous_farmer';

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Baza ikibazo cyawe mu Kinyarwanda (Question is required).' },
        { status: 400 }
      );
    }

    // Retrieve learning titles so Incuti can accurately recommend them
    const learningItems = await getLearningContent();
    const availableTitles = learningItems.map((item) => item.title_kinyarwanda);

    // Call Gemini chat assistant as "Incuti"
    const rawAnswer = await askIncutiChat(question.trim(), availableTitles);
    const answer = removeAsterisks(rawAnswer);

    // Log Q&A to Google Sheets ChatLogs tab
    const chatLog: ChatLogRecord = {
      id: uuidv4(),
      user_id: currentUserId,
      question: question.trim(),
      answer: answer.trim(),
      created_at: new Date().toISOString(),
    };

    // Save log asynchronously / catch error silently so response to farmer is instantaneous
    saveChatLog(chatLog).catch((err) =>
      console.warn('Chat log save warning:', err)
    );

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error('Error in POST /api/chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Incuti ntiyashoboye gusubiza aka kanya. Ongera ugerageze.',
      },
      { status: 500 }
    );
  }
}
