import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the personalAccidentClaim state domain
 */

const selectPersonalAccidentClaimDomain = state =>
  state.personalAccidentClaim || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by PersonalAccidentClaim
 */

const makeSelectPersonalAccidentClaim = () =>
  createSelector(
    selectPersonalAccidentClaimDomain,
    substate => substate
  );

export default makeSelectPersonalAccidentClaim;
export { selectPersonalAccidentClaimDomain };
