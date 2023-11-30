/**
 *
 * Asynchronously loads the component for WalletSoa
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
