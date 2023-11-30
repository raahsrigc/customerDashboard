import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the claim state domain
 */

const selectClaimDomain = state => state.claim || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Claim
 */

const makeSelectClaim = () =>
  createSelector(
    selectClaimDomain,
    substate => substate
  );

export default makeSelectClaim;
export { selectClaimDomain };
