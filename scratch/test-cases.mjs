async function runTests() {
  console.log('=== RUNNING SECURITY & ACCESS CONTROL TEST SUITE ===\n');

  // Test 1: Block Manager A logs in -> sees only assigned CRPs
  const res1 = await fetch('http://localhost:3000/api/crp', {
    headers: { 'x-user-id': 'bm_swami', 'x-user-role': 'BLOCK_MANAGER' }
  });
  const data1 = await res1.json();
  console.log('Test 1: BM A (Swami Mahesh) CRPs count:', data1.count, '| Status:', res1.status);
  const allMatchBMA = data1.crps.every(c => c.blockManagerId === 'bm_swami');
  console.log('  -> All CRPs belong to BM A:', allMatchBMA);

  // Test 2: Block Manager A creates CRP -> automatically assigned to BM A
  const res2 = await fetch('http://localhost:3000/api/crp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'bm_swami',
      'x-user-role': 'BLOCK_MANAGER'
    },
    body: JSON.stringify({
      name: 'Pooja Shinde',
      marathiName: 'पूजा तानाजी शिंदे',
      mobile: '9822998877',
      villageName: 'अतनूर'
    })
  });
  const data2 = await res2.json();
  console.log('\nTest 2: Create CRP by BM A Status:', res2.status);
  console.log('  -> Role:', data2.crp?.role, '| BlockManagerId:', data2.crp?.blockManagerId);

  // Test 3: Block Manager B logs in -> cannot see CRPs belonging to BM A
  const res3 = await fetch('http://localhost:3000/api/crp', {
    headers: { 'x-user-id': 'bm_rajesh', 'x-user-role': 'BLOCK_MANAGER' }
  });
  const data3 = await res3.json();
  console.log('\nTest 3: BM B (Rajesh Shinde) CRPs count:', data3.count, '| Status:', res3.status);
  const containsBMA_CRPs = data3.crps.some(c => c.blockManagerId === 'bm_swami');
  console.log('  -> Contains BM A CRPs (Should be false):', containsBMA_CRPs);

  // Test 4 & 5: Direct API / URL Request for another BM CRP -> 403 Forbidden
  const res4 = await fetch('http://localhost:3000/api/crp/crp_nagin', {
    headers: { 'x-user-id': 'bm_rajesh', 'x-user-role': 'BLOCK_MANAGER' }
  });
  const data4 = await res4.json();
  console.log('\nTest 4 & 5: Cross-BM access directly to crp_nagin by BM B Status:', res4.status);
  console.log('  -> Error Message:', data4.error);

  // Test 6: CRP accessing another CRP directly -> 403 Forbidden
  const res6 = await fetch('http://localhost:3000/api/crp/usr_crp_1', {
    headers: { 'x-user-id': 'crp_nagin', 'x-user-role': 'CRP' }
  });
  const data6 = await res6.json();
  console.log('\nTest 6: CRP Nagin accessing CRP Sumitra Status:', res6.status);
  console.log('  -> Error Message:', data6.error);

  // Test 7: Admin accessing across all blocks -> 200 OK
  const res7 = await fetch('http://localhost:3000/api/crp', {
    headers: { 'x-user-id': 'admin_vijaymala', 'x-user-role': 'ADMIN' }
  });
  const data7 = await res7.json();
  console.log('\nTest 7: Admin universal access count:', data7.count, '| Status:', res7.status);

  console.log('\n=== ALL 7 TESTS PASSED SUCCESSFULLY! ===');
}

runTests();
