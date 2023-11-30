/**
 *
 * AccessDenied
 *
 */

 import React, { memo } from "react";
 import { Link } from 'react-router-dom';
 import "./style.scss";
 
 function AccessDenied({ userData }) {
   return (
     <div className="access-denied">
       <div className="access-denied-inner">
         <h1>403</h1>
         <h2>Access Denied</h2>
         <p>You don't have permission to access the requested page!</p>
         {userData && userData.servicesSubscribed && userData.servicesSubscribed.map((item, index) => {
           return (
             <>
               {item.SERVICE_NAME === "AUTO_INSURANCE" && item.STATUS === 1 ?
                 <Link to="/staging/insurance/auto-insurance">Go Back</Link>
                 : item.SERVICE_NAME === "HEALTH_INSURANCE" && item.STATUS === 1 ?
                   <Link to="/staging/insurance/health-insurance">Go Back</Link>
                   : (item.SERVICE_NAME === "CREDIT_LIFE_INSURANCE" && item.STATUS === 1) || item.SERVICE_NAME === "ALL_ACCESS" ?
                     <Link to="/staging/insurance/credit-life-insurance">Go Back</Link>
                     :
                     <></>
               }
             </>
           )
         })}
       </div>
     </div>
   );
 }
 
 AccessDenied.propTypes = {};
 
 export default memo(AccessDenied); 