const path = require('path');
const fs = require('fs');

const SHOP_PREPAID_READY_FLOW = {
  fluxo: 'compra-fluxo',
  flowchartIds: [1],
  flowchartLinks: ['https://admin.controleonline.com/admin/flowcharts/1'],
  flowKey: 'sales-production',
  suite: 'shop-prepaid-ready',
  parentIssue: 'ControleOnline/app-community#611',
  reuses: 'ControleOnline/app-community#302',
};

const SHOP_PREPAID_READY_STEPS = [
  'shop-catalog',
  'shop-cart',
  'shop-checkout-prepaid',
  'pcp-conference',
  'ready',
];

const buildFlowchartLinks = (ids = SHOP_PREPAID_READY_FLOW.flowchartIds) =>
  ids.map(id => `https://admin.controleonline.com/admin/flowcharts/${id}`);

const createEmptyEvidence = () => ({
  ...SHOP_PREPAID_READY_FLOW,
  flowchartLinks: buildFlowchartLinks(),
  steps: [],
  prints: [],
});

const recordStep = (evidence, stepId, printPath) => {
  const next = {
    ...evidence,
    steps: [...(evidence.steps || []), stepId],
    prints: [...(evidence.prints || []), {step: stepId, path: printPath}],
  };
  return next;
};

const evidenceDir = () =>
  path.join(process.cwd(), 'test-results', 'shop-prepaid-ready');

const writeEvidenceManifest = (evidence, dir = evidenceDir()) => {
  fs.mkdirSync(dir, {recursive: true});
  const payload = {
    ...SHOP_PREPAID_READY_FLOW,
    flowchartLinks: evidence.flowchartLinks || buildFlowchartLinks(),
    steps: evidence.steps || [],
    prints: evidence.prints || [],
    result: 'ready',
    generatedAt: new Date().toISOString(),
  };
  const filePath = path.join(dir, 'manifest.json');
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
};

const captureStepPrint = async (page, testInfo, evidence, stepId) => {
  const dir = evidenceDir();
  fs.mkdirSync(dir, {recursive: true});
  const fileName = `${stepId}.png`;
  const filePath = path.join(dir, fileName);
  await page.screenshot({path: filePath, fullPage: true});
  if (testInfo?.attach) {
    await testInfo.attach(stepId, {path: filePath, contentType: 'image/png'});
  }
  return recordStep(evidence, stepId, `test-results/shop-prepaid-ready/${fileName}`);
};

module.exports = {
  SHOP_PREPAID_READY_FLOW,
  SHOP_PREPAID_READY_STEPS,
  buildFlowchartLinks,
  captureStepPrint,
  createEmptyEvidence,
  evidenceDir,
  recordStep,
  writeEvidenceManifest,
};
