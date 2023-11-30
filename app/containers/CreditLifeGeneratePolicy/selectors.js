import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the creditLifeGeneratePolicy state domain
 */

const selectCreditLifeGeneratePolicyDomain = state =>
  state.creditLifeGeneratePolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by CreditLifeGeneratePolicy
 */

const makeSelectCreditLifeGeneratePolicy = () =>
  createSelector(
    selectCreditLifeGeneratePolicyDomain,
    substate => substate
  );

export default makeSelectCreditLifeGeneratePolicy;
export { selectCreditLifeGeneratePolicyDomain };
