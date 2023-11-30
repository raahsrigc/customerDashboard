import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the deviceQuotation state domain
 */

const selectDeviceQuotationDomain = state =>
  state.deviceQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DeviceQuotation
 */

const makeSelectDeviceQuotation = () =>
  createSelector(
    selectDeviceQuotationDomain,
    substate => substate
  );

export default makeSelectDeviceQuotation;
export { selectDeviceQuotationDomain };
