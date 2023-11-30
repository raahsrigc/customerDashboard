/**
 *
 * Asynchronously loads the component for EmailVerify
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
