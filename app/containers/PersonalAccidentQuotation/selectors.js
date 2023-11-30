import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the personalAccidentQuotation state domain
 */

const selectPersonalAccidentQuotationDomain = state =>
  state.personalAccidentQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by PersonalAccidentQuotation
 */

const makeSelectPersonalAccidentQuotation = () =>
  createSelector(
    selectPersonalAccidentQuotationDomain,
    substate => substate
  );

export default makeSelectPersonalAccidentQuotation;
export { selectPersonalAccidentQuotationDomain };
