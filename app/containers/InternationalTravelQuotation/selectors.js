import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the internationalTravelQuotation state domain
 */

const selectInternationalTravelQuotationDomain = state =>
  state.internationalTravelQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by InternationalTravelQuotation
 */

const makeSelectInternationalTravelQuotation = () =>
  createSelector(
    selectInternationalTravelQuotationDomain,
    substate => substate
  );

export default makeSelectInternationalTravelQuotation;
export { selectInternationalTravelQuotationDomain };
