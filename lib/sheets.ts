import { google } from 'googleapis';
import { User, Farm, ScanRecord, ActionRecord, LearningContentItem, ChatLogRecord } from './types';
import { SEED_LEARNING_CONTENT } from './seedData';

// Fallback in-memory store for development/offline mode when credentials are not configured
const globalForMemory = globalThis as unknown as {
  incutiMemoryStore?: {
    users: Map<string, User>;
    farms: Map<string, Farm>;
    scans: ScanRecord[];
    actions: ActionRecord[];
    learning: LearningContentItem[];
    chatLogs: ChatLogRecord[];
  };
};

const memoryStore =
  globalForMemory.incutiMemoryStore ||
  (globalForMemory.incutiMemoryStore = {
    users: new Map<string, User>(),
    farms: new Map<string, Farm>(),
    scans: [] as ScanRecord[],
    actions: [] as ActionRecord[],
    learning: [...SEED_LEARNING_CONTENT] as LearningContentItem[],
    chatLogs: [] as ChatLogRecord[],
  });

const SHEET_NAMES = {
  USERS: 'Users',
  FARMS: 'Farms',
  SCANS: 'Scans',
  ACTIONS: 'Actions',
  LEARNING: 'LearningContent',
  CHAT_LOGS: 'ChatLogs',
} as const;

const HEADERS = {
  [SHEET_NAMES.USERS]: ['id', 'name', 'phone', 'created_at'],
  [SHEET_NAMES.FARMS]: ['id', 'user_id', 'location_text', 'district', 'area_ha', 'crops', 'intercrop', 'created_at'],
  [SHEET_NAMES.SCANS]: ['id', 'farm_id', 'image_url', 'observation', 'risk_level', 'recommendations', 'created_at'],
  [SHEET_NAMES.ACTIONS]: ['id', 'farm_id', 'action_type', 'description', 'photo_url', 'status', 'created_at'],
  [SHEET_NAMES.LEARNING]: ['id', 'category', 'title_kinyarwanda', 'description_kinyarwanda', 'video_url', 'related_risk_tags'],
  [SHEET_NAMES.CHAT_LOGS]: ['id', 'user_id', 'question', 'answer', 'created_at'],
};

// Lazy initialization of Google Sheets client inside functions, never at module top-level
async function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return null;
  }

  // Handle escaped \n characters in Vercel environment variables
  privateKey = privateKey.replace(/\\n/g, '\n');

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, spreadsheetId };
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
}

// Ensure sheets and headers exist
let isInitialized = false;
async function ensureSheetsAndHeaders(sheets: any, spreadsheetId: string) {
  if (isInitialized) return;

  try {
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const existingTitles: string[] = (metadata.data.sheets || []).map(
      (s: any) => s.properties?.title || ''
    );

    const sheetsToCreate: string[] = [];
    for (const name of Object.values(SHEET_NAMES)) {
      if (!existingTitles.includes(name)) {
        sheetsToCreate.push(name);
      }
    }

    if (sheetsToCreate.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: sheetsToCreate.map((title) => ({
            addSheet: { properties: { title } },
          })),
        },
      });
    }

    // Check & write headers
    for (const [sheetName, headers] of Object.entries(HEADERS)) {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });

      if (!res.data.values || res.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });

        // If LearningContent was just initialized, seed with initial items
        if (sheetName === SHEET_NAMES.LEARNING) {
          const seedRows = SEED_LEARNING_CONTENT.map((item) => [
            item.id,
            item.category,
            item.title_kinyarwanda,
            item.description_kinyarwanda,
            item.video_url,
            item.related_risk_tags,
          ]);
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${SHEET_NAMES.LEARNING}!A2`,
            valueInputOption: 'RAW',
            requestBody: { values: seedRows },
          });
        }
      }
    }

    isInitialized = true;
  } catch (error) {
    console.warn('Could not auto-initialize sheets/headers (might lack permissions or offline):', error);
  }
}

// ---------------- USER OPERATIONS ----------------

export async function saveUser(user: User): Promise<User> {
  memoryStore.users.set(user.id, user);
  const client = await getSheetsClient();
  if (!client) {
    return user;
  }

  try {
    const { sheets, spreadsheetId } = client;
    await ensureSheetsAndHeaders(sheets, spreadsheetId);

    // Check if user already exists
    const existing = await getUserById(user.id);
    if (!existing) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAMES.USERS}!A2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[user.id, user.name, user.phone, user.created_at]],
        },
      });
    }
    return user;
  } catch (err) {
    console.error('Error saving user to Google Sheets, using memory fallback:', err);
    memoryStore.users.set(user.id, user);
    return user;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await getSheetsClient();
  if (!client) {
    return memoryStore.users.get(id) || null;
  }

  try {
    const { sheets, spreadsheetId } = client;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.USERS}!A2:D`,
    });

    const rows = res.data.values || [];
    const found = rows.find((r: string[]) => r[0] === id);
    if (!found) return memoryStore.users.get(id) || null;

    return {
      id: found[0],
      name: found[1] || '',
      phone: found[2] || '',
      created_at: found[3] || '',
    };
  } catch (err) {
    console.error('Error getting user from Sheets:', err);
    return memoryStore.users.get(id) || null;
  }
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const client = await getSheetsClient();
  if (!client) {
    const userList = Array.from(memoryStore.users.values());
    for (const u of userList) {
      if (u.phone.replace(/\s+/g, '') === cleanPhone) return u;
    }
    return null;
  }

  try {
    const { sheets, spreadsheetId } = client;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.USERS}!A2:D`,
    });

    const rows = res.data.values || [];
    const found = rows.find(
      (r: string[]) => (r[2] || '').trim().replace(/\s+/g, '') === cleanPhone
    );
    if (!found) return null;

    return {
      id: found[0],
      name: found[1] || '',
      phone: found[2] || '',
      created_at: found[3] || '',
    };
  } catch (err) {
    console.error('Error getting user by phone from Sheets:', err);
    const userList = Array.from(memoryStore.users.values());
    for (const u of userList) {
      if (u.phone.replace(/\s+/g, '') === cleanPhone) return u;
    }
    return null;
  }
}

// ---------------- FARM OPERATIONS ----------------

export async function saveFarm(farm: Farm): Promise<Farm> {
  memoryStore.farms.set(farm.user_id, farm);
  const client = await getSheetsClient();
  if (!client) {
    return farm;
  }

  try {
    const { sheets, spreadsheetId } = client;
    await ensureSheetsAndHeaders(sheets, spreadsheetId);

    // Check if farm for user exists already, if so update row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.FARMS}!A2:H`,
    });
    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((r: string[]) => r[1] === farm.user_id);

    const rowData = [
      farm.id,
      farm.user_id,
      farm.location_text,
      farm.district,
      farm.area_ha.toString(),
      farm.crops,
      farm.intercrop,
      farm.created_at,
    ];

    if (rowIndex >= 0) {
      const sheetRowNumber = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAMES.FARMS}!A${sheetRowNumber}:H${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAMES.FARMS}!A2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    }

    return farm;
  } catch (err) {
    console.error('Error saving farm to Sheets, using memory fallback:', err);
    memoryStore.farms.set(farm.user_id, farm);
    return farm;
  }
}

export async function getFarmByUserId(userId: string): Promise<Farm | null> {
  const client = await getSheetsClient();
  if (!client) {
    return memoryStore.farms.get(userId) || null;
  }

  try {
    const { sheets, spreadsheetId } = client;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.FARMS}!A2:H`,
    });

    const rows = res.data.values || [];
    const found = rows.find((r: string[]) => r[1] === userId);
    if (!found) return memoryStore.farms.get(userId) || null;

    return {
      id: found[0],
      user_id: found[1],
      location_text: found[2] || '',
      district: found[3] || '',
      area_ha: parseFloat(found[4]) || 0,
      crops: found[5] || '',
      intercrop: found[6] || '',
      created_at: found[7] || '',
    };
  } catch (err) {
    console.error('Error getting farm by user_id from Sheets:', err);
    return memoryStore.farms.get(userId) || null;
  }
}

// ---------------- SCAN OPERATIONS ----------------

export async function saveScan(scan: ScanRecord): Promise<ScanRecord> {
  memoryStore.scans.unshift(scan);
  const client = await getSheetsClient();
  if (!client) {
    return scan;
  }

  try {
    const { sheets, spreadsheetId } = client;
    await ensureSheetsAndHeaders(sheets, spreadsheetId);

    const recsString = JSON.stringify(scan.recommendations || []);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAMES.SCANS}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          scan.id,
          scan.farm_id,
          scan.image_url,
          scan.observation,
          scan.risk_level,
          recsString,
          scan.created_at,
        ]],
      },
    });

    return scan;
  } catch (err) {
    console.error('Error saving scan to Sheets:', err);
    memoryStore.scans.unshift(scan);
    return scan;
  }
}

export async function getScansByFarmId(farmId: string): Promise<ScanRecord[]> {
  const client = await getSheetsClient();
  if (!client) {
    return memoryStore.scans.filter((s) => s.farm_id === farmId);
  }

  try {
    const { sheets, spreadsheetId } = client;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.SCANS}!A2:G`,
    });

    const rows = res.data.values || [];
    const matched = rows.filter((r: string[]) => r[1] === farmId);

    return matched.map((r: string[]) => {
      let recs: string[] = [];
      try {
        recs = JSON.parse(r[5]);
      } catch {
        recs = r[5] ? r[5].split(';') : [];
      }

      return {
        id: r[0],
        farm_id: r[1],
        image_url: r[2] || '',
        observation: r[3] || '',
        risk_level: (r[4] as any) || 'low',
        recommendations: recs,
        created_at: r[6] || '',
      };
    }).reverse();
  } catch (err) {
    console.error('Error getting scans from Sheets:', err);
    return memoryStore.scans.filter((s) => s.farm_id === farmId);
  }
}

// ---------------- ACTIONS OPERATIONS ----------------

export async function saveAction(action: ActionRecord): Promise<ActionRecord> {
  memoryStore.actions.unshift(action);
  const client = await getSheetsClient();
  if (!client) {
    return action;
  }

  try {
    const { sheets, spreadsheetId } = client;
    await ensureSheetsAndHeaders(sheets, spreadsheetId);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAMES.ACTIONS}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          action.id,
          action.farm_id,
          action.action_type,
          action.description,
          action.photo_url || '',
          action.status,
          action.created_at,
        ]],
      },
    });

    return action;
  } catch (err) {
    console.error('Error saving action to Sheets:', err);
    memoryStore.actions.unshift(action);
    return action;
  }
}

export async function getActionsByFarmId(farmId: string): Promise<ActionRecord[]> {
  const client = await getSheetsClient();
  if (!client) {
    return memoryStore.actions.filter((a) => a.farm_id === farmId);
  }

  try {
    const { sheets, spreadsheetId } = client;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.ACTIONS}!A2:G`,
    });

    const rows = res.data.values || [];
    const matched = rows.filter((r: string[]) => r[1] === farmId);

    return matched.map((r: string[]) => ({
      id: r[0],
      farm_id: r[1],
      action_type: r[2] || '',
      description: r[3] || '',
      photo_url: r[4] || '',
      status: r[5] || 'Byarangiye',
      created_at: r[6] || '',
    })).reverse();
  } catch (err) {
    console.error('Error getting actions from Sheets:', err);
    return memoryStore.actions.filter((a) => a.farm_id === farmId);
  }
}

// ---------------- LEARNING OPERATIONS ----------------

export async function getLearningContent(category?: string, tag?: string): Promise<LearningContentItem[]> {
  const client = await getSheetsClient();
  let items: LearningContentItem[] = SEED_LEARNING_CONTENT;
  memoryStore.learning = [...SEED_LEARNING_CONTENT];

  if (client) {
    try {
      const { sheets, spreadsheetId } = client;
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAMES.LEARNING}!A2:F`,
      });

      const rows = res.data.values || [];
      if (rows.length > 0) {
        items = rows.map((r: string[]) => ({
          id: r[0],
          category: r[1] || '',
          title_kinyarwanda: r[2] || '',
          description_kinyarwanda: r[3] || '',
          video_url: r[4] || '',
          related_risk_tags: r[5] || '',
        }));
      }
    } catch (err) {
      console.warn('Error reading learning content from Sheets, using default seed:', err);
    }
  }

  let filtered = items;
  if (category && category !== 'All' && category !== 'Byose') {
    filtered = filtered.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }

  if (tag) {
    const searchTag = tag.toLowerCase().trim();
    filtered = filtered.filter((i) =>
      i.related_risk_tags.toLowerCase().split(',').map((t) => t.trim()).includes(searchTag)
    );
  }

  return filtered;
}

// ---------------- CHAT LOG OPERATIONS ----------------

export async function saveChatLog(log: ChatLogRecord): Promise<ChatLogRecord> {
  const client = await getSheetsClient();
  if (!client) {
    memoryStore.chatLogs.unshift(log);
    return log;
  }

  try {
    const { sheets, spreadsheetId } = client;
    await ensureSheetsAndHeaders(sheets, spreadsheetId);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAMES.CHAT_LOGS}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[log.id, log.user_id, log.question, log.answer, log.created_at]],
      },
    });

    return log;
  } catch (err) {
    console.error('Error saving chat log to Sheets:', err);
    memoryStore.chatLogs.unshift(log);
    return log;
  }
}
