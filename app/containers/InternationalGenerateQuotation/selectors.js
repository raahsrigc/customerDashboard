import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the internationalGenerateQuotation state domain
 */

const selectInternationalGenerateQuotationDomain = state =>
  state.internationalGenerateQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by InternationalGenerateQuotation
 */

const makeSelectInternationalGenerateQuotation = () =>
  createSelector(
    selectInternationalGenerateQuotationDomain,
    substate => substate
  );

export default makeSelectInternationalGenerateQuotation;
export { selectInternationalGenerateQuotationDomain };
