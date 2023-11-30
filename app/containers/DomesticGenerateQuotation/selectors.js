import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the domesticGenerateQuotation state domain
 */

const selectDomesticGenerateQuotationDomain = state =>
  state.domesticGenerateQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DomesticGenerateQuotation
 */

const makeSelectDomesticGenerateQuotation = () =>
  createSelector(
    selectDomesticGenerateQuotationDomain,
    substate => substate
  );

export default makeSelectDomesticGenerateQuotation;
export { selectDomesticGenerateQuotationDomain };
