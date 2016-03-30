/*jshint -W117 */
///<reference path="ASD_Constant.js" />
"use strict";
var ASD_CustomValidation = {
    //Determine if people picker have a valid value, return false if empty or invalid value
    isPeoplePickerHasValue: function (controlToBeValidated) {
        //html code of the People Picker
        //"<div title=\"COR\" class=\"sp-peoplepicker-topLevel\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker\" SPClientPeoplePicker=\"true\"><input name=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_HiddenInput\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_HiddenInput\" type=\"hidden\" value='[{\"Key\":\"i:0#.w|adferc\\\\lnngd\",\"DisplayText\":\"Liem Nguyen\",\"IsResolved\":true,\"Description\":\"i:0#.w|adferc\\\\lnngd\",\"EntityType\":\"\",\"EntityGroupName\":\"\",\"HierarchyIdentifier\":null,\"EntityData\":{\"Email\":\"Liem.Nguyen@ferc.gov\",\"Department\":\"General Dynamics Information Technology\",\"SPUserID\":\"1\",\"AccountName\":\"i:0#.w|adferc\\\\lnngd\",\"PrincipalType\":\"User\"},\"MultipleMatches\":[],\"ProviderName\":\"\",\"ProviderDisplayName\":\"\",\"Resolved\":true}]'><div class=\"sp-peoplepicker-autoFillContainer\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_AutoFillDiv\" style=\"left: -1px; top: 26px;\" InputElementId=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_EditorInput\"></div><span class=\"sp-peoplepicker-initialHelpText ms-helperText\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_InitialHelpText\" style=\"display: none;\">Enter a name or email address...</span><img class=\"sp-peoplepicker-waitImg\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_WaitImage\" alt=\"This animation indicates the operation is in progress. Click to remove this animated image.\" src=\"/_layouts/15/images/gears_anv4.gif?rev=23\"><span class=\"sp-peoplepicker-resolveList\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePi
        //var controlToBeValidated = jQuery("div[title='" + displayFieldName + "']").find("input:first");

        if (controlToBeValidated.length > 0) {
            var controlValue = controlToBeValidated.attr("value");
            if (controlValue) {
                if (controlValue.indexOf('\"IsResolved\":true') > -1) {
                    return true;
                }
            }
        } else {
            //if there is no control, don't do validation
            return true;
        }
        return false;
    },

    //*********************************************************************
    //Determine if textbox is match regular expression input,if isRequired = true,  return false if empty or invalid value
    //If isRequired = false, return false if there is value and value match, otherwise return false
    isTextBoxMatchValue: function (controlToBeValidated, Regex) {
        if (controlToBeValidated.length > 0) {
            var controlValue = controlToBeValidated.val();
            return RegExp(Regex).test(controlValue);
        } else {
            //if there is no control, don't do validation
            return true;
        }


        return false;

    },
    //*********************************************************************
    //Determine if textbox has value on it
    isTextBoxHasValue: function (controlToBeValidated) {
        if (controlToBeValidated.length > 0) {
            var controlValue = controlToBeValidated.val();
            if (controlValue) {
                return true;
            }
        } else {
            //if there is no control, don't do validation
            return true;
        }

        return false;

    },
    //*********************************************************************
    isSelectedInDropdownEqual: function (controlToBeValidated, value) {
        //var controlToBeValidated = jQuery("select[title='" + displayFieldName + "']");        
        if (controlToBeValidated.length > 0) {
            var controlValue = controlToBeValidated.children("option:selected").text();
            if (controlValue) {
                //check if selected value in dropdown have the same value 
                return (controlValue.localeCompare(value) === 0);
            }
        } else {
            //if there is no control, don't do validation
            return true;
        }


        return false;
    },

    //*********************************************************************
    doesDropdownHasSelectedValue: function (controlToBeValidated) {
        //var controlToBeValidated = jQuery("select[title='" + displayFieldName + "']");        
        if (controlToBeValidated.length > 0) {
            var selectedValue = controlToBeValidated.children("option:selected").val();
            //check if selected value has the empty string, if it is, it means no selected value in drop down
            return (selectedValue.localeCompare(ASD_String_Constant.Empty) !== 0);
        } else {
            //if there is no control, don't do validation
            return true;
        }

        return false;
    },
    //*********************************************************************
    //set the validation result and error message for later display
    setValidationResult: function (controlToBeValidated, isPeoplePicker, isValidated, validationResult, errorMessage) {
        if (isPeoplePicker) {
            //if control is people picker, must set the validation error color on its parent(div) instead of input (because iput does not render -> no color display)
            controlToBeValidated = controlToBeValidated.parent();
        }

        if (!isValidated) {
            validationResult.isValidated = validationResult.isValidated && false;
            validationResult.message = validationResult.message + "<li>" + errorMessage + "</li>";

            if (controlToBeValidated) {
                controlToBeValidated.addClass("has-error");

                //register event so after user modify the value, remove the class of invalid error
                controlToBeValidated.one("change.pl-event keyup.pl-event paste.pl-event input.pl-event", function (event) {
                    controlToBeValidated.removeClass("has-error");
                    //controlToBeValidated.off("has-error");
                });
            }

        } else {
            if (controlToBeValidated) {
                controlToBeValidated.removeClass("has-error");
            }
        }
    },
    //*********************************************************************
    validate: function (validationResult, sys_UserAction, REQSTATUS) {

        ASD_CustomValidation.requiredValidation(validationResult);


        //*****************************************************************************************************
        //Parent child validation

        var ifValue = "";
        var isValidated;
        var controlToBeValidated;
        var Regex = "";

        //Rule 0: REQ # is limited to 5 numeric digit
        //we need to set it here instead of in site column validation becuase the field is text, not number (the comma caused confused)
        Regex = "^[0-9]{1,5}$";//limit 5 numeric
        controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.REQ_NUMBER + "']");
        isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
        ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "REQ # is required and limited to 5 numeric digit");

        //Rule 0 - a: REQ # is not exist - only check status is draft, returned, not approved, submitted, because req # is editable
        //only check if the format and number of digit(above validation) is good
        if (isValidated) {
            if ((REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.DRAFT) === 0) || (REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.RETURNED) === 0) ||
            (REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.NOT_APPROVED) === 0) || (REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.SUBMITTED) === 0)) {
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.REQ_NUMBER + "']");
                isValidated = ASD_CustomValidation.IsREQNumberUnique(ASD_SPContextObj.siteAbsoluteUrl, controlToBeValidated);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "REQ # is previously used");
            }
        }


        //Rule 1: if "Is this an IT product/service?" = Yes (Requested/Funded by CIO), then "If Requested/Funded Outside of CIO, Please identify your CIO Point of Contact" is required        
        ifValue = jQuery("select[title^='" + ASD_Enum_Field.IS_THIS_AN_IT_PRODUCT_SERVICE + "'] option:selected").text();
        if ((ifValue) && (ifValue.localeCompare(ASD_Enum_FieldChoice.YES_REQUESTED_FUNDED_BY_CIO) === 0))//selected value is "Yes (Requested/Funded by CIO)"
        {
            //"<div title=\"COR\" class=\"sp-peoplepicker-topLevel\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker\" SPClientPeoplePicker=\"true\"><input name=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_HiddenInput\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_HiddenInput\" type=\"hidden\" value='[{\"Key\":\"i:0#.w|adferc\\\\lnngd\",\"DisplayText\":\"Liem Nguyen\",\"IsResolved\":true,\"Description\":\"i:0#.w|adferc\\\\lnngd\",\"EntityType\":\"\",\"EntityGroupName\":\"\",\"HierarchyIdentifier\":null,\"EntityData\":{\"Email\":\"Liem.Nguyen@ferc.gov\",\"Department\":\"General Dynamics Information Technology\",\"SPUserID\":\"1\",\"AccountName\":\"i:0#.w|adferc\\\\lnngd\",\"PrincipalType\":\"User\"},\"MultipleMatches\":[],\"ProviderName\":\"\",\"ProviderDisplayName\":\"\",\"Resolved\":true}]'><div class=\"sp-peoplepicker-autoFillContainer\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_AutoFillDiv\" style=\"left: -1px; top: 26px;\" InputElementId=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_EditorInput\"></div><span class=\"sp-peoplepicker-initialHelpText ms-helperText\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_InitialHelpText\" style=\"display: none;\">Enter a name or email address...</span><img class=\"sp-peoplepicker-waitImg\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePicker_WaitImage\" alt=\"This animation indicates the operation is in progress. Click to remove this animated image.\" src=\"/_layouts/15/images/gears_anv4.gif?rev=23\"><span class=\"sp-peoplepicker-resolveList\" id=\"COR_fcb600dd-1a09-4395-9002-b0341c3aa7d3_$ClientPeoplePi
            controlToBeValidated = jQuery("div[title^='" + ASD_Enum_Field.IF_IT_PRODUCT_SERVICE_AND_REQUESTED_FUNDED_OUTSIDE_OF_CIO_PLEASE_IDENTIFY_YOUR_CIO_POINT_OF_CONTACT + "']").find("input:first");
            isValidated = ASD_CustomValidation.isPeoplePickerHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, true, isValidated, validationResult, "If 'Is this an IT product/service?' = Yes (Requested/Funded by CIO), then 'If IT product/service and requested/funded outside of CIO, please identify your CIO point of contact' is required");
        }

        //rule 2: If 'Have you acquired this product/service before?' is Yes, then 'Previous Contract Number' must have value of 'FERC-abc' and less than 20 alphanumeric characters
        //or
        //'Previous Contract Number' must have value of 'FERC-aBC123' and less than 20 alphanumeric characters
        ifValue = "";//reset value to avoid carry value from previous rule
        ifValue = jQuery("tr[data-displayname='" + ASD_Enum_Field.HAVE_YOU_ACQUIRED_THIS_PRODUCT_SERVICE_BEFORE + "']").find("input:checked").val();

        if (ifValue) {
            var isRequired = (ifValue.localeCompare("Yes") === 0);//selected value is "Yes", this field is required

            if (isRequired) {
                //Previous contract number required to have 'FERC15F1234' and less than 20 alphanumeric characters and no special characters
                Regex = "^(FERC)[a-zA-Z0-9]{1,15}$";//match 'FERC15F1234' and less than 20 alphanumeric characters and no special characters
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_CONTRACT_NUMBER + "']");
                isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "If 'Have you acquired this product/service before?' is Yes, then 'Previous Contract Number' must have value of 'FERC15F1234' and less than 20 alphanumeric characters and no special characters.");

                //IF BPA Call - same above rule, becuase previous contract number is replaced by previous bpa number
                //rule 2.1: If 'Have you acquired this product/service before?' is Yes, then 'Previous BPA Number' is required to have 'FERC-' and maximum 20 characters
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_BPA_NUMBER + "']");
                isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "If 'Have you acquired this product/service before?' is Yes, then 'Previous BPA Number' must have value of 'FERC15F1234' and less than 20 alphanumeric characters and no special characters.");




                //rule 2.1: If 'Have you acquired this product/service before?' is Yes, then 'Previous Contractor Name' is required                
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_CONTRACTOR_NAME + "']");
                isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "If 'Have you acquired this product/service before?' is Yes, then 'Previous Contractor Name' is required");


            }
            else//this else is to remove validation error if previous click has error
            {
                //format check for previous contract number if it is provided
                Regex = "^(FERC)[a-zA-Z0-9]{0,15}$";//'FERC15F1234' and less than 20 alphanumeric characters and no special characters
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_CONTRACT_NUMBER + "']");
                isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "'Previous Contract Number' must have value of 'FERC15F1234' and less than 20 alphanumeric characters and no special characters.");

                //format check for Previous BPA Call if it is provided (in BPA Call request)
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_BPA_NUMBER + "']");
                isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "If 'Have you acquired this product/service before?' is Yes, then must have value of 'FERC15F1234' and less than 20 alphanumeric characters and no special characters.");


                //scenario: 
                //user select Yes in prevous and have to provide Previous Contractor Name
                //he does not provide and got error
                //he then change the previous question to 'No', Previous Contractor Name is not require any more
                //but the code never run to clear the error in previous if statement
                //that why we need to write this block to clear it out.
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_CONTRACTOR_NAME + "']");
                isValidated = true;//always true because value is not required, use to remove error from previous fail validation
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, ASD_String_Constant.Empty);


            }

        }
        else//the field "Have you requested this service before" is not on the form (For example Administrative), check the format of 2 fields only
        {
            //format check for previous contract number if it is provided
            Regex = "^(FERC)[a-zA-Z0-9]{0,15}$";//'FERC15F1234' and less than 20 alphanumeric characters and no special characters
            controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_CONTRACT_NUMBER + "']");
            isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "'Previous Contract Number' must have value of 'FERC15F1234' and less than 20 alphanumeric characters and no special characters.");

            //format check for Previous BPA Call if it is provided (in BPA Call request)
            controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.PREVIOUS_BPA_NUMBER + "']");
            isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "If 'Have you acquired this product/service before?' is Yes, then must have value of 'FERC15F1234' and less than 20 alphanumeric characters and no special characters.");

        }

        //rule 3,4,5
        ifValue = "";//reset value to avoid carry value from previous rule                
        if (REQSTATUS) {

            //"IN-REVIEW" and "AO APPROVED" are 2 status that is ready to go to ASSIGNED             
            if (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.ASSIGN) === 0) {//and user Action is assign, based on the wf, the next status will be assign,
                //Do all validation for the ASSIGNED status
                //rule 3: ASD Action is required from REQ Status is Assigned (REQ Stastus not in {Draft, Incomplete, Not Approve,Submitted,AO Approve })
                //ASD Action is required have value different than "Please Select"          
                //this field is updated by wf 
                //controlToBeValidated = jQuery("select[title^='" + ASD_Enum_Field.ASD_ACTION + "']");
                //isValidated = !ASD_CustomValidation.isSelectedInDropdownEqual(controlToBeValidated, ASD_Enum_FieldChoice.PLEASE_SELECT);
                //ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "ASD Action is required after REQ Status is Assigned");

                //rule 4: PALT Type is required to have different value then "Please Select" (I put the rule 4 here becuase it have same condition)
                controlToBeValidated = jQuery("select[title^='" + ASD_Enum_Field.PALT_TYPE + "']");
                isValidated = !ASD_CustomValidation.isSelectedInDropdownEqual(controlToBeValidated, ASD_Enum_FieldChoice.PLEASE_SELECT);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "PALT Type is required after REQ Status is Assigned");

                //rule 5: Contract Specialist Assigned is required from REQ Status is assigned
                controlToBeValidated = jQuery("div[title^='" + ASD_Enum_Field.CONTRACT_SPECIALIST_ASSIGNED + "']").find("input:first");
                isValidated = ASD_CustomValidation.isPeoplePickerHasValue(controlToBeValidated);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, true, isValidated, validationResult, "Contract Specialist Assigned is required after REQ Status is Assigned");

            }
        }

        //rule 7: if ASD Action is "Solicitation Closed", Solicitation Closed Date is required
        ifValue = "";
        ifValue = jQuery("select[title^='" + ASD_Enum_Field.ASD_ACTION + "'] option:selected").text();
        if (ifValue) {
            if (ifValue.localeCompare(ASD_Enum_FieldChoice.SOLICITATION_CLOSED) === 0) {
                //ifvalue equals "Solicitation Closed"                
                controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.SOLICITATION_CLOSE_DATE + "']");
                isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "if ASD Action is 'Solicitation Closed', Solicitation Closed Date is required");
            }
        }

        //rule 8:Misc Details is required when Cancelling or Returning a request
        //If REQ Status = Submittted or Assigned and userAction = "Cancel", then Misc Details is required(based on the state machine workflow)    
        //rule: if user Action is Cancel Request or Requirement Cancel, then Misc Details is required.
        //if ((REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.SUBMITTED) === 0) || (REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.ASSIGNED) === 0)) {
        if ((sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.CANCEL_REQUEST) === 0) || (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.REQUIREMENT_CANCEL) === 0) ||
            (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.RETURN) === 0)) {
            //User click on Cancel, now Misc Details is require (Textarea)                
            controlToBeValidated = jQuery("textarea[title^='" + ASD_Enum_Field.MISC_DETAILS + "']");
            isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Misc Details is required when Cancelling or Returning a request");
        }

        //rule 9: Solicitation # required to have 'FERC15F1234' and less than 20 alphanumeric characters and no special characters
        controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.SOLICITATION_NUMBER + "']");
        ifValue = controlToBeValidated.val();
        if (ifValue) {//only check if ifValue is exist (it means controls exist, but jquery control always exist so we can not check on the control)
            Regex = "^(FERC)[a-zA-Z0-9]{0,15}$";//match 'FERC15F1234' and less than 20 alphanumeric characters and no special characters
            isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "'SOLICITATION #' required to have 'FERC15F1234' and less than 20 alphanumeric characters and no special characters");
        }

        //rule 10: User must attach required documents        
        var attachedDocument = jQuery("#idAttachmentsTable tr");
        isValidated = attachedDocument.length > 0;
        ASD_CustomValidation.setValidationResult(null, false, isValidated, validationResult, "Attached document(s) required");

        //rule 11: if Release a request, and Anticipated Award Date has value, then Delay Award Days is required.
        if (REQSTATUS.localeCompare(ASD_Enum_REQ_STATUS.HOLD) === 0) {
            if ((sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.RELEASE) === 0) ||
                (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.ASSIGN) === 0) ||
                (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.REVIEW) === 0) ||
                    (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.AWARD) === 0)) {

                var anticipatedAwardDateControl = jQuery("input[title^='" + ASD_Enum_Field.ANTICIPATED_AWARD_DATE + "']");
                if (ASD_CustomValidation.isTextBoxHasValue(anticipatedAwardDateControl)) {
                    controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.DELAY_AWARD_DAYS + "']");
                    isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
                    ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Delay Award Days is required when removing Hold");
                }
            }
        }

        //rule 12 - Mod # is limit to 10 numeric character
        Regex = "^[0-9]{0,10}$";//limit 5 numeric
        controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.MOD_NUMBER + "']");
        isValidated = ASD_CustomValidation.isTextBoxMatchValue(controlToBeValidated, Regex);
        ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Mod # is limited to 10 numeric digit");

        //rule 13:required fields when Award
        if (sys_UserAction.localeCompare(ASD_Enum_Sys_USERACTION.AWARD) === 0) {

            //Ultimate Completion Date is required when Awarding a request
            controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.ULTIMATE_COMPLETION_DATE + "']");
            isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Ultimate Completion Date is required when Awarding a request");

            //Funding is required when Awarding a request
            controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.FUNDING + "']");
            isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Funding is required when Awarding a request");

            //Notice of Intent is required when Awarding a request
            controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.NOTICE_OF_INTENT + "']");
            isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Notice of Intent is required when Awarding a request");

            //Recompete Package is required when Awarding a request
            controlToBeValidated = jQuery("input[title^='" + ASD_Enum_Field.RECOMPETE_PACKAGE + "']");
            isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, "Recompete Package is required when Awarding a request");
        }
    },

    requiredValidation: function (validationResult) {

        //REQ #: textbox
        ASD_CustomValidation.textBoxRequiredValidation(validationResult, ASD_Enum_Field.REQ_NUMBER, "REQ # is required");

        //REQ Value: textbox
        ASD_CustomValidation.textBoxRequiredValidation(validationResult, ASD_Enum_Field.REQ_VALUE, "REQ Value is required");

        //Project Title - textbox
        ASD_CustomValidation.textBoxRequiredValidation(validationResult, ASD_Enum_Field.PROJECT_TITLE, "Project Title is required");

        //COR - people
        ASD_CustomValidation.peoplePickerRequiredValidation(validationResult, ASD_Enum_Field.COR, "COR is required");

        //Desired Delivery/Start Date - textbox
        ASD_CustomValidation.textBoxRequiredValidation(validationResult, ASD_Enum_Field.DESIRED_DELIVERY_START_DATE, "Desired Delivery /Start Date is required");

        //Does product require maintenance - radio button
        ASD_CustomValidation.RadioButtonRequiredValidation(validationResult, ASD_Enum_Field.DOES_THE_PRODUCT_REQUIRE_MAINTENANCE_AND_SUPPORT, "'Does the product require Maintenance and Support?' is required");

        //Does this fully funded the contract - drop down
        ASD_CustomValidation.DropDownRequiredValidation(validationResult, ASD_Enum_Field.DOES_THIS_FULLY_FUND_THE_ACTION, "'Does this fully fund the action?' is required");

        //End User Office - drop down
        ASD_CustomValidation.DropDownRequiredValidation(validationResult, ASD_Enum_Field.END_USER_OFFICE, "End User Office is required");

        //Have you acquired this product/service before? - radio
        ASD_CustomValidation.RadioButtonRequiredValidation(validationResult, ASD_Enum_Field.HAVE_YOU_ACQUIRED_THIS_PRODUCT_SERVICE_BEFORE, "'Have you acquired this product/service before?' is required");

        //If IT product/service, have system compatibility requirements been defined? - radio
        ASD_CustomValidation.RadioButtonRequiredValidation(validationResult, ASD_Enum_Field.IF_IT_PRODUCT_SERVICE_HAVE_SYSTEM_COMPATIBILITY_REQUIREMENTS_BEEN_DEFINED, "'If IT product/service, have system compatibility requirements been defined?' is required");

        //Is this a one-time order? - radio
        ASD_CustomValidation.RadioButtonRequiredValidation(validationResult, ASD_Enum_Field.IS_THIS_A_ONE_TIME_ORDER, "'Is this a one-time order?' is required");

        //Is this an IT product/service? - drop down
        ASD_CustomValidation.DropDownRequiredValidation(validationResult, ASD_Enum_Field.IS_THIS_AN_IT_PRODUCT_SERVICE, "'Is this an IT product/service?' is required");

        //Option Year Value - text box
        ASD_CustomValidation.textBoxRequiredValidation(validationResult, ASD_Enum_Field.OPTION_YEAR_VALUE, "Option Year Value is required");

        //Period of Performance - textbox
        ASD_CustomValidation.textBoxRequiredValidation(validationResult, ASD_Enum_Field.ANTICIPATED_PERIOD_OF_PERFORMANCE, "Anticipated Period of Performance is required");
        
        //Reason for Request - textbox
        ASD_CustomValidation.textAreaRequiredValidation(validationResult, ASD_Enum_Field.REASON_FOR_REQUEST, "Reason for Request is required");

        

        //Submitting Office - drop down
        ASD_CustomValidation.DropDownRequiredValidation(validationResult, ASD_Enum_Field.SUBMITTING_OFFICE, "Submitting Office is required");

        //Suggested Source: textbox
        //ASD_CustomValidation.textBoxRequiredValidation( validationResult, ASD_Enum_Field.SUGGESTED_SOURCES, "Suggested Source is required" );

        //Technical Evaluation Team - people
        ASD_CustomValidation.peoplePickerRequiredValidation(validationResult, ASD_Enum_Field.TECHNICAL_EVALUATION_TEAM, "Technical Evaluation Team is required");

        //Will the services be required for more than one year? - dropdown
        ASD_CustomValidation.DropDownRequiredValidation(validationResult, ASD_Enum_Field.WILL_THE_SERVICES_BE_REQUIRED_FOR_MORE_THAN_ONE_YEAR, "'Will the services be required for more than one year?' is required");
    },

    peoplePickerRequiredValidation: function (validationResult, fieldName, errorMessage) {
        var controlToBeValidated = jQuery("div[title^='" + fieldName + "']").find("input:first");
        if (controlToBeValidated.length > 0) {
            var isValidated = ASD_CustomValidation.isPeoplePickerHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, true, isValidated, validationResult, errorMessage);
        }
    },

    textBoxRequiredValidation: function (validationResult, fieldName, errorMessage) {
        var controlToBeValidated = jQuery("input[title^='" + fieldName + "']");
        if (controlToBeValidated.length > 0) {//jquery always return object, need to check return array lengh
            var isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, errorMessage);
        }
    },

    textAreaRequiredValidation: function (validationResult, fieldName, errorMessage) {
        var controlToBeValidated = jQuery("textarea[title^='" + fieldName + "']");
        if (controlToBeValidated.length > 0) {//jquery always return object, need to check return array lengh
            var isValidated = ASD_CustomValidation.isTextBoxHasValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, errorMessage);
        }
    },

    //This method may cause performance issue becuase of the complicated selector, if we can change the radio button to dropdown box, it is simpler
    RadioButtonRequiredValidation: function (validationResult, fieldName, errorMessage) {
        var controlToBeValidated = jQuery(":contains('" + fieldName + "')").closest(".ferc-formlabel").next("td").find("table").first();;
        //var controlToBeValidated = jQuery(":contains('" + fieldName + "')").closest(".ferc-formbody").find("table").first();
        
        if (controlToBeValidated.length > 0) {
            {//jquery always return object, need to check return array lengh
                var selectedInput = controlToBeValidated.find("input:checked");//radio button controls
                var isValidated = selectedInput.length > 0;//there is a selection on the radio
                ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, errorMessage);
            }
        }
    },

    //check if dropdown has selected value
    DropDownRequiredValidation: function (validationResult, fieldName, errorMessage) {
        var controlToBeValidated = jQuery("select[title^='" + fieldName + "']");
        if (controlToBeValidated.length > 0) {//jquery always return object, need to check return array lengh
            var isValidated = ASD_CustomValidation.doesDropdownHasSelectedValue(controlToBeValidated);
            ASD_CustomValidation.setValidationResult(controlToBeValidated, false, isValidated, validationResult, errorMessage);
        }
    },

    //Check if REQ # is exist - case sensitive
    IsREQNumberUnique: function (siteURL, controltobeValidated) {
        var returnValue = false;

        if (controltobeValidated.length > 0) {
            try {
                var strReqNumberLowerCase = controltobeValidated.val().toLowerCase();

                //SharePoint 2013 does not allow filter on case-insensitive, not support tolower()
                //http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx#bk_supported

                var queryString = siteURL + "/_api/web/Lists/getByTitle('" + ASD_ListName.ASD_Request +
                "')/Items?$select=ID&$filter=(" + ASD_Request_InternalFieldName.REQ_Number +
                " eq '" + strReqNumberLowerCase + "')";

                $.ajax({
                    async: false,
                    url: queryString,
                    method: "GET",
                    headers: {
                        "accept": "application/json; odata=verbose"
                    },
                    success: function (data) {
                        if (data.d.results.length > 0) {
                            //REQ # is exist
                            //check if the existing REQ # is comming from this request
                            if (data.d.results[0].ID.toString().localeCompare(ASD_SPContextObj.ListItemId) === 0) {
                                returnValue = true;
                            } else {
                                returnValue = false;
                            }

                        } else {
                            returnValue = true;//unique, no other value
                        }
                    },
                    error: function (err) {
                        // Error
                        ASD_HelperScripts.insertLogListItem("Error: " + JSON.stringify(err));
                    }
                });
            }
            catch (err) {
                ASD_HelperScripts.insertLogListItem("Error: " + JSON.strcingify(err));
            }
        }
        return returnValue;
    }

};