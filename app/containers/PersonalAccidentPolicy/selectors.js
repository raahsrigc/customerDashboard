import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the personalAccidentPolicy state domain
 */

const selectPersonalAccidentPolicyDomain = state =>
  state.personalAccidentPolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by PersonalAccidentPolicy
 */

const makeSelectPersonalAccidentPolicy = () =>
  createSelector(
    selectPersonalAccidentPolicyDomain,
    substate => substate
  );

export default makeSelectPersonalAccidentPolicy;
export { selectPersonalAccidentPolicyDomain };
