const {expect, test} = require('playwright/test');
const {browserApi, setupShopPurchaseApi} = require('./shopPurchaseFlowApi');
const {
  addonProduct,
  customProduct,
  simpleProduct,
} = require('./shopPurchaseFlowData');

const login = async page => {
  await page.goto('/sign-in-page?redirectRoute=ShopIndex');
  await page.getByPlaceholder('Email').fill('cliente.smoke@example.test');
  await page.getByPlaceholder('Senha').fill('senha-smoke');
  await page.getByText('Entrar', {exact: true}).click();
  await page.waitForURL(url => !url.pathname.includes('sign-in-page'));
};

const ensureLoggedIn = async page => {
  if (page.url().includes('/sign-in-page')) {
    await page.getByPlaceholder('Email').fill('cliente.smoke@example.test');
    await page.getByPlaceholder('Senha').fill('senha-smoke');
    await page.getByText('Entrar', {exact: true}).click();
    await page.waitForURL(url => !url.pathname.includes('sign-in-page'));
  }
};

const expectManagerReflectsCart = async (page, productName) => {
  await page.goto('/orders/my/id/72651');
  await expectVisibleText(page, productName, {timeout: 15000});
};

const expectVisibleText = async (page, text, options = {}) => {
  const locator = page.getByText(text, {exact: options.exact ?? true});
  await expect
    .poll(
      async () => {
        const count = await locator.count();
        for (let index = 0; index < count; index += 1) {
          if (await locator.nth(index).isVisible()) {
            return true;
          }
        }
        return false;
      },
      {timeout: options.timeout || 5000},
    )
    .toBe(true);
};

const expectCartQuantity = async (state, product, quantity) => {
  await expect
    .poll(() => {
      const row = state.orderProducts.find(
        item => String(item?.product?.id) === String(product.id),
      );
      return Number(row?.quantity || 0);
    })
    .toBe(quantity);
};

const openCustomization = async (page, product) => {
  const url = `/customize-screen?productId=${product.id}&redirectToCart=true`;
  await page.goto(url);
  await ensureLoggedIn(page);
  if (!page.url().includes('/customize-screen')) {
    await page.goto(url);
  }
  await expect(page.getByText('Resumo do item')).toBeVisible();
};

test.describe('shop complete purchase flow smoke', () => {
  test('covers cart, custom products, login, addresses, payments and manager reflection', async ({
    page,
  }) => {
    const state = await setupShopPurchaseApi(page);

    await login(page);

    await page.goto('/shop/product/101');
    await expect(page.getByText(simpleProduct.product, {exact: true}).first()).toBeVisible();
    await page.getByLabel(`Aumentar quantidade de ${simpleProduct.product}`).click();
    await expect(page.getByText('1', {exact: true})).toBeVisible();
    await expectCartQuantity(state, simpleProduct, 1);
    await expectManagerReflectsCart(page, simpleProduct.product);

    await page.goto('/cart');
    await page.getByLabel(`Aumentar quantidade de ${simpleProduct.product}`).click();
    await expectCartQuantity(state, simpleProduct, 2);
    await expect(page.getByText('2 item(ns) no carrinho')).toBeVisible();
    await page.getByLabel(`Diminuir quantidade de ${simpleProduct.product}`).click();
    await expectCartQuantity(state, simpleProduct, 1);
    await expect(page.getByText('1 item(ns) no carrinho')).toBeVisible();
    await page.getByLabel(`Diminuir quantidade de ${simpleProduct.product}`).click();
    await expectCartQuantity(state, simpleProduct, 0);
    await expect(page.getByText('Carrinho vazio')).toBeVisible();

    await page.goto('/shop/product/202');
    await expect(page.getByText(customProduct.product, {exact: true}).first()).toBeVisible();
    await openCustomization(page, customProduct);
    await page.getByLabel(`Selecionar ${addonProduct.product}`).click();
    await page.getByLabel(`Aumentar quantidade de ${customProduct.product}`).click();
    await page
      .getByRole('button', {name: `ADICIONAR ${customProduct.product}`})
      .click();
    await expectCartQuantity(state, customProduct, 2);
    await expect(page).toHaveURL(/\/cart/);
    await expectVisibleText(page, customProduct.product);
    await expect(page.getByText(/Complementos smoke/)).toBeVisible();
    await expectManagerReflectsCart(page, customProduct.product);

    await page.goto('/cart');
    await page.getByLabel(`Diminuir quantidade de ${customProduct.product}`).click();
    await expectCartQuantity(state, customProduct, 1);
    await page.getByLabel(`Diminuir quantidade de ${customProduct.product}`).click();
    await expectCartQuantity(state, customProduct, 0);
    await expect(page.getByText('Carrinho vazio')).toBeVisible();

    await page.goto('/shop/product/101');
    await page.getByLabel(`Aumentar quantidade de ${simpleProduct.product}`).click();
    await expectCartQuantity(state, simpleProduct, 1);
    await page.goto('/shop/product/202');
    await openCustomization(page, customProduct);
    await page.getByLabel(`Selecionar ${addonProduct.product}`).click();
    await page
      .getByRole('button', {name: `ADICIONAR ${customProduct.product}`})
      .click();
    await expectCartQuantity(state, customProduct, 1);
    await expect(page.getByText('2 item(ns) no carrinho')).toBeVisible();

    await page.getByText('Finalizar e pagar').click();
    await expect(page.getByText('Pedido #72651')).toBeVisible();
    await page.getByPlaceholder('Apelido do endereco').fill('Casa smoke');
    await page.getByPlaceholder('CEP').fill('01001000');
    await page.getByPlaceholder('Numero').fill('123');
    await page.getByPlaceholder('Rua').fill('Rua Smoke');
    await page.getByPlaceholder('Complemento').fill('Apto 1');
    await page.getByPlaceholder('Bairro').fill('Centro');
    await page.getByPlaceholder('Cidade').fill('Sao Paulo');
    await page.getByPlaceholder('UF').fill('SP');
    await page.getByPlaceholder('Pais').fill('BR');
    await page.getByText('Salvar endereco').click();
    await expect
      .poll(() => state.addresses.some(address => address.nickname === 'Casa smoke'))
      .toBe(true);
    await expect(page.getByText('Endereco de entrega salvo no pedido.')).toBeVisible();

    const savedAddress = state.addresses[0];
    await browserApi(page, `addresses/${savedAddress.id}`, {
      method: 'PUT',
      body: {...savedAddress, nickname: 'Casa smoke editada'},
    });
    expect(state.addresses[0]?.nickname).toBe('Casa smoke editada');
    await expect(page.getByRole('button', {name: 'Gerar Pix'})).toBeEnabled();

    await page.getByRole('button', {name: 'Gerar Pix'}).click();
    await expect(page.getByText('Pix gerado')).toBeVisible();
    await expect(page.getByText('Pagar com cartao')).toBeVisible();
    await page.getByRole('button', {name: 'Pagar com cartao'}).click();
    await expect
      .poll(() => state.payments.some(item => item.startsWith('card:')))
      .toBe(true);
    await page.getByRole('button', {name: 'Cobrar na entrega'}).last().click();
    await expect(page.getByText('Dinheiro na entrega')).toBeVisible();
    await page.getByPlaceholder('Troco para quanto?').fill('10000');
    await page.getByText('Confirmar').click();
    await page.waitForURL(url => url.pathname === '/orders/my/id/72651');
    await browserApi(page, `addresses/${savedAddress.id}`, {method: 'DELETE'});
    expect(state.addresses).toHaveLength(0);

    await expectVisibleText(page, simpleProduct.product);
    await expectVisibleText(page, customProduct.product);
    expect(state.payments.some(item => item.startsWith('pix:'))).toBe(true);
    expect(state.payments.some(item => item.startsWith('card:'))).toBe(true);
    expect(
      state.requests.filter(item => item === 'POST orders/72651/confirm'),
    ).toHaveLength(1);
    expect(state.requests.filter(item => item.startsWith('pageerror:'))).toEqual([]);
  });
});
