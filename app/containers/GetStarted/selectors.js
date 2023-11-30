import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the getStarted state domain
 */

const selectGetStartedDomain = state => state.getStarted || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by GetStarted
 */

const makeSelectGetStarted = () =>
  createSelector(
    selectGetStartedDomain,
    substate => substate
  );

export default makeSelectGetStarted;
export { selectGetStartedDomain };
