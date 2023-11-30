import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the quotation state domain
 */

const selectQuotationDomain = state => state.quotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Quotation
 */

const makeSelectQuotation = () =>
  createSelector(
    selectQuotationDomain,
    substate => substate
  );

export default makeSelectQuotation;
export { selectQuotationDomain };
