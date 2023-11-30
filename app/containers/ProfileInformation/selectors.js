import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the profileInformation state domain
 */

const selectProfileInformationDomain = state =>
  state.profileInformation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by ProfileInformation
 */

const makeSelectProfileInformation = () =>
  createSelector(
    selectProfileInformationDomain,
    substate => substate
  );

export default makeSelectProfileInformation;
export { selectProfileInformationDomain };
