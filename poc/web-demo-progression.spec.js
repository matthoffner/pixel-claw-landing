const { test, expect } = require('@playwright/test');
const path = require('path');

test('loop revisions progress visually across iterations', async ({ page }) => {
  await page.route('**/api/generate-widget', async (route) => {
    const body = route.request().postDataJSON?.() || {};
    const prompt = String(body.prompt || '');
    const match = prompt.match(/Iteration:\s*(\d+)/i);
    const iteration = match ? Number(match[1]) : 1;
    const hasDeniedFeedback = /Required feedback to address:/i.test(prompt);

    const theme = iteration % 2 === 0 ? 'pink' : 'default';
    const summary = hasDeniedFeedback
      ? `Applied deny feedback and produced iteration ${iteration}`
      : `Generated design iteration ${iteration}`;

    const sourceCode = `
      globalThis.__pixelWidgetFactory = ({ state, setState, prompt }) => {
        const wrap = document.createElement('div');
        wrap.style.display = 'grid';
        wrap.style.gap = '10px';

        const hero = document.createElement('div');
        hero.style.padding = '12px';
        hero.style.borderRadius = '12px';
        hero.style.border = '1px solid #355a8b';
        hero.style.background = '${iteration % 2 === 0 ? '#35143f' : '#13274a'}';
        hero.innerHTML = '<h2 style="margin:0">Iteration ${iteration}</h2><p style="margin:6px 0 0 0">' + prompt + '</p>';

        const badge = document.createElement('div');
        badge.textContent = '${hasDeniedFeedback ? 'Feedback applied' : 'No feedback yet'}';
        badge.style.padding = '8px';
        badge.style.borderRadius = '8px';
        badge.style.background = '${hasDeniedFeedback ? '#4a1630' : '#17365f'}';

        wrap.appendChild(hero);
        wrap.appendChild(badge);
        return wrap;
      };
    `;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ theme, sourceCode, summary })
    });
  });

  const baseUrl = process.env.PIXEL_CLAW_BASE_URL || 'https://pixel-claw-landing.vercel.app';
  await page.goto(`${baseUrl}/poc/web-demo.html`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#setupOverlay')).toBeVisible();
  await page.fill('#setupPrompt', 'Goal: Improve hierarchy with measurable visual changes per iteration.');
  await page.uncheck('#setupAutoMode');
  await page.fill('#setupMaxIterations', '3');
  await page.click('#setupStart');

  await page.click('#openConfig');
  await page.check('#loopEnabled');
  await page.fill('#loopMax', '3');
  await page.click('#loopStart');

  await expect(page.locator('#decisionApprove')).toBeEnabled();
  await expect(page.locator('#decisionIteration')).toContainText('1/3');

  const out1 = path.join(process.cwd(), 'poc', 'playwright-progression-1.png');
  const out2 = path.join(process.cwd(), 'poc', 'playwright-progression-2.png');
  const out3 = path.join(process.cwd(), 'poc', 'playwright-progression-3.png');

  await page.screenshot({ path: out1, fullPage: true });

  await page.click('#decisionApprove');
  await expect(page.locator('#decisionApprove')).toBeEnabled();
  await expect(page.locator('#decisionIteration')).toContainText('2/3');
  await page.screenshot({ path: out2, fullPage: true });

  await page.fill('#decisionFeedback', 'Increase heading contrast and tighten spacing.');
  await page.click('#decisionDeny');
  await expect(page.locator('#decisionApprove')).toBeEnabled();
  await expect(page.locator('#decisionIteration')).toContainText('3/3');
  await expect(page.locator('#decisionSummary')).toContainText(/Applied deny feedback/i);
  await page.screenshot({ path: out3, fullPage: true });
});
