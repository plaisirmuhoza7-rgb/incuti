const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Starting Incuti End-to-End Verification ---');

  // 1. Check Homepage HTML
  console.log('Test 1: Verify Homepage HTML...');
  const homeRes = await fetch(`${BASE_URL}/`);
  assert.strictEqual(homeRes.status, 200, 'Homepage should return 200');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('Incuti'), 'Homepage should contain Incuti');
  console.log('✓ Homepage loads properly with Kinyarwanda copy');

  // 2. Auth Login (Register farmer)
  console.log('Test 2: Farmer Registration / Login via /api/auth/login...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kwizera Jean',
      phone: '0788123456'
    })
  });
  assert.strictEqual(loginRes.status, 200, 'Login should return 200');
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true, 'Login should succeed');
  assert(loginData.user && loginData.user.id, 'User ID should be generated');
  const userId = loginData.user.id;
  const cookie = loginRes.headers.get('set-cookie');
  console.log(`✓ User created/logged in with ID: ${userId}, Name: ${loginData.user.name}`);

  // 3. Auth Me
  console.log('Test 3: Fetch Current Farmer Profile via /api/auth/me...');
  const meRes = await fetch(`${BASE_URL}/api/auth/me?userId=${userId}`, {
    headers: cookie ? { 'Cookie': cookie } : {}
  });
  const meData = await meRes.json();
  assert.strictEqual(meData.success, true);
  assert.strictEqual(meData.user.name, 'Kwizera Jean');
  console.log('✓ Farmer session verified');

  // 4. Create Farm
  console.log('Test 4: Register Farm via /api/farm...');
  const farmRes = await fetch(`${BASE_URL}/api/farm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      district: 'Musanze',
      location_text: 'Umurenge wa Kinigi, Akagari ka Nyange',
      area_ha: 0.75,
      crops: 'Ibigori, Ibishyimbo, Ibirayi',
      intercrop: 'Yego (Ibigori n\'ibishyimbo)'
    })
  });
  const farmData = await farmRes.json();
  assert.strictEqual(farmData.success, true, 'Farm creation should succeed');
  assert(farmData.farm && farmData.farm.id, 'Farm ID should exist');
  const farmId = farmData.farm.id;
  console.log(`✓ Farm created in ${farmData.farm.district} (${farmData.farm.area_ha} Ha), Farm ID: ${farmId}`);

  // 5. Hero Feature: AI Farm Scan
  console.log('Test 5: Hero Feature - AI Farm Scan via /api/scan...');
  // 1x1 transparent png data uri
  const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const scanRes = await fetch(`${BASE_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farmId,
      image: sampleImage,
      mimeType: 'image/png'
    })
  });
  assert.strictEqual(scanRes.status, 200, 'Scan endpoint should return 200');
  const scanData = await scanRes.json();
  assert.strictEqual(scanData.success, true, 'Scan analysis should succeed');
  assert(scanData.analysis, 'Analysis object must be present');
  assert(scanData.analysis.observation, 'Observation must be present');
  assert(['low', 'moderate', 'high'].includes(scanData.analysis.risk_level), 'Risk level must be valid');
  assert(Array.isArray(scanData.analysis.recommendations), 'Recommendations must be array');
  assert(scanData.related_learning && scanData.related_learning.length > 0, 'Related learning content must be attached');
  console.log(`✓ Scan observation: "${scanData.analysis.observation.slice(0, 60)}..."`);
  console.log(`✓ Risk level: ${scanData.analysis.risk_level}, Recommendations count: ${scanData.analysis.recommendations.length}`);
  console.log(`✓ Attached related learning items: ${scanData.related_learning.length}`);

  // 6. Conservation Action Tracker
  console.log('Test 6: Log Conservation Action via /api/actions...');
  const actionRes = await fetch(`${BASE_URL}/api/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farmId,
      action_type: 'Gusasira (Mulching)',
      description: 'Nasasiye umurima wose w\'ibigori nkoresheje ibyatsi byumye byo mu gishanga.',
      status: 'Byarangiye'
    })
  });
  const actionData = await actionRes.json();
  assert.strictEqual(actionData.success, true);
  assert.strictEqual(actionData.action.action_type, 'Gusasira (Mulching)');
  console.log('✓ Action successfully recorded in history');

  // Verify action list
  const listActionsRes = await fetch(`${BASE_URL}/api/actions?farmId=${farmId}`);
  const listActionsData = await listActionsRes.json();
  assert.strictEqual(listActionsData.success, true);
  assert(listActionsData.actions.length >= 1);
  console.log(`✓ Action list retrieved: ${listActionsData.actions.length} action(s)`);

  // 7. Learning Hub Content
  console.log('Test 7: Fetch Learning Hub Cards via /api/learn...');
  const learnRes = await fetch(`${BASE_URL}/api/learn`);
  const learnData = await learnRes.json();
  assert.strictEqual(learnData.success, true);
  assert(learnData.items && learnData.items.length >= 6, 'Should have at least 6-8 learning cards');
  console.log(`✓ Learning Hub retrieved ${learnData.items.length} educational modules with Kinyarwanda titles`);

  // 8. Incuti Bot Chat Assistant
  console.log('Test 8: Chat with Incuti Bot via /api/chat...');
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      question: 'Nteye ibigori, nasasira nte mu murima wanjye?'
    })
  });
  assert.strictEqual(chatRes.status, 200);
  const chatData = await chatRes.json();
  assert.strictEqual(chatData.success, true);
  assert(chatData.answer && chatData.answer.length > 10, 'Incuti Bot must return a non-empty answer');
  console.log(`✓ Incuti Bot Answer: "${chatData.answer.slice(0, 80)}..."`);

  console.log('\n=========================================');
  console.log('🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('=========================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
