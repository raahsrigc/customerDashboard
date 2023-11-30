import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the deviceClaim state domain
 */

const selectDeviceClaimDomain = state => state.deviceClaim || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DeviceClaim
 */

const makeSelectDeviceClaim = () =>
  createSelector(
    selectDeviceClaimDomain,
    substate => substate
  );

export default makeSelectDeviceClaim;
export { selectDeviceClaimDomain };
