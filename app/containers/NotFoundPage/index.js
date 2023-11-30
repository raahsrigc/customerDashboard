/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import "./style.scss";

export default function NotFound() {
  return (
    // <section className="main-section">
    //   {/* <SideBar /> */}
    //   <div className="sidebar-tab-content">
        <div className="not-found">
          <h1><FormattedMessage {...messages.header} /></h1>
        </div>
    //   </div>
    // </section>
  );
}
