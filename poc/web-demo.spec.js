const { test, expect } = require('@playwright/test');

test('design autopilot loop UI supports start, approve, deny+feedback, and stop', async ({ page }) => {
  await page.route('**/api/generate-widget', async (route) => {
    const req = route.request();
    const body = req.postDataJSON ? req.postDataJSON() : {};
    const prompt = String(body?.prompt || '');

    const iterationMatch = prompt.match(/Iteration:\s*(\d+)/i);
    const iteration = iterationMatch ? Number(iterationMatch[1]) : 1;

    const hasDeniedFeedback = /Required feedback to address:/i.test(prompt);
    const summary = hasDeniedFeedback
      ? `Applied deny feedback on iteration ${iteration}`
      : `Generated design iteration ${iteration}`;

    const sourceCode = `
      globalThis.__pixelWidgetFactory = ({ state, setState, prompt }) => {
        const wrap = document.createElement('div');
        const header = document.createElement('h3');
        header.textContent = 'Loop Render';
        const meta = document.createElement('p');
        meta.textContent = prompt;
        wrap.appendChild(header);
        wrap.appendChild(meta);
        return wrap;
      };
    `;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        theme: 'default',
        sourceCode,
        summary
      })
    });
  });

  const baseUrl = process.env.PIXEL_CLAW_BASE_URL || 'https://pixel-claw-landing.vercel.app';
  await page.goto(`${baseUrl}/poc/web-demo.html`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#status')).toContainText(/Done|Ready|Generating|Compiling/);

  await page.check('#loopEnabled');
  await page.fill('#loopMax', '3');
  await page.fill('#loopGoal', 'Improve spacing and hierarchy while keeping behavior.');
  await page.click('#loopStart');

  await expect(page.locator('#loopMeta')).toContainText('waiting for approve/deny');
  await expect(page.locator('#loopHistory .loop-item')).toHaveCount(1);
  await expect(page.locator('#loopHistory .loop-item').first()).toContainText('Generated design iteration 1');

  await page.click('#loopApprove');
  await expect(page.locator('#loopHistory .loop-item')).toHaveCount(2);
  await expect(page.locator('#loopHistory .loop-item').first()).toContainText('Generated design iteration 2');

  await page.fill('#loopFeedback', 'Use larger heading contrast and reduce vertical clutter.');
  await page.click('#loopDeny');

  await expect(page.locator('#loopHistory .loop-item')).toHaveCount(3);
  await expect(page.locator('#loopHistory .loop-item').first()).toContainText('Applied deny feedback on iteration 3');
  await expect(page.locator('#loopHistory .loop-item').nth(1)).toContainText('Feedback: Use larger heading contrast and reduce vertical clutter.');

  await page.click('#loopStop');
  await expect(page.locator('#loopMeta')).toContainText('Loop idle.');
  await expect(page.locator('#status')).toContainText('Loop stopped.');
});
