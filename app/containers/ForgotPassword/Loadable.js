/**
 *
 * Asynchronously loads the component for ForgotPassword
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
