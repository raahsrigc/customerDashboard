/**
 *
 * Asynchronously loads the component for DanaQuotation
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
