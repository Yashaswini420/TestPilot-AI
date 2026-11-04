import { chromium } from 'playwright';
import { observe } from './observe.js';
import { act } from './act.js';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

await act(page, { action: 'goto', url: 'https://www.saucedemo.com/' });

await observe(page); // stamps the ids onto the page
await act(page, { action: 'fill', id: 0, value: 'standard_user' });
await act(page, { action: 'fill', id: 1, value: '{{TEST_PASSWORD}}' });
await act(page, { action: 'click', id: 2 });

await act(page, { action: 'expect_url', contains: '/inventory' });
await act(page, { action: 'expect_text', text: 'Products' });

console.log('All actions passed');
await page.waitForTimeout(2000);
await browser.close();