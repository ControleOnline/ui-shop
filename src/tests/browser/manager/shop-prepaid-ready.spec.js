const {expect, test} = require('playwright/test');
const {setupShopPurchaseApi} = require('./shopPurchaseFlowApi');
const {simpleProduct} = require('./shopPurchaseFlowData');
const {
  SHOP_PREPAID_READY_FLOW,
  captureStepPrint,
  createEmptyEvidence,
  writeEvidenceManifest,
} = require('./shopPrepaidReadyManifest');

const login = async page => {
  await page.goto('/sign-in-page?redirectRoute=ShopIndex');
  await page.getByPlaceholder('Email').fill('cliente.smoke@example.test');
  await page.getByPlaceholder('Senha').fill('senha-smoke');
  await page.getByText('Entrar', {exact: true}).click();
  await page.waitForURL(url => !url.pathname.includes('sign-in-page'));
};

const expectVisibleText = async (page, text, options = {}) => {
  const locator = page.getByText(text, {exact: options.exact ?? true});
  await expect
    .poll(async () => {
      const count = await locator.count();
      for (let index = 0; index < count; index += 1) {
        if (await locator.nth(index).isVisible()) return true;
      }
      return false;
    }, {timeout: options.timeout || 8000})
    .toBe(true);
};

const setOrderPhase = (state, label, realStatus) => {
  state.order = {
    ...state.order,
    orderType: 'sale',
    status: {
      id: realStatus === 'ready' ? 94 : 93,
      '@id': `/statuses/${realStatus === 'ready' ? 94 : 93}`,
      status: label,
      realStatus,
    },
    realStatus,
  };
};

test.describe('shop prepaid until ready smoke', () => {
  test('flowchart 1 shop prepaid reaches Ready with prints', async ({page}, testInfo) => {
    // fluxo: compra-fluxo
    const state = await setupShopPurchaseApi(page);
    let evidence = createEmptyEvidence();

    expect(SHOP_PREPAID_READY_FLOW.flowchartIds).toEqual([1]);
    expect(SHOP_PREPAID_READY_FLOW.fluxo).toBe('compra-fluxo');

    await login(page);
    await page.goto('/shop/product/101');
    await expect(page.getByText(simpleProduct.product, {exact: true}).first()).toBeVisible();
    evidence = await captureStepPrint(page, testInfo, evidence, 'shop-catalog');

    await page.getByLabel(`Aumentar quantidade de ${simpleProduct.product}`).click();
    await page.goto('/cart');
    await expectVisibleText(page, simpleProduct.product, {exact: false});
    await expect(page.getByText('1 item(ns) no carrinho')).toBeVisible();
    evidence = await captureStepPrint(page, testInfo, evidence, 'shop-cart');

    await page.getByText('Finalizar e pagar').click();
    await expect(page.getByText('Pedido #72651')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Gerar Pix'})).toBeEnabled();
    await page.getByRole('button', {name: 'Gerar Pix'}).click();
    await expect(page.getByText('Pix gerado')).toBeVisible();
    evidence = await captureStepPrint(page, testInfo, evidence, 'shop-checkout-prepaid');

    setOrderPhase(state, 'Conference', 'conference');
    await page.goto('/orders/my/id/72651');
    await expectVisibleText(page, 'Conference', {exact: false});
    await expectVisibleText(page, simpleProduct.product, {exact: false});
    evidence = await captureStepPrint(page, testInfo, evidence, 'pcp-conference');

    setOrderPhase(state, 'Ready', 'ready');
    await page.goto('/orders/my/id/72651');
    await expectVisibleText(page, 'Ready', {exact: false});
    await expectVisibleText(page, simpleProduct.product, {exact: false});
    evidence = await captureStepPrint(page, testInfo, evidence, 'ready');

    const manifestPath = writeEvidenceManifest(evidence);
    expect(state.payments.some(item => item.startsWith('pix:'))).toBe(true);
    expect(evidence.prints).toHaveLength(5);
    expect(manifestPath).toContain('shop-prepaid-ready');
    expect(state.requests.filter(item => item.startsWith('pageerror:'))).toEqual([]);
  });
});
