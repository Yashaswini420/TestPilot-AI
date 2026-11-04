import { chromium } from 'playwright';
import { observe } from './observe.js';
import { act } from './act.js';
import { askLLM } from './llm.js';
import { SYSTEM_PROMPT } from './prompt.js';

const MAX_STEPS = 40;

async function runTest(description) {
  const browser = await chromium.launch({ headless: process.env.HEADLESS === '1' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const history = [];
  let lastAction = '';
  let repeats = 0;
  let verdict = { result: 'fail', reason: `No verdict after ${MAX_STEPS} steps` };

  try {
    for (let step = 1; step <= MAX_STEPS; step++) {
      // 1. EYES
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      const state = await observe(page);

      // 2. BRAIN
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content:
            `TEST:\n${description}\n\n` +
            `PREVIOUS STEPS:\n${history.slice(-10).join('\n') || '(none)'}\n\n` +
            `CURRENT PAGE:\n${JSON.stringify(state)}`,
        },
      ];

      let action;
      try {
        action = await askLLM(messages);
      } catch (e) {
        console.log(`[${step}] LLM error: ${e.message}`);
        history.push(`${step}. LLM error, try again`);
        continue;
      }

      const { thought, ...command } = action;
      console.log(`[${step}] ${thought ?? ''}\n     -> ${JSON.stringify(command)}`);

      // Finished?
      if (action.action === 'finish') {
        verdict = { result: action.result, reason: action.reason };
        break;
      }

      // Loop guard: same action 3 times in a row means the agent is stuck
      const key = JSON.stringify(command);
      repeats = key === lastAction ? repeats + 1 : 1;
      lastAction = key;
      if (repeats >= 3) {
        verdict = { result: 'fail', reason: `Stuck repeating: ${key}` };
        break;
      }

      // 3. HANDS
      try {
        await act(page, command);
        history.push(`${step}. OK ${key}`);
      } catch (e) {
        const msg = e.message.split('\n')[0];
        console.log(`     FAILED: ${msg}`);
        history.push(`${step}. FAILED ${key} -> ${msg}`);
        await page.screenshot({ path: `fail-step-${step}.png` });
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${String(verdict.result).toUpperCase()}: ${verdict.reason}`);
  return verdict.result === 'pass';
}

const description = process.argv.slice(2).join(' ');
if (!description) {
  console.log('Usage: node agent.js "your test in plain English"');
  process.exit(1);
}

const passed = await runTest(description);
process.exit(passed ? 0 : 1);