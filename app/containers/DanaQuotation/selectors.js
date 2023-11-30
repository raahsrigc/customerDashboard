import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the danaQuotation state domain
 */

const selectDanaQuotationDomain = state => state.danaQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by DanaQuotation
 */

const makeSelectDanaQuotation = () =>
  createSelector(
    selectDanaQuotationDomain,
    substate => substate
  );

export default makeSelectDanaQuotation;
export { selectDanaQuotationDomain };
