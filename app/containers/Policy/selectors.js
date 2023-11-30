import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the policy state domain
 */

const selectPolicyDomain = state => state.policy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Policy
 */

const makeSelectPolicy = () =>
  createSelector(
    selectPolicyDomain,
    substate => substate
  );

export default makeSelectPolicy;
export { selectPolicyDomain };
