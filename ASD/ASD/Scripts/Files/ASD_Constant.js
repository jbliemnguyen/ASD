/*jshint -W098*//*remove the warning 'variable is defied but never used'*/

/*jshint -W097*//*remove the warning 'use the function form of 'use strict''*/
"use strict";

var ASD_Enum_ContentType = Object.freeze({
    ADMINISTRATIVE: "Administrative",
    CHANGE_ORDER_SUPPLEMENTAL_AGREEMENT: "Change Order - Supplemental Agreement",
    EXERCISING_AN_OPTION_YEAR: "Exercising an Option Year",
    ADD_FUNDING: "Add Funding",
    BPA_CALL_OR_TASK_DELIVERY_ORDER: "BPA Call Or Task Delivery Order",
    PRODUCT: "Product",
    PRODUCT_WITH_INCIDENTAL_SERVICES: "Product With Incidental Services",
    SERVICES: "Services"
});

var ASD_Enum_Field = Object.freeze({
    IS_THIS_AN_IT_PRODUCT_SERVICE: "Is this an IT product/service?",
    IF_IT_PRODUCT_SERVICE_AND_REQUESTED_FUNDED_OUTSIDE_OF_CIO_PLEASE_IDENTIFY_YOUR_CIO_POINT_OF_CONTACT: "If IT product/service and requested/funded outside of CIO, please identify your CIO point of contact",
    HAVE_YOU_ACQUIRED_THIS_PRODUCT_SERVICE_BEFORE: "Have you acquired this product/service before?",
    PREVIOUS_CONTRACT_NUMBER: "Previous Contract Number",
    PREVIOUS_BPA_NUMBER: "Previous BPA Number",
    PREVIOUS_CONTRACTOR_NAME: "Previous Contractor Name",
    BPA_CALL_DO_TO_NUMBER: "BPA Call-DO/TO #",
    REQ_STATUS: "REQ Status",
    PREVIOUS_REQ_STATUS:"Previous REQ Status",
    REQ_NUMBER: "REQ #",
    REQ_VALUE: "REQ Value",
    ASD_ACTION: "ASD Action",
    ACQ_STATUS: "ACQ Status",
    PALT_TYPE: "PALT Type",
    CONTRACT_SPECIALIST_ASSIGNED: "Contract Specialist Assigned",
    SOLICITATION_CLOSE_DATE: "Solicitation Close Date",
    CURRENT_CONTRACT_NUMBER: "Current Contract Number",
    CURRENT_CONTRACTOR_NAME: "Current Contractor Name",
    MISC_DETAILS: "Misc Details",
    Sys_USERACTION: "Sys_UserAction",
    SOLICITATION_NUMBER: "Solicitation #",
    AUTHORIZATION_OFFICIAL: "Authorization Official",
    COR: "COR",
    DESIRED_DELIVERY_START_DATE: "Desired Delivery /Start Date",
    DELIVERY_START_DATE_DESIRED: "Delivery /Start Date Desired",
    DOES_THE_PRODUCT_REQUIRE_MAINTENANCE_AND_SUPPORT: "Does the product require Maintenance and Support?",
    DOES_THIS_FULLY_FUND_THE_ACTION: "Does this fully fund the action?",
    END_USER_OFFICE:"End User Office",    
    END_USER: "End User",
    IF_IT_PRODUCT_SERVICE_HAVE_SYSTEM_COMPATIBILITY_REQUIREMENTS_BEEN_DEFINED: "If IT product/service, have system compatibility requirements been defined?",
    IS_THIS_A_ONE_TIME_ORDER:"Is this a one-time order?",
    OPTION_YEAR_VALUE: "Option Year Value",
    ANTICIPATED_PERIOD_OF_PERFORMANCE: "Anticipated period of performance",
    PERIOD_OF_PERFORMANCE_ANTICIPATED: "Period of performance anticipated",
    PROJECT_TITLE:"Project Title",
    REASON_FOR_REQUEST: "Reason for Request",
    SUBMITTING_OFFICE:"Submitting Office",
    SUGGESTED_SOURCES:"Suggested Sources",
    TECHNICAL_EVALUATION_TEAM:"Technical Evaluation Team",
    WILL_THE_SERVICES_BE_REQUIRED_FOR_MORE_THAN_ONE_YEAR: "Will the services be required for more than one year?",
    COMMENT: "Comment",
    COR_COMMENT: "COR Comment",
    AWARD_AMOUNT: "Award Amount",
    ANTICIPATED_AWARD_DATE: "Anticipated Award Date",
    LOG: "Log",
    DELAY_AWARD_DAYS: "Delay Award Days",
    PREVIOUS_ASD_ACTION: "Previous ASD Action",
    IS_THIS_OPTION_YEAR_FUNDING: "Is This Option Year Funding?",
    IS_THIS_INCREMENTAL_FUNDING: "Is This Incremental Funding?",
    DO_THESE_FUNDS_REPRESENT_FULL_FUNDING_FOR_THE_CURRENT_POP: "Do These Funds Represent Full Funding For The Current Period of Performance (POP)?",
    MOD_NUMBER: "Mod #",
    ULTIMATE_COMPLETION_DATE: "Ultimate Completion Date",
    FUNDING: "Funding",
    NOTICE_OF_INTENT: "Notice of Intent",
    RECOMPETE_PACKAGE: "Recompete Package",
    Sys_IS_AWARDED:"SysIsAwarded"
});

var ASD_Enum_FieldChoice = Object.freeze({
    YES_REQUESTED_FUNDED_BY_CIO: "Yes (Requested/Funded by CIO)",
    PLEASE_SELECT: "-- Please Select --",
    SOLICITATION_CLOSED: "SOLICITATION CLOSED",
});

var ASD_Enum_REQ_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    SUBMITTED: "SUBMITTED",
    NOT_APPROVED: "NOT APPROVED",
    RETURNED: "RETURNED",
    AO_APPROVED: "AO APPROVED",
    IN_REVIEW: "IN REVIEW",
    CANCEL_BY_REQUESTOR: "CANCEL BY REQUESTOR",
    REQUIREMENT_CANCEL: "REQUIREMENT CANCEL",
    ASSIGNED: "ASSIGNED",    
    AWARDED: "AWARDED",
    HOLD: "HOLD",
});


var ASD_Enum_Sys_USERACTION = Object.freeze({    
    SUBMIT: "SUBMIT",
    REJECT: "REJECT",
    APPROVE: "APPROVE",
    CANCEL_REQUEST: "CANCEL REQUEST",
    REVIEW: "REVIEW",
    RETURN: "RETURN",
    REQUIREMENT_CANCEL: "REQUIREMENT CANCEL",
    ASSIGN: "ASSIGN",
    HOLD: "HOLD",
    RELEASE:"RELEASE",
    AWARD: "AWARD",
    SAVE: "SAVE"
});

var ASD_Enum_Group = Object.freeze({
    ASD_Admin: "ASD Admin",
    CO_Group: "CO",
});

var ASD_Enum_ACQSTATUS = Object.freeze({
    IN_PROGRESS: "IN PROGRESS",
    SOLICITATION_PUBLISHED: "SOLICITATION PUBLISHED",
    SOLICITATION_CLOSED: "SOLICITATION CLOSED",
    TECHNICAL_EVALUATION: "TECHNICAL EVALUATION",
    AWARDED: "AWARDED",
    KICK_OFF_MEETING: "KICK-OFF MEETING",
    IN_REVIEW: "IN REVIEW",
    ASSIGNED: "ASSIGNED",
    REQUIREMENT_CANCELED: "REQUIREMENT CANCELED"
});

var ASD_String_Constant = Object.freeze({
    Empty: "",
    Blank_Space: " ",
    PLEASE_SELECT: "-- Please Select --",
    BusinessDateFormat: "MM/DD/YYYY",
    REST_Request_List_ItemType: "SP.Data.ASD_x0020_RequestListItem",
    REST_Log_List_ItemType: "SP.Data.LogListItem",
});

var ASD_ListName = Object.freeze({
    BusinessOffDays: "BusinessOffDays",
    ASD_Request: "ASD Request",
    Log: "Log",
} );

var ASD_Request_InternalFieldName = Object.freeze( {
    REQ_Number: "REQ_x0020__x0023_",
    REQ_Status : "REQ_x0020_STATUS",
    Assigned_Date: "Assigned_x0020_Date",
    ASD_Action: "ASD_x0020_Action",
    Anticipated_Award_Date: "Anticipated_x0020_Award_x0020_Da",
    Delay_Award_Days: "Delay_x0020_Award_x0020_Days",
    PALT_Type: "PALT_x0020_Type", 
} );
