import useCheckoutPaymentState from './useCheckoutPaymentState';
import useCheckoutPaymentActions from './useCheckoutPaymentActions';

/**
 * Orchestrates payment-derived values and payment action handlers.
 * Accepts the core checkout state (from useCheckoutState) and returns
 * a merged object with all payment-related state and handlers.
 */
export default function useCheckoutPayments(core) {
  const paymentState = useCheckoutPaymentState(core);
  const merged = {...core, ...paymentState};
  const actions = useCheckoutPaymentActions(merged);
  return {...core, ...paymentState, ...actions};
}
