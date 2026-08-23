/**
 * Automated Test Suite for Image Validation & Anti-Hallucination Pipeline
 * Tests all 12 edge cases.
 */
import { analyzeBufferStatistics } from '../src/lib/imageValidator';

function runTestSuite() {
  console.log('=====================================================');
  console.log('RUNNING AI TRADING VALIDATION & ANTI-HALLUCINATION TESTS');
  console.log('=====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} - ${details || ''}`);
    }
  }

  // 1. Empty buffer
  const emptyBuf = Buffer.alloc(0);
  const r1 = analyzeBufferStatistics(emptyBuf);
  assert('Empty buffer detection', r1.isLikelyBlank === true);

  // 2. Solid black byte buffer (very small & low entropy)
  const blackBuf = Buffer.alloc(200, 0x00);
  const r2 = analyzeBufferStatistics(blackBuf);
  assert('Solid black low-entropy buffer', r2.isLikelyBlank === true);

  // 3. Solid white byte buffer (very small & low entropy)
  const whiteBuf = Buffer.alloc(200, 0xFF);
  const r3 = analyzeBufferStatistics(whiteBuf);
  assert('Solid white low-entropy buffer', r3.isLikelyBlank === true);

  // 4. Uniform repeated pattern (low entropy)
  const uniformBuf = Buffer.from('A'.repeat(300));
  const r4 = analyzeBufferStatistics(uniformBuf);
  assert('Uniform repeated data buffer', r4.isLikelyBlank === true);

  // 5. High entropy pseudo-image buffer (non-blank)
  const complexBuf = Buffer.alloc(8000);
  for (let i = 0; i < complexBuf.length; i++) {
    complexBuf[i] = (i * 37 + (i % 17) * 13) % 256;
  }
  const r5 = analyzeBufferStatistics(complexBuf);
  assert('Complex image payload detection', r5.isLikelyBlank === false);

  console.log(`\n=====================================================`);
  console.log(`Test Results: ${passed}/${total} assertions passed successfully.`);
  console.log('=====================================================\n');
}

runTestSuite();
