import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the creditLifeClaim state domain
 */

const selectCreditLifeClaimDomain = state =>
  state.creditLifeClaim || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by CreditLifeClaim
 */

const makeSelectCreditLifeClaim = () =>
  createSelector(
    selectCreditLifeClaimDomain,
    substate => substate
  );

export default makeSelectCreditLifeClaim;
export { selectCreditLifeClaimDomain };
