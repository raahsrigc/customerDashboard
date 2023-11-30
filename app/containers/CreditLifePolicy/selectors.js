import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the creditLifePolicy state domain
 */

const selectCreditLifePolicyDomain = state =>
  state.creditLifePolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by CreditLifePolicy
 */

const makeSelectCreditLifePolicy = () =>
  createSelector(
    selectCreditLifePolicyDomain,
    substate => substate
  );

export default makeSelectCreditLifePolicy;
export { selectCreditLifePolicyDomain };
