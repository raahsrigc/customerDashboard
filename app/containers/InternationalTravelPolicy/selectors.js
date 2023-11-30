import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the internationalTravelPolicy state domain
 */

const selectInternationalTravelPolicyDomain = state =>
  state.internationalTravelPolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by InternationalTravelPolicy
 */

const makeSelectInternationalTravelPolicy = () =>
  createSelector(
    selectInternationalTravelPolicyDomain,
    substate => substate
  );

export default makeSelectInternationalTravelPolicy;
export { selectInternationalTravelPolicyDomain };
