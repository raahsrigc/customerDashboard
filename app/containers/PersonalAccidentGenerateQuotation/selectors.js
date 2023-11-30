import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the personalAccidentGenerateQuotation state domain
 */

const selectPersonalAccidentGenerateQuotationDomain = state =>
  state.personalAccidentGenerateQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by PersonalAccidentGenerateQuotation
 */

const makeSelectPersonalAccidentGenerateQuotation = () =>
  createSelector(
    selectPersonalAccidentGenerateQuotationDomain,
    substate => substate
  );

export default makeSelectPersonalAccidentGenerateQuotation;
export { selectPersonalAccidentGenerateQuotationDomain };
