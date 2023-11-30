import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the deviceBuyPolicy state domain
 */

const selectDeviceBuyPolicyDomain = state =>
  state.deviceBuyPolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DeviceBuyPolicy
 */

const makeSelectDeviceBuyPolicy = () =>
  createSelector(
    selectDeviceBuyPolicyDomain,
    substate => substate
  );

export default makeSelectDeviceBuyPolicy;
export { selectDeviceBuyPolicyDomain };
