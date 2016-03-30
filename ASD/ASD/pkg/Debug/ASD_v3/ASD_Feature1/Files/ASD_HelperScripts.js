///<reference path="ASD_Constant.js" />
///<reference path="ASD_Object.js" />
"use strict";
var ASD_HelperScripts = {
    DisplayReqDocsSection: function (contentType) {
        if ((contentType.localeCompare(ASD_Enum_ContentType.PRODUCT) == 0) ||
        (contentType.localeCompare(ASD_Enum_ContentType.PRODUCT_WITH_INCIDENTAL_SERVICES) == 0) ||
        (contentType.localeCompare(ASD_Enum_ContentType.SERVICES) == 0)) {
            //make visible table 
            jQuery("#reqDocsProj").removeClass("invisible");
        } else {
            if (contentType.localeCompare(ASD_Enum_ContentType.BPA_CALL_OR_TASK_DELIVERY_ORDER) == 0) {
                jQuery("#reqDocsBPA").removeClass("invisible");
            } else {
                if (contentType.localeCompare(ASD_Enum_ContentType.EXERCISING_AN_OPTION_YEAR) == 0) {
                    jQuery("#reqDocsOption").removeClass("invisible");
                } else {
                    if (contentType.localeCompare(ASD_Enum_ContentType.ADMINISTRATIVE) == 0) {
                        jQuery("#reqDocsAdministrative").removeClass("invisible");
                    } else {
                        if (contentType.localeCompare(ASD_Enum_ContentType.ADD_FUNDING) == 0) {
                            jQuery("#reqDocsFunding").removeClass("invisible");
                        } else {
                            if (contentType.localeCompare(ASD_Enum_ContentType.CHANGE_ORDER_SUPPLEMENTAL_AGREEMENT) == 0) {
                                jQuery("#reqDocsChangeOrder").removeClass("invisible");
                            }
                        }
                    }
                }
            }
        }
    },

    RibbonCustomButtonClick: function (buttonName) {
        //var UserAction = ASD_String_Constant.Empty;
        var UserAction = ASD_Enum_Sys_USERACTION.SAVE;
        switch (buttonName) {
            case "btnSubmit":
                UserAction = ASD_Enum_Sys_USERACTION.SUBMIT;
                break;
            case "btnApprove":
                UserAction = ASD_Enum_Sys_USERACTION.APPROVE;
                break;
            case "btnReject":
                UserAction = ASD_Enum_Sys_USERACTION.REJECT;
                break;
            case "btnCancelRequest":
                UserAction = ASD_Enum_Sys_USERACTION.CANCEL_REQUEST;
                break;
            case "btnReview":
                UserAction = ASD_Enum_Sys_USERACTION.REVIEW;
                break;
            case "btnAssign":
                UserAction = ASD_Enum_Sys_USERACTION.ASSIGN;
                break;
            case "btnRequirementCancel":
                UserAction = ASD_Enum_Sys_USERACTION.REQUIREMENT_CANCEL;
                break;
            case "btnReturn":
                UserAction = ASD_Enum_Sys_USERACTION.RETURN;
                break;
            case "btnHold":
                UserAction = ASD_Enum_Sys_USERACTION.HOLD;
                break;
            case "btnRelease":
                UserAction = ASD_Enum_Sys_USERACTION.RELEASE;
                break;
            case "btnAward":
                UserAction = ASD_Enum_Sys_USERACTION.AWARD;
                break;
            default:
                ASD_HelperScripts.insertLogListItem("Unknow User Action");
        }

        if (UserAction.localeCompare(ASD_Enum_Sys_USERACTION.AWARD) === 0) {
            $("#awardDialogConfirmation").html("<span style='color:green'>Don't forget to attach awarded document</span>");
            $("#awardDialogConfirmation").dialog({
                buttons: {
                    "No": function (e) {
                        $(this).dialog("close");

                    },
                    "AWARD": function (e) {
                        ASD_HelperScripts.commitChange(UserAction);
                        $(this).dialog("close");
                    }
                }
            }, { width: 450, height: 150 });
        } else {
            ASD_HelperScripts.commitChange(UserAction);
        }




    },
    //**************************************************************************************************************
    commitChange: function (UserAction) {

        //Set user action
        jQuery("input[title^='" + ASD_Enum_Field.Sys_USERACTION + "']").val(UserAction);

        //Set is_Awarded field
        if (UserAction.localeCompare(ASD_Enum_Sys_USERACTION.AWARD) === 0) {
            $("input[title^='" + ASD_Enum_Field.Sys_IS_AWARDED + "']").prop('checked', true);
        } else {
            $("input[title^='" + ASD_Enum_Field.Sys_IS_AWARDED + "']").prop('checked', false);
        }


        var btnSave = jQuery("a[id^='Ribbon.ListForm.Edit.Commit.Publish']");
        btnSave[0].click();
    },

    //**************************************************************************************************************
    calculateFields: function (reqStatus, previousReqStatus, userAction) {
        //method is called when form is saved,after pass all validations

        //Set current ASD Action to Previous ASD Action
        jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_ASD_ACTION + "']").val(ASD_SPContextObj.ASDAction);

        //calculate estimated due date
        //Calculate only when status is ASSIGNED or previous status is ASSIGNED (current status would be HOLD)
        //or action is Assign
        var strNumberOfDelayDays = jQuery("input[title^='" + ASD_Enum_Field.DELAY_AWARD_DAYS + "']").val();

        if ((reqStatus.localeCompare(ASD_Enum_REQ_STATUS.ASSIGNED) === 0) ||
            (previousReqStatus.localeCompare(ASD_Enum_REQ_STATUS.ASSIGNED) === 0)) {
            ASD_HelperScripts.setAnticipatedAwardDate(ASD_SPContextObj.AssignedDate, strNumberOfDelayDays);
        } else {
            if (userAction.localeCompare(ASD_Enum_Sys_USERACTION.ASSIGN) === 0) {
                ASD_HelperScripts.setAnticipatedAwardDate(new Date(), strNumberOfDelayDays);
            } else {
                //reset the anticipated award date - in case the request is returned for instances
                jQuery("input[title^='" + ASD_Enum_Field.ANTICIPATED_AWARD_DATE + "']").val(ASD_String_Constant.Empty);
            }
        }
    },


    setAnticipatedAwardDate: function (fromDate, strNumberOfDelayDays) {

        var palt_type_control = jQuery("select[title^='" + ASD_Enum_Field.PALT_TYPE + "']");
        if (!ASD_CustomValidation.isSelectedInDropdownEqual(palt_type_control, ASD_Enum_FieldChoice.PLEASE_SELECT)) {
            var businessOffDateList = ASD_BusinessDateCalculation.getBusinessOffDaysList(ASD_SPContextObj.siteAbsoluteUrl);
            var palt_type_value = palt_type_control.val().toString();

            var anticipatedAwardDate = ASD_HelperScripts.calculatedAnticipadAwardDate(fromDate, palt_type_value, strNumberOfDelayDays, businessOffDateList);

            jQuery("input[title^='" + ASD_Enum_Field.ANTICIPATED_AWARD_DATE + "']").val(anticipatedAwardDate);
        } else {
            //reset the anticipated award date if the palt type is not selected
            jQuery("input[title^='" + ASD_Enum_Field.ANTICIPATED_AWARD_DATE + "']").val(ASD_String_Constant.Empty);
        }
    },

    calculatedAnticipadAwardDate: function (strFromDate, strPaltType, strNumberofDelayDays, strBusinessDateOffList) {
        var intNberOfBusinessDays = parseInt(strPaltType.substring(0, strPaltType.indexOf(ASD_String_Constant.Blank_Space)));
        var intNumberOfDelayDays = parseInt(strNumberofDelayDays);
        if (isNaN(intNumberOfDelayDays)) {//number of delay days is not provided
            intNumberOfDelayDays = 0;
        }

        var anticipatedAwardDate = ASD_BusinessDateCalculation.getNextBusinessDate(ASD_SPContextObj.siteAbsoluteUrl, strFromDate, intNberOfBusinessDays + intNumberOfDelayDays, strBusinessDateOffList);

        return anticipatedAwardDate;
    },

    makeFieldReadOnlyFromREQStatus: function (REQStatus) {
        var control = null;

        //status = awarded, requirement cancel, cancel by requestor
        //fields are read only
        if ((REQStatus.localeCompare(ASD_Enum_REQ_STATUS.AWARDED) === 0) || (REQStatus.localeCompare(ASD_Enum_REQ_STATUS.REQUIREMENT_CANCEL) === 0) ||
        (REQStatus.localeCompare(ASD_Enum_REQ_STATUS.CANCEL_BY_REQUESTOR) === 0)) {
            //************************************************************************************************************************
            //left side - external
            //REQ # - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.REQ_NUMBER);

            //REQ Value - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.REQ_VALUE);

            //Option Year Value - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.OPTION_YEAR_VALUE);

            //Does this fully fund the action - choice - dropdown
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.DOES_THIS_FULLY_FUND_THE_ACTION);

            //Desired delivery / Start Date - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.DESIRED_DELIVERY_START_DATE);

            //delivery / Start Date Desired - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.DELIVERY_START_DATE_DESIRED);

            //Anticipated Periof Performance - input - single line of text
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.ANTICIPATED_PERIOD_OF_PERFORMANCE);

            //Periof Performance Anticipated - input - single line of text
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.PERIOD_OF_PERFORMANCE_ANTICIPATED);

            

            //Reason for Request - textarea
            ASD_HelperScripts.makeTextAreaReadOnly(ASD_Enum_Field.REASON_FOR_REQUEST);

            //Project Title - input - single line of text
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.PROJECT_TITLE);

            //AO/COR Comment - multiple line - text area
            ASD_HelperScripts.makeTextAreaReadOnly(ASD_Enum_Field.COR_COMMENT);

            //COR - people picker
            ASD_HelperScripts.makePeoplePickerReadOnly(ASD_Enum_Field.COR);

            //Submitting Office - choice - dropdow
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.SUBMITTING_OFFICE);

            //End User Office - choice - dropdonw - select
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.END_USER_OFFICE);

            //End User - people picker
            ASD_HelperScripts.makePeoplePickerReadOnly(ASD_Enum_Field.END_USER);

            //Authorization Official - people picer
            //ASD_HelperScripts.makePeoplePickerReadOnly( ASD_Enum_Field.AUTHORIZATION_OFFICIAL );

            //Suggested Sources - single line of text - input
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.SUGGESTED_SOURCES);

            //Is this an IT Product/Service - drop down - select
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.IS_THIS_AN_IT_PRODUCT_SERVICE);

            //If IT PRoduct/Service/ Have system compability - radio
            ASD_HelperScripts.makeRadioReadOnly(ASD_Enum_Field.IF_IT_PRODUCT_SERVICE_HAVE_SYSTEM_COMPATIBILITY_REQUIREMENTS_BEEN_DEFINED);

            //Does the product require Maintenance and support - radio
            ASD_HelperScripts.makeRadioReadOnly(ASD_Enum_Field.DOES_THE_PRODUCT_REQUIRE_MAINTENANCE_AND_SUPPORT);

            //If requested/funded outside of cio - people
            ASD_HelperScripts.makePeoplePickerReadOnly(ASD_Enum_Field.IF_IT_PRODUCT_SERVICE_AND_REQUESTED_FUNDED_OUTSIDE_OF_CIO_PLEASE_IDENTIFY_YOUR_CIO_POINT_OF_CONTACT);

            //is this a one-time order - radio
            ASD_HelperScripts.makeRadioReadOnly(ASD_Enum_Field.IS_THIS_A_ONE_TIME_ORDER);

            //will the service be required for more than one year - dropdown
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.WILL_THE_SERVICES_BE_REQUIRED_FOR_MORE_THAN_ONE_YEAR);

            //have you requested this service/product before - radio
            ASD_HelperScripts.makeRadioReadOnly(ASD_Enum_Field.HAVE_YOU_ACQUIRED_THIS_PRODUCT_SERVICE_BEFORE);

            //Current contract number - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.CURRENT_CONTRACT_NUMBER);

            //Current Contractor Name - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.CURRENT_CONTRACTOR_NAME);

            //Previous Contract Number - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.PREVIOUS_CONTRACT_NUMBER);

            //Previous BPA Number - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.PREVIOUS_BPA_NUMBER);

            //Previous Contractor Name - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.PREVIOUS_CONTRACTOR_NAME);

            //Misc Details - textarea
            ASD_HelperScripts.makeTextAreaReadOnly(ASD_Enum_Field.MISC_DETAILS);

            //Technical Evaluation Team - people picker
            ASD_HelperScripts.makePeoplePickerReadOnly(ASD_Enum_Field.TECHNICAL_EVALUATION_TEAM);


            //************************************************************************************************************************
            //right side - internal
            //ASD Action - dropdown
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.ASD_ACTION);

            //PALT TYPE - dropdown
            ASD_HelperScripts.makeDropDownReadOnly(ASD_Enum_Field.PALT_TYPE);

            //Contract Specialist Assigned - people picker
            ASD_HelperScripts.makePeoplePickerReadOnly(ASD_Enum_Field.CONTRACT_SPECIALIST_ASSIGNED);

            //Delay Award Days - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.DELAY_AWARD_DAYS);

            //Award amount - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.AWARD_AMOUNT);

            //BPA Call Number - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.BPA_CALL_DO_TO_NUMBER);

            //Solicitation Number - input
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.SOLICITATION_NUMBER);

            //Solicitation Close Date - input
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.SOLICITATION_CLOSE_DATE);

            //Comment - textarea
            ASD_HelperScripts.makeTextAreaReadOnly(ASD_Enum_Field.COMMENT);

            //Funding - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.FUNDING);

            //Notice of Intent - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.NOTICE_OF_INTENT);

            //Recompete Package - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.RECOMPETE_PACKAGE);
            //************************************************************************************************************************
        } else {
            if ((REQStatus.localeCompare(ASD_Enum_REQ_STATUS.AO_APPROVED) === 0) || (REQStatus.localeCompare(ASD_Enum_REQ_STATUS.IN_REVIEW) === 0) ||
            (REQStatus.localeCompare(ASD_Enum_REQ_STATUS.ASSIGNED) === 0)) {
                //REQ Number and REQ Value read only
                //REQ # - textbox
                ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.REQ_NUMBER);

                //REQ Value - textbox
                ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.REQ_VALUE);
            }
        }

        //Delay Award Days - only CO can edit
        if (!ASD_CurrentLoginPermissionLevel.BelongsToCOGroup) {
            //Delay Award Days - textbox
            ASD_HelperScripts.makeTextBoxReadOnly(ASD_Enum_Field.DELAY_AWARD_DAYS);
        }

    },

    makeTextBoxReadOnly: function (fieldName) {
        var control = jQuery("input[title^='" + fieldName + "']");
        if (control.length > 0) {
            ASD_HelperScripts.makeControlReadOnly(control);
        }
    },

    makeDropDownReadOnly: function (fieldName) {
        var control = jQuery("select[title^='" + fieldName + "']");
        if (control.length > 0) {
            ASD_HelperScripts.makeControlReadOnly(control);
        }
    },

    makeTextAreaReadOnly: function (fieldName) {
        var control = jQuery("textarea[title^='" + fieldName + "']");
        if (control.length > 0) {
            ASD_HelperScripts.makeControlReadOnly(control);
        }
    },

    makeRadioReadOnly: function (fieldName) {
        //radio button, disable the td contains all radio
        var control = jQuery(":contains('" + fieldName + "')").closest(".ferc-formlabel").next("td");
        if (control.length > 0) {
            ASD_HelperScripts.makeControlReadOnly(control);
        }
    },

    makeControlReadOnly: function (control) {
        control.attr("disabled", "disabled");
    },

    makePeoplePickerReadOnly: function (fieldName) {
        var control = jQuery("div[title^='" + fieldName + "']");
        if (control.length > 0) {
            control.attr("disabled", "disabled");
            control.find("a").remove(); //remove the link that remove selected user.
        }
    },

    insertLogListItem: function (message) {

        //insert log item
        if ((ASD_SPContextObj) && (ASD_SPContextObj.ListItemId)) {
            message = "List Item ID: " + ASD_SPContextObj.ListItemId + " - " + message;
        }
        var itemType = ASD_String_Constant.REST_Log_List_ItemType;
        var item = {
            "__metadata": { "type": itemType },
            "Message": message
        };

        var url = ASD_SPContextObj.siteAbsoluteUrl + "/_api/web/Lists/getByTitle('" + ASD_ListName.Log + "')/Items";


        $.ajax({
            async: false,
            url: url,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            },
            success: function (data) {


            },
            error: function (data) {

            }
        });

        //display error message to user
        alert(message);
    },
};