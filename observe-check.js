import { chromium } from 'playwright';
import { observe } from './observe.js';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://www.saucedemo.com/');

const state = await observe(page);
console.log(JSON.stringify(state, null, 2));

// Prove the ids work: type into element 0 using only its agent id
await page.locator('[data-agent-id="0"]').fill('standard_user');
await page.waitForTimeout(2000);

await browser.close();