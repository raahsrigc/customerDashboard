/**
 *
 * Asynchronously loads the component for GetStarted
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
