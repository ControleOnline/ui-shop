const {
  SHOP_PREPAID_READY_FLOW,
  SHOP_PREPAID_READY_STEPS,
  buildFlowchartLinks,
  createEmptyEvidence,
  recordStep,
} = require('../../browser/manager/shopPrepaidReadyManifest');

describe('shop prepaid ready smoke manifest', () => {
  test('declares flowchart 1 and compra-fluxo', () => {
    expect(SHOP_PREPAID_READY_FLOW.fluxo).toBe('compra-fluxo');
    expect(SHOP_PREPAID_READY_FLOW.flowchartIds).toEqual([1]);
    expect(SHOP_PREPAID_READY_FLOW.flowKey).toBe('sales-production');
    expect(buildFlowchartLinks()).toEqual([
      'https://admin.controleonline.com/admin/flowcharts/1',
    ]);
  });

  test('records shop checkout conference and ready prints', () => {
    let evidence = createEmptyEvidence();
    SHOP_PREPAID_READY_STEPS.forEach(step => {
      evidence = recordStep(evidence, step, `prints/${step}.png`);
    });
    expect(evidence.steps).toEqual(SHOP_PREPAID_READY_STEPS);
    expect(evidence.prints.map(item => item.step)).toEqual([
      'shop-catalog',
      'shop-cart',
      'shop-checkout-prepaid',
      'pcp-conference',
      'ready',
    ]);
  });
});
