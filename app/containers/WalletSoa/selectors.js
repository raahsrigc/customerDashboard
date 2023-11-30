import { createSelector } from "reselect";
import { initialState } from "./reducer";

/**
 * Direct selector to the walletSoa state domain
 */

const selectWalletSoaDomain = state => state.walletSoa || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by WalletSoa
 */

const makeSelectWalletSoa = () =>
  createSelector(
    selectWalletSoaDomain,
    substate => substate
  );

export default makeSelectWalletSoa;
export { selectWalletSoaDomain };
