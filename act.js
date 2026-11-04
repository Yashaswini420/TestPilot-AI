const withSecrets = text =>
    text.replace(/\{\{(\w+)\}\}/g, (_, name) => process.env[name] ?? `{{${name}}}`);

export async function act(page, a) {
    const el = id => page.locator(`[data-agent-id="${id}"]`);
    const opts = { timeout: 5000 };

    switch (a.action) {
        case 'goto':
            await page.goto(a.url, { waitUntil: 'domcontentloaded' });
            break;
        case 'click':
            await el(a.id).click(opts);
            break;
        case 'fill':
            await el(a.id).fill(withSecrets(a.value), opts);
            break;
        case 'select':
            await el(a.id).selectOption({ label: a.value }, opts);
            break;
        case 'press':
            await page.keyboard.press(a.key);
            break;
        case 'wait':
            await page.waitForTimeout(Math.min(a.ms ?? 1000, 5000));
            break;
        case 'expect_text':
            await page.getByText(a.text, { exact: false }).first()
                .waitFor({ state: 'visible', timeout: 5000 });
            break;
        case 'expect_url':
            await page.waitForURL(url => url.href.includes(a.contains), { timeout: 5000 });
            break;
        case 'hover':
            await el(a.id).hover(opts);
            break;
        default:
            throw new Error(`Unknown action: ${a.action}`);
    }

    await page.waitForLoadState('domcontentloaded').catch(() => { });
}