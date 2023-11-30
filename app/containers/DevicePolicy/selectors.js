import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the devicePolicy state domain
 */

const selectDevicePolicyDomain = state => state.devicePolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DevicePolicy
 */

const makeSelectDevicePolicy = () =>
  createSelector(
    selectDevicePolicyDomain,
    substate => substate
  );

export default makeSelectDevicePolicy;
export { selectDevicePolicyDomain };
