import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the danaPolicy state domain
 */

const selectDanaPolicyDomain = state => state.danaPolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DanaPolicy
 */

const makeSelectDanaPolicy = () =>
  createSelector(
    selectDanaPolicyDomain,
    substate => substate
  );

export default makeSelectDanaPolicy;
export { selectDanaPolicyDomain };
