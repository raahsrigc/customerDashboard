import { get, post, encrtypedPost } from './APIService';
import moment from "moment";

// UAT server
const BASE_URL_UAT = "https://valaria.globalcognito.com";

// Prod server
const BASE_URL_LIVE = "https://valaria.globalcognito.com";

/* login Api */
export const loginData = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/login`;
    return post(url, data.payload);
}

/* signup products */
export const getSignUpProductsApi = () => {
    const url = `${BASE_URL_UAT}/quotationMiddleLayerDev/v1/product/list`;
    const header = {
        SessionId: ""
    }
    return get(url, header);
}

/* signup Api */
export const signupData = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/signUp`;
    return post(url, data.payload);
}

/* forgot password Api */
export const forgotPassword = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/generateAuthCode`;
    return post(url, data.payload);
}
export const forgetPasswordOtp = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/forgetPassword`;
    return post(url, data.payload);
}

/* email Validation Api */
export const emailValidationData = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/emailValidation`;
    return post(url, data.payload);
}

/* logout Api */
export const logout = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/logout`;
    return post(url, data);
}

/* change password Api */
export const changePassword = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/changePassword`;
    const header = {
        SessionId: sessionStorage.getItem("sessionRefNo")
    }
    return post(url, data.payload, header);
}

/* activate Account Api */
export const rcVerifyData = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/rcVerify`;
    return post(url, data.payload);
}
export const activateAccountData = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/accountActivation`;
    const header = {
        SessionId: data?.payload?.token
        // SessionId: sessionStorage.getItem("sessionRefNo")
    }
    return post(url, data.payload, header);
}

/* profile Upload Api */
export const getProfileData = (toggleBtn, data) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/portal/v1/getProfile`;
    const header = {
        SessionId: sessionStorage.getItem("sessionRefNo")
    }
    return post(url, data, header);
}

export const profileUploadData = (data) => {
    const url = `${BASE_URL_UAT}/portal/v1/uploadPic`;
    const header = {
        SessionId: sessionStorage.getItem("sessionRefNo")
    }
    return post(url, data, header);
}

export const getCardsApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/getCards`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}


///// Customer DASHBOARD API ////////

export const countryData = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/cbaKYC/v1/getAllMasterCodesB2BPagination`;
    const data = {
        fromDate: "",
        toDate: "",
        pageCount: 10,
        pageNumber: 1,
        isSearch: false,
        columnName: "",
        value: ""
    }
    const header = {
        token: tokenKey,
        ServiceType: "Country"
    }
    return encrtypedPost(url, data, header);
}

export const stateData = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaGatewayEncrypt/v1/code/fetchList?parent=${data}&childType=State`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const cityData = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaGatewayEncrypt/v1/code/fetchList?parent=${data}&childType=City`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const makeApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getVehicleMake`;
    const data = {
        fromDate: "",
        toDate: "",
        pageCount: 5535,
        pageNumber: 1,
        isSearch: false,
        columnName: "",
        value: ""
    }
    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}

export const modelApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getVehicleModel`;
    const header = {
        token: tokenKey,
        MakeCode: data
    }
    return get(url, header);
}


// generateQuoteMotorApi
export const generateQuoteMotorApi = (tokenKey, data, toggleBtn) => {
    // const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2bDELETE/v1/motor/api/generateQuotation`;
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/generateQuotation`;
    let header = {
        token: tokenKey
    };
    return encrtypedPost(url, data, header);
}
export const planApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/plan`;
    const header = {
        token: tokenKey
    }
    return get(url, header);
}
export const getMotorPlanPremiumApi = (tokenKey, lobId, productId, planId, amount, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/planPremium?lobId=${lobId}&productId=${productId}&planId=${planId}&amount=${amount}`;
    const header = {
        token: tokenKey
    }
    return get(url, header);
}

export const vehicleTypeApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getVehicleType`;
    const header = {
        token: tokenKey
    }
    return get(url, header);
}

export const summaryDataApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/card?businessType=2`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getUnderwritingQuotationsApi = (tokenKey, pageNumber, pageCount, policyLobCode, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getAllQuotations`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        token: tokenKey,
        LOB: policyLobCode
    }

    return encrtypedPost(url, data, header);
}

export const getMotorQuotationByIdApi = (tokenKey, quotationId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/api/quotation/id?quotationId=${quotationId}`;
    const header = {
        SessionId: tokenKey,
    }
    return get(url, header);
}

export const generatePolicyApi = (tokenKey, data, toggleBtn) => {
    // const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2bDELETE/v1/motor/api/dashboard/generatePolicy`;
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/dashboard/generatePolicy`;
    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}

export const getMotorQuotationInsuredDetailsApi = (tokenKey, quotationId, toggleBtn) => {
    // const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2bDELETE/v1/motor/api/insuredDetails?quotationId=${quotationId}`;
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/insuredDetails?quotationId=${quotationId}`;
    const header = {
        token: tokenKey,
    }
    return get(url, header);
}


export const getUnderwritingPolicyApi = (tokenKey, pageNumber, pageCount, policyLobCode, colName, colValue, isSearch, BusinessType, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/all-policy`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colValue ? colValue?.toLowerCase() == "approved" ? 1 : colValue?.toString()?.toLowerCase() == "pending" ? 0 : colValue?.toString()?.toLowerCase() == "rejected" ? 2 : colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue?.replaceAll(",", "") : ""
    }
    const header = {
        SessionId: tokenKey,
        lobCode: policyLobCode,
        businessType: BusinessType
    }
    return encrtypedPost(url, data, header);
}

export const getUnderwritingPendingPolicyApi = (tokenKey, pageNumber, pageCount, policyLobCode, colName, colValue, isSearch, BusinessType, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/pending-for-approval`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        SessionId: tokenKey,
        lobCode: policyLobCode,
        businessType: BusinessType
    }
    return encrtypedPost(url, data, header);
}

export const getUnderwritingApprovedPolicyApi = (tokenKey, pageNumber, pageCount, policyLobCode, colName, colValue, isSearch, BusinessType, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/approved-policy`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        SessionId: tokenKey,
        lobCode: policyLobCode,
        businessType: BusinessType
    }
    return encrtypedPost(url, data, header);
}

export const getUnderwritingRenewalPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/renewalList?fromDate=&toDate=&pageCount=${pageCount ? pageCount : 10}&pageNumber=${pageNumber ? pageNumber : 1}&searchKey=${isSearch}`;
    const header = {
        token: tokenKey,
        columnName: colName ? colName?.replaceAll("!", "") : "",
        columnValue: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : ""
    }
    return get(url, header);
}

export const getPolicyByIdApi = (tokenKey, policyId, businessType, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/api/policy/id?policyId=${policyId}`;
    const header = {
        SessionId: tokenKey,
    }
    return get(url, header);
}

export const getKYCDataApi = (tokenKey, email, mobile, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/cbaKYC/v1/checkB2BKYC`;
    const header = {
        token: tokenKey,
        Email: email,
        MobileNumber: mobile
    }
    return get(url, header);
}

export const updateKYCDetailsApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/cbaKYC/v1/updateB2BInsuredCustomerDetails`;
    const header = {
        token: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const updateNIIDKYCDetailsApi = (tokenKey, data, toggleBtn) => {
    // const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2bDELETE/v1/motor/api/updatePolicy`;
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/updatePolicy`;
    const header = {
        token: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const getClaimCardsApi = (tokenKey, claimLobId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getClaimsSummary`;
    const header = {
        token: tokenKey,
        LobId: claimLobId,
    }
    return get(url, header);
}

export const getClaimTableApi = (tokenKey, pageNumber, pageCount, claimLobId, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getAllClaimsForDashboard`;
    const data = {
        fromDate: "",
        toDate: "",
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        isSearch: isSearch,
        lobId: claimLobId,
        columnName: colName ? colName?.replaceAll("!", "") : "",
        value: colValue ? colValue?.toLowerCase() == "approved" ? 1 : colValue?.toLowerCase() == "reopened" ? 4 : colValue?.toLowerCase() == "pending" ? 5 : colValue?.toLowerCase() == "rejected" ? 2 : colValue?.toLowerCase() == "closed" ? 7 : colValue?.toLowerCase() == "approve cancellation" ? 39 : colValue?.toLowerCase() == "reject cancellation" ? 40 : colValue?.toLowerCase() == "hold cancellation" ? 41 : colValue?.toLowerCase() == "cancelled" ? 42 : colValue?.toLowerCase() == "bank details pending" ? 45 : colValue?.toLowerCase() == "settled" ? 6 : colValue?.toLowerCase() == "update settlement" ? 46 : colValue?.toLowerCase() == "Discharge Voucher Rejected" ? 47 : colValue?.toLowerCase() == "failed" ? 43 : colValue?.toLowerCase() == "settlement in progress" ? 55 : colValue?.toLowerCase() == "pending for ri approval" ? 58 : colValue?.toLowerCase() == "pending from internal control" ? 59 : colValue?.toLowerCase() == "rejected from internal control" ? 60 : colValue?.toLowerCase() == "pending with finance" ? 67 : colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue?.replaceAll(",", "") : ""
    }

    const header = {
        token: tokenKey,
    }

    return encrtypedPost(url, data, header);
}

export const getAllRegisteredClaimsApi = (tokenKey, pageNumber, pageCount, claimLobId, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getAllPendingClaims`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        lobId: claimLobId,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }

    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}

export const getAllApprovedClaimsApi = (tokenKey, pageNumber, pageCount, claimLobId, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getAllApprovedClaims`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        lobId: claimLobId,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }

    const header = {
        token: tokenKey,
    }

    return encrtypedPost(url, data, header);
}

export const getAllSettledClaimsApi = (tokenKey, pageNumber, pageCount, claimLobId, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getAllSettledClaims`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        lobId: claimLobId,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }

    const header = {
        token: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const getClaimByIdApi = (tokenKey, claimID, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/api/claim/id?claimId=${claimID}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}


export const walletSummaryDataApi = (tokenKey, toggleBtn, type) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/getWalletSOABalanceStatement`;
    const header = {
        SessionId: tokenKey,
        type: type ? type : ""
    }
    return get(url, header);
}

export const getWalletSoaApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getWalletSOAForDashboard`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        token: tokenKey,
    }

    return encrtypedPost(url, data, header);
}

export const getWalletSoaAllProductApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn, productId, danaSoa) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/b2btran/v1/getWalletSOAForProducts`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
        productId: productId == "Device Insurance" ? 1 : productId == "Motor Insurance" ? 26 : productId == "International Travel Insurance" ? 112 : productId == "Domestic Travel Insurance" ? 116 : productId == "Personal Accident Individual Insurance" ? 12 : productId == "Dana Air Travel Insurance" && danaSoa == "life" ? 0 : productId == "Dana Air Travel Insurance" && danaSoa == "travel" ? 10003 : ""
    }
    const header = {
        token: tokenKey,
    }


    return encrtypedPost(url, data, header);
}


export const getPolicyHistoryApi = (tokenKey, policyId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaGatewayEncrypt/v1/getHistory?policyId=${policyId}`;
    const header = {
        SessionId: tokenKey,
    }
    return get(url, header);
}

export const getCommentsApi = (tokenKey, objectId, recordId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaGatewayEncrypt/v1/comments/getComments`;
    const data = {
        objectId: objectId,
        recordId: recordId
    }
    const header = {
        SessionId: tokenKey,
    }
    return encrtypedPost(url, data, header);
}

export const insertCommentApi = (tokenKey, comment, id, objectId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaGatewayEncrypt/v1/comments/insert`;
    const data = {
        comment: comment,
        id: id,
        objectId: objectId
    }
    const header = {
        SessionId: tokenKey,
    }

    return encrtypedPost(url, data, header);
}

export const getClaimHistoryApi = (tokenKey, claimId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaGatewayEncrypt/v1/getHistory?claimId=${claimId}`;
    const header = {
        SessionId: tokenKey,
    }
    return get(url, header);
}



/////// DANA Dashboard ///////

export const domesticPackagesApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/packages`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const domesticDestinationApi = (tokenKey, id, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/motor/api/city?serviceType=city`;
    const header = {
        token: tokenKey
    }
    return get(url, header);
}

export const domesticGenerateQuotationApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/generate-quote`;
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const danaSummaryDataApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/dashboardB2B/summary`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getAllDanaQuotationApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/quotation-list`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}
export const getAllDanaQuotationByIdApi = (tokenKey, id, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/quotation/byId?id=${id}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getAllDanaPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/dashboardB2B/all-policy-list`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const getAllDanaPolicyByIdApi = (tokenKey, id, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/dashboardB2B/byId?id=${id}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getAllDanaBuyPolicyApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/domestic/generate-policy`;
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}

/////// international Travel Dashboard ///////

export const internationalNationalityApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/nationality`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const internationalPackagesApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/packages`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const internationalDestinationApi = (tokenKey, id, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/destination?id=` + `${id}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const internationalGenerateQuotationApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/saveInsuredDetails`;
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}


export const internationalSummaryDataApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/quotation-summary`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getAllInternationalQuotationApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/pendingQuotation`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}
export const getAllInternationalQuotationByIdApi = (tokenKey, id, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/quotation/byId?id=${id}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getAllInternationalPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/policy/all-details`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colValue ? colValue?.toLowerCase() == "approved" ? 1 : colValue?.toString()?.toLowerCase() == "pending" ? 0 : colValue?.toString()?.toLowerCase() == "rejected" ? 2 : colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue?.replaceAll(",", "") : ""
    }

    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const getAllInternationalPolicyByIdApi = (tokenKey, id, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/policy/byId?id=${id}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getAllInternationalBuyPolicyApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/internationalTravel/policy/generate-policy`;
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}



////// Device Dashboard ///////

export const generateQuoteDeviceApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/generateQuotation`;
    let header = {
        token: tokenKey
    };
    return encrtypedPost(url, data, header);
}

export const summaryDataDeviceApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/summaryData`;
    let header = {
        token: tokenKey
    };
    return get(url, header);
}

export const getAllQuotationsDeviceApi = (tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/quotationList`;
    let header = {
        token: tokenKey
    };
    const data = {
        fromDate: startDate ? startDate : startMonthDate,
        toDate: endDate ? endDate : endMonthDate,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        search: isSearch,
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        columnValue: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_FROM" || colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_TO" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    return encrtypedPost(url, data, header);
}

export const getQuotationsByIdDeviceApi = (tokenKey, policyId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/policy?policyId=${policyId}`;
    let header = {
        token: tokenKey
    };
    return get(url, header);
}

export const getBulkByBatchDeviceApi = (tokenKey, batchId, isPolicy, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/batch?batchId=${batchId}`;
    let header = {
        token: tokenKey,
        isPolicy: isPolicy
    };
    return get(url, header);
}

export const savePolicyDeviceApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/generatePolicy`;
    let header = {
        token: tokenKey
    };
    return encrtypedPost(url, data, header);
}

// export const getKycDataDeviceApi = (tokenKey, insuredId, toggleBtn) => {
//     const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/kycDetailById?insuredId=${insuredId}`;
//     let header = {
//         token: tokenKey
//     };
//     return get(url, header);
// }

export const getBuyPolicyKycDataDeviceApi = (tokenKey, insuredId, quotationId, bulkKycId,  toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/getInsureDetails`;
    let header = {
        token: tokenKey,
        insuredId: insuredId,
        quotationId: quotationId,
        bulkKycId: bulkKycId
    };
    return get(url, header);
}

export const deviceBuyPolicyWalletPay = (tokenKey, quotationId, batchNo, amount, isBulk, wallet, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/paymentWallet`;
    let header = {
        token: tokenKey
    };
    const data = {
        quotationId: quotationId,
        batchNo: batchNo,
        amount: Number(amount),
        profileEmail: sessionStorage.getItem("email"),
        // userId: sessionStorage.getItem("email"),
        bulk: isBulk,
        wallet: wallet,
    }
    return encrtypedPost(url, data, header);
}

export const devicePolicyPay = (tokenKey, policyId, quotationId, redirectUrl, isBulk, batchNo, amount, wallet, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/pay`;
    let header = {
        token: tokenKey
    };
    const data = {
        policyId: null,
        quotationId: quotationId,
        redirectUrl: redirectUrl,
        batchNo: batchNo,
        amount: amount,
        profileEmail: sessionStorage.getItem("email"),
        bulk: isBulk,
        userId: sessionStorage.getItem("email"),
        wallet: wallet,
    }
    return encrtypedPost(url, data, header);
}


export const getAllPolicyDeviceApi = (tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/policyList`;
    let header = {
        token: tokenKey
    };
    const data = {
        fromDate: startDate ? startDate : startMonthDate,
        toDate: endDate ? endDate : endMonthDate,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        search: isSearch,
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        columnValue: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_FROM" || colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_TILL" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    return encrtypedPost(url, data, header);
}

// export const verifyDeviceApi = (tokenKey, queryTxRef, queryTransactionId, policyId, queryIsBulk, toggleBtn) => {
//     const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/policy/verify?txnId=${queryTransactionId}&txnRef=${queryTxRef}&policyId=${policyId}`;
//     let header = {
//         token: tokenKey,
//         isBulk: queryIsBulk
//     };
//     return get(url, header);
// }

export const verifyDeviceApi = (tokenKey, queryTxRef, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/verify?tx_ref=${queryTxRef}`;
    let header = {
        token: tokenKey,
    };
    return get(url, header);
}

export const getBulkBuyPolicyDeviceApi = (tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colName, colValue, isSearch, type, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/searchbatchList`;
    let header = {
        token: tokenKey
    };
    const data = {
        fromDate: startDate ? startDate : startMonthDate,
        toDate: endDate ? endDate : endMonthDate,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        search: isSearch,
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        columnValue: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_FROM" || colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_TO" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
        type: type
    }
    return encrtypedPost(url, data, header);
}

export const bulkBuyPolicyDevicePaymentInfoApi = (tokenKey, quotationId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/bulkQuotationById?quotationId=${quotationId}`;
    let header = {
        token: tokenKey,
    };
    return get(url, header);
}


export const devicePaymentKyc = (tokenKey, quotationId, batchNo, amount, isBulk, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/paymentOnline`;
    let header = {
        token: tokenKey
    };
    const data = {
        quotationId: quotationId,
        batchNo: batchNo,
        amount: Number(amount),
        profileEmail: sessionStorage.getItem("email"),
        userId: sessionStorage.getItem("email"),
        bulk: isBulk,
        wallet: false,
        paymentStatus: "Y"
    }
    return encrtypedPost(url, data, header);
}

export const getBulkPolicyDeviceApi = (tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colName, colValue, isSearch, type, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/batchList`;
    let header = {
        token: tokenKey
    };
    const data = {
        fromDate: startDate ? startDate : startMonthDate,
        toDate: endDate ? endDate : endMonthDate,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        search: isSearch,
        columnName: colName ? colName?.toUpperCase()?.replaceAll("!", "") : "",
        columnValue: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_FROM" || colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_TO" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
        type: type
    }
    return encrtypedPost(url, data, header);
}

export const getHistoryDeviceApi = (tokenKey, deviceId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/history?deviceId=${deviceId}`;
    let header = {
        token: tokenKey
    };
    return get(url, header);
}

export const getPaymentHistoryApi = (tokenKey, deviceId, serviceType, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/paymentHistory?policyId=${deviceId}`;
    let header = {
        token: tokenKey,
        serviceType: serviceType
    };
    return get(url, header);
}

export const getCommentDeviceApi = (tokenKey, deviceId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/comment?objectUid=120&recordId=${deviceId}`;
    let header = {
        token: tokenKey
    };
    return get(url, header);
}

export const commentDeviceApi = (tokenKey, deviceId, comment, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/insertComment`;
    let header = {
        token: tokenKey
    };
    const data = {
        id: deviceId,
        objectId: "120",
        comment: comment
    }
    return encrtypedPost(url, data, header);
}

// export const walletSummaryDataApi = () => {
//     const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/travelInsuranceTxnLayerDev/v1/travelInsurance/dashboard/balance-statement`;
//     let header = { 
// token: tokenKey
//      };
//     return get(url, header);
// }

// export const walletHistoryApi = (tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, toggleBtn) => {
//     const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/wallet/SOA?fromDate=${startDate ? startDate : startMonthDate}&toDate=${endDate ? endDate : endMonthDate}`;
//     const header = {
//         token: tokenKey
//         pageCount: pageCount ? pageCount : 10,
//         pageNumber: pageNumber ? pageNumber : 1,
//         search: false,
//         columnName: "",
//         columnValue: ""
//     }
//     return get(url, header);
// }

// export const walletCreditApi = (tokenKey, data, toggleBtn) => {
//     const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/device/api/credit`;
//     const header = {
//         token: tokenKey
//     }
//     return encrtypedPost(url, data, header);
// }

export const getBankListApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/cbaNewEncrypt/CBAFinanceNew/v1/getBankDetails`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const walletCreditApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/CBAPolicyNew/v1/saveDashboardAgentCreditDetails`;
    const header = {
        token: tokenKey
    }
    return encrtypedPost(url, data, header);
}

// personal-accidentApi

export const generateQuotePersonalAccidentApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/B2BAPI/v1/generatePersonalAccidentQuotation`;
    let header = {
        token: tokenKey
    };
    return encrtypedPost(url, data, header);
}


export const personalAccidentSummaryDataApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/CBAPolicyEncrypt/B2BAPI/v1/getPersonalAccidentPolicySummary`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

export const getPersonalAccidentQuotationsApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/B2BAPI/v1/getAllPersonalAccidentQuotations`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colValue ? colValue?.toLowerCase() == "annual" ? 0 : colValue?.toString()?.toLowerCase() == "monthly" ? 4 : colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : colValue?.replaceAll(",", "") : ""
    }
    const header = {
        token: tokenKey
    }



    return encrtypedPost(url, data, header);
}

export const generatePersonalAccidentPolicyApi = (tokenKey, data, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/B2BAPI/v1/generatePersonalAccidentPolicy`;
    const header = {
        token: tokenKey,
    }

    return encrtypedPost(url, data, header);
}

export const getPersonalAccidentPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/B2BAPI/v1/getAllPersonalAccidentPolicies`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colValue ? colValue?.toLowerCase() == "approved" ? 1 : colValue?.toString()?.toLowerCase() == "pending" ? 0 : colValue?.toString()?.toLowerCase() == "rejected" ? 2 : colName?.toLowerCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "created_on" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue?.replaceAll(",", "") : ""
    }
    const header = {
        token: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const getPersonalAccidentApprovedPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/B2BAPI/v1/getAllApprovedPersonalAccidentPolicies`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.replaceAll(",", "") : "",
    }
    const header = {
        token: tokenKey
    }
    return encrtypedPost(url, data, header);
}

export const getPersonalAccidentPolicyByIdApi = (tokenKey, policyId, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/B2BAPI/v1/GetPersonalAccidentPolicyById`;
    const header = {
        token: tokenKey,
        id: policyId
    }
    return get(url, header);
}




// dana
export const danaDomesticSummaryDataApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/Dana/dashboard/summary`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}
export const getAllDanaDomesticPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn, companyName) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/Dana/all-policy-list`;
    const data = {
        columnName: colName ? colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        companyName: companyName,
        value: colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" || colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "DOB" || colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "VALID_FROM" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue ? colValue?.toLowerCase() == "success" ? 1 : colValue?.toString()?.toLowerCase() == "pending" ? 38 : colValue?.toString()?.toLowerCase() == "rejected" ? 2 : colValue?.replaceAll(",", "") : "",
    }
    const header = {
        SessionId: tokenKey
    }
    return encrtypedPost(url, data, header);
}


export const getAllDanaDomesticPolicyByIdApi = (tokenKey, id, type, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/travelInsurance/Dana/${id}/${type}`;
    const header = {
        SessionId: tokenKey
    }
    return get(url, header);
}

// credit life
export const creditSummaryDataApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/GetCreditLifePolicyCard`;
    const header = {
        token: tokenKey
    }
    return get(url, header);
}
export const generateCreditLifePolicyApi = (tokenKey, data, toggleBtn) => {
    // const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2bDELETE/v1/motor/api/generateQuotation`;
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/createMasterPolicy`;
    let header = {
        token: tokenKey
    };
    return encrtypedPost(url, data, header);
}
export const generateCreditLifeDisbursementApi = (tokenKey, data, toggleBtn) => {
    // const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2bDELETE/v1/motor/api/generateQuotation`;
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/loanDisbursementRequest`;
    let header = {
        token: tokenKey
    };
    return encrtypedPost(url, data, header);
}
export const getCreditLifeMasterPolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/getAllMasterCreditLifePolicies`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colValue ? colValue?.toLowerCase() == "approved" ? 1 : colValue?.toString()?.toLowerCase() == "pending" ? 0 : colValue?.toString()?.toLowerCase() == "rejected" ? 2 : colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue?.replaceAll(",", "") : "",
        lobId: "10005"
    }
    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}
export const getCreditLifePolicyApi = (tokenKey, pageNumber, pageCount, colName, colValue, isSearch, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/getAllCreditLifePolicies`;
    const data = {
        columnName: colName ? colName?.replaceAll("!", "") : "",
        fromDate: "",
        isSearch: isSearch,
        pageCount: pageCount ? pageCount : 10,
        pageNumber: pageNumber ? pageNumber : 1,
        toDate: "",
        value: colValue ? colValue?.toLowerCase() == "approved" ? 1 : colValue?.toString()?.toLowerCase() == "pending" ? 0 : colValue?.toString()?.toLowerCase() == "rejected" ? 2 : colName?.toUpperCase()?.replaceAll(" ", "_")?.replaceAll("!", "") == "CREATED_ON" ? moment(colValue, "DD-MM-YYYY").format("YYYY-MM-DD") : colValue?.replaceAll(",", "") : "",
        lobId: "10005"
    }
    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}
export const getCreditLifePolicyNoApi = (tokenKey, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/getAllMasterCreditLifePolicies`;
    const data = {
        columnName: "",
        fromDate: "",
        isSearch: false,
        pageCount: 10,
        pageNumber: 1,
        toDate: "",
        value: "",
        lobId: "10005"
    }
    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}
export const getCreditLifePolicyByIdApi = (tokenKey, policyId, businessType, Service, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/GetCreditLifePolicyById`;
    const header = {
        token: tokenKey,
        PolicyId: policyId,
        Service: Service
    }
    return get(url, header);
}

export const generateCreditLifeDisbursementPremiumApi = (tokenKey, values, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/B2BEncrypt/insuranceNew/v1/getPremium`;
    const data = {
        loanAmount: values?.loanAmount,
        criticalIllness: values.criticalIllness,
        deathOnly: values.deathOnly,
        disability: values.disability,
        jobLoss: values.jobLoss,
        lossOfBusiness: values.lossOfBusiness,
        premiumFrequency: values.premiumFrequency == "Monthly" ? 4 : values.premiumFrequency == "Annual" ? 1 : values.premiumFrequency 
    }
    const header = {
        token: tokenKey,
    }
    return encrtypedPost(url, data, header);
}

export const creditLifePolicyPayApi = (tokenKey, policyId, redirectUrl, amount, toggleBtn) => {
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/autoMiddleApi/v1/policy/pay`;
    let header = {
        token: tokenKey
    };
    const data = {
        policyId: policyId,
        quotationId: null,
        redirectUrl: redirectUrl,
        batchNo: null,
        amount: amount,
        profileEmail: sessionStorage.getItem("email"),
        bulk: false,
        userId: sessionStorage.getItem("email"),
        wallet: false,
    }
    return encrtypedPost(url, data, header);
}