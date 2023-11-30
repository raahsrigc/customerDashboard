import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the domesticDanaPolicy state domain
 */

const selectDomesticDanaPolicyDomain = state =>
  state.domesticDanaPolicy || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DomesticDanaPolicy
 */

const makeSelectDomesticDanaPolicy = () =>
  createSelector(
    selectDomesticDanaPolicyDomain,
    substate => substate
  );

export default makeSelectDomesticDanaPolicy;
export { selectDomesticDanaPolicyDomain };
