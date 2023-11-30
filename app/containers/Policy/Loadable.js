/**
 *
 * Asynchronously loads the component for Policy
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
