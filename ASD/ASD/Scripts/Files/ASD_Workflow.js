//State machine workflow
//implement here or in designer workflow.
///<reference path="ASD_Constant.js" />
"use strict";
var ASD_Workflow = {
    execute: function (REQStatus, sys_UserAction) {
        var nextREQStatus;
        switch (REQStatus) {
            case ASD_Enum_REQ_STATUS.DRAFT:
            case ASD_Enum_REQ_STATUS.RETURNED:
            case ASD_Enum_REQ_STATUS.NOT_APPROVED:
                //user can submit or cancel request
                switch (sys_UserAction) {
                    case (ASD_Enum_Sys_USERACTION.SUBMIT):
                        nextREQStatus = ASD_Enum_REQ_STATUS.SUBMITTED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.CANCEL_REQUEST):
                        nextREQStatus = ASD_Enum_REQ_STATUS.CANCEL_BY_REQUESTOR;
                        break;
                    default:
                        break;
                }

                break;
            case ASD_Enum_REQ_STATUS.SUBMITTED:
                //user can cancel request, approve, or reject
                switch (sys_UserAction) {
                    case (ASD_Enum_Sys_USERACTION.APPROVE):
                        nextREQStatus = ASD_Enum_REQ_STATUS.AO_APPROVED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.REJECT):
                        nextREQStatus = ASD_Enum_REQ_STATUS.NOT_APPROVED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.CANCEL_REQUEST):
                        nextREQStatus = ASD_Enum_REQ_STATUS.CANCEL_BY_REQUESTOR;
                        break;
                    default:
                        break;
                }

                break;
            case ASD_Enum_REQ_STATUS.AO_APPROVED:
                //user can Assign, Review, Return, requirement cancel
                switch (sys_UserAction) {
                    case (ASD_Enum_Sys_USERACTION.ASSIGN):
                        nextREQStatus = ASD_Enum_REQ_STATUS.ASSIGNED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.REVIEW):
                        nextREQStatus = ASD_Enum_REQ_STATUS.IN_REVIEW;
                        break;
                    case (ASD_Enum_Sys_USERACTION.RETURN):
                        nextREQStatus = ASD_Enum_REQ_STATUS.RETURNED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.REQUIREMENT_CANCEL):
                        nextREQStatus = ASD_Enum_REQ_STATUS.REQUIREMENT_CANCEL;
                        break;
                    default:
                        break;
                }

                break;
            case ASD_Enum_REQ_STATUS.IN_REVIEW:
                //user can assign, return, requirement cancel
                switch (sys_UserAction) {
                    case (ASD_Enum_Sys_USERACTION.ASSIGN):
                        nextREQStatus = ASD_Enum_REQ_STATUS.ASSIGNED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.RETURN):
                        nextREQStatus = ASD_Enum_REQ_STATUS.RETURNED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.REQUIREMENT_CANCEL):
                        nextREQStatus = ASD_Enum_REQ_STATUS.REQUIREMENT_CANCEL;
                        break;
                    default:
                        break;
                }
                break;
            case ASD_Enum_REQ_STATUS.ASSIGNED:
                //user can award, return, requiremnt cancel
                switch (sys_UserAction) {
                    case (ASD_Enum_Sys_USERACTION.AWARD):
                        nextREQStatus = ASD_Enum_REQ_STATUS.AWARDED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.RETURN):
                        nextREQStatus = ASD_Enum_REQ_STATUS.RETURNED;
                        break;
                    case (ASD_Enum_Sys_USERACTION.REQUIREMENT_CANCEL):
                        nextREQStatus = ASD_Enum_REQ_STATUS.REQUIREMENT_CANCEL;
                        break;
                    default:
                        break;
                }
                break;
            case ASD_Enum_REQ_STATUS.REQUIREMENT_CANCEL:
            case ASD_Enum_REQ_STATUS.AWARDED:
            case ASD_Enum_REQ_STATUS.CANCEL_BY_REQUESTOR:
                //end of workflow - no next status             
                break;
            default:
                ASD_HelperScripts.insertLogListItem( "Unknown REQ Status: " + REQStatus );
        }

        //if nextReqStatus has value --> return new, otherwise, return original
        if (nextREQStatus) {
            return nextREQStatus;
        } else {
            return REQStatus;
        }
        

    },
};