/**
 *
 * Asynchronously loads the component for Quotation
 *
 */

import loadable from "utils/loadable";

export default loadable(() => import("./index"));
