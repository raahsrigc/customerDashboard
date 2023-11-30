import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the sessionExpired state domain
 */

const selectSessionExpiredDomain = state =>
  state.sessionExpired || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by SessionExpired
 */

const makeSelectSessionExpired = () =>
  createSelector(
    selectSessionExpiredDomain,
    substate => substate
  );

export default makeSelectSessionExpired;
export { selectSessionExpiredDomain };
