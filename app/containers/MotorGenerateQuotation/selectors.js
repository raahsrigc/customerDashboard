import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the motorGenerateQuotation state domain
 */

const selectMotorGenerateQuotationDomain = state =>
  state.motorGenerateQuotation || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by MotorGenerateQuotation
 */

const makeSelectMotorGenerateQuotation = () =>
  createSelector(
    selectMotorGenerateQuotationDomain,
    substate => substate
  );

export default makeSelectMotorGenerateQuotation;
export { selectMotorGenerateQuotationDomain };
