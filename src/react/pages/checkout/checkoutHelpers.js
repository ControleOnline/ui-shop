import {
  detectPaymentOptionKind,
  getInvoiceDestinationWalletId,
  getPaymentOptionId,
  getPaymentOptionLabel,
  getPaymentOptionWalletId,
} from '@controleonline/ui-common/src/react/utils/paymentOptions';
import {normalizeEntityId} from '@controleonline/ui-common/src/react/utils/commercialDocumentOrders';


export const SHOP_COLLECTION_ITEMS_PER_PAGE = 50;

export const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.member)) return response.member;
  if (Array.isArray(response?.['hydra:member'])) {
    return response['hydra:member'];
  }
  return [];
};

export const normalizeText = value =>
  String(value || '')
    .trim()
    .toLowerCase();

export const normalizeActionResult = response => {
  if (Array.isArray(response?.member)) {
    return response.member[0] || null;
  }

  if (Array.isArray(response?.['hydra:member'])) {
    return response['hydra:member'][0] || null;
  }

  if (response?.result && typeof response.result === 'object') {
    return response.result;
  }

  if (response?.data && typeof response.data === 'object') {
    return response.data;
  }

  return response || null;
};

export const extractQuotePayload = response => {
  const result = normalizeActionResult(response);
  const data =
    result?.data && typeof result.data === 'object' ? result.data : result;
  return data || {};
};

export const extractQuotesFromResponse = response => {
  const data = extractQuotePayload(response);
  return Array.isArray(data?.quotes) ? data.quotes : [];
};

export const getQuotePrice = quote => {
  const price = Number(quote?.price);
  return Number.isFinite(price) ? price : 0;
};

export const hasQuotePrice = quote =>
  quote?.price !== null &&
  quote?.price !== undefined &&
  quote?.price !== '' &&
  Number.isFinite(Number(quote.price));

export const isSelectableDeliveryQuote = quote =>
  quote?.available !== false && hasQuotePrice(quote);

export const formatApiError = error => {
  if (!error) {
    return 'Não foi possível concluir a solicitação.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return (
    error?.message ||
    error?.errmsg ||
    error?.data?.message ||
    'Não foi possível concluir a solicitação.'
  );
};

export const parseInvoiceOtherInformations = value => {
  if (!value) {
    return {};
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof value === 'object' ? value : {};
};

export const pickPendingStatus = statuses => {
  const all = Array.isArray(statuses) ? statuses : [];
  return (
    all.find(item => {
      const real = normalizeText(item?.realStatus);
      const label = normalizeText(item?.status);
      return (
        real === 'pending' &&
        (label.includes('waiting') || label.includes('aguard'))
      );
    }) ||
    all.find(item => normalizeText(item?.realStatus) === 'pending') ||
    all.find(item => normalizeText(item?.context) === 'invoice') ||
    null
  );
};

export const sortInvoicesByDateDesc = invoices =>
  [...(Array.isArray(invoices) ? invoices : [])].sort((a, b) => {
    const aDate = new Date(a?.dueDate || a?.invoice_date || 0).getTime();
    const bDate = new Date(b?.dueDate || b?.invoice_date || 0).getTime();
    return bDate - aDate;
  });

export const getInvoiceStatusKeys = invoice => ({
  realStatus: normalizeText(
    invoice?.status?.realStatus || invoice?.status?.real_status,
  ),
  status: normalizeText(invoice?.status?.status),
});

export const isCanceledInvoice = invoice => {
  const {realStatus, status} = getInvoiceStatusKeys(invoice);
  return (
    ['canceled', 'cancelled'].includes(realStatus) ||
    ['canceled', 'cancelled'].includes(status)
  );
};

export const isPaidInvoice = invoice => {
  const {realStatus, status} = getInvoiceStatusKeys(invoice);
  return realStatus === 'closed' || ['closed', 'paid'].includes(status);
};

export const matchesDeliveryMetadata = (invoice, metadata) => {
  if (!metadata) {
    return true;
  }

  const otherInformations = parseInvoiceOtherInformations(
    invoice?.otherInformations,
  );
  const hasTargetDevice = normalizeEntityId(metadata?.targetDeviceId) !== '';

  return (
    normalizeText(otherInformations?.channel) ===
      normalizeText(metadata.channel) &&
    normalizeText(otherInformations?.paymentMode) ===
      normalizeText(metadata.paymentMode) &&
    (!hasTargetDevice ||
      normalizeEntityId(otherInformations?.targetDeviceId) ===
        normalizeEntityId(metadata.targetDeviceId)) &&
    Number(otherInformations?.changeFor || 0) ===
      Number(metadata.changeFor || 0)
  );
};

export const findReusableInvoiceForPaymentType = (
  invoices,
  selectedPaymentType,
  {deliveryMetadata = null} = {},
) => {
  const paymentTypeId = getPaymentOptionId(selectedPaymentType);
  const walletId = getPaymentOptionWalletId(selectedPaymentType);

  if (!paymentTypeId) {
    return null;
  }

  return (
    sortInvoicesByDateDesc(invoices).find(invoice => {
      if (isCanceledInvoice(invoice) || isPaidInvoice(invoice)) {
        return false;
      }

      if (getPaymentOptionId(invoice) !== paymentTypeId) {
        return false;
      }

      if (walletId && getInvoiceDestinationWalletId(invoice) !== walletId) {
        return false;
      }

      return matchesDeliveryMetadata(invoice, deliveryMetadata);
    }) || null
  );
};

export const buildDeliveryPaymentLabel = payment => {
  const kind = detectPaymentOptionKind(payment);
  const label = getPaymentOptionLabel(payment);

  if (kind === 'pix') {
    return 'Pix na entrega';
  }

  if (kind === 'card') {
    return `${label} na entrega`;
  }

  return `${label} na entrega`;
};

export const getActionResult = response =>
  response?.result && typeof response.result === 'object'
    ? response.result
    : response;

