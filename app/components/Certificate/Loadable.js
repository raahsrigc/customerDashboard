/**
 *
 * Asynchronously loads the component for Certificate
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
