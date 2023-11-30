import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the emailVerify state domain
 */

const selectEmailVerifyDomain = state => state.emailVerify || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by EmailVerify
 */

const makeSelectEmailVerify = () =>
  createSelector(
    selectEmailVerifyDomain,
    substate => substate
  );

export default makeSelectEmailVerify;
export { selectEmailVerifyDomain };
