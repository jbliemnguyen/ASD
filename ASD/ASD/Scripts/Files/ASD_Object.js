/*jshint -W098*//*remove the warning 'variable is defied but never used'*/

/*jshint -W097*//*remove the warning 'use the function form of 'use strict''*/
///<reference path="ASD_Constant.js" />
///<reference path="ASD_Object.js" />
"use strict";
var ASD_CurrentLoginPermissionLevel = {
    BelongsToSubmittingOffice: false,
    IsCreator: false,
    isAO: false,
    isCOR: false,
    BelongsToCOGroup: false,
    isCS: false,
    BelongsToEndUserGroup: false,
    //method to reset the object to its initial state
    populateData: function () {
        var serverRequestPath = ASD_SPContextObj.serverRequestPath;
        //if newform.aspx, creator
        if (serverRequestPath.indexOf("NewForm.aspx") > -1) {
            this.BelongsToSubmittingOffice = false;//does not know yet when user first create the form
            this.IsCreator = true;
            this.isAO = false;//does not know yet when user first create the form
            this.isCOR = false;//does not know yet when user first create the form
            this.BelongsToCOGroup = false;//does not know yet when user first create the form
            this.isCS = false;//does not know yet when user first create the form
            this.BelongsToEndUserGroup = false;//does not know yet when user first create the form
            return;
        } else {
            if (serverRequestPath.indexOf("EditForm.aspx") > -1) {//edit form
                var LoginUserName = this.getLoginUserName( ASD_SPContextObj.siteAbsoluteUrl, ASD_SPContextObj.userId );

                //set the field "BelongstoSubmittingOffice"
                //var SubmittingOffice = ListData.Submitting_x0020_Office;
                var SubmittingOffice = ASD_SPContextObj.Submitting_Office;
                this.BelongsToSubmittingOffice = this.DoesUserBelongsToGroup( ASD_SPContextObj.siteAbsoluteUrl, ASD_SPContextObj.userId, SubmittingOffice );

                //Set the field "IsCreator"
                //var authorName = ListData.Author;//"2;#Liem Nguyen,#i:0#.w|adferc\\lnguyen,#,#,#Liem Nguyen"
                var authorName = ASD_SPContextObj.Author;

                authorName = authorName.split('|')[1].split(',')[0];
                this.IsCreator = (authorName.localeCompare(LoginUserName) === 0);

                //Set the field "IsAO"
                if (ASD_SPContextObj.Authorization_Official) {
                    var AOUserName = ASD_SPContextObj.Authorization_Official[0].Key.split("|")[1];//only 1 people allowed in COR field                    
                    this.isAO = (AOUserName.localeCompare(LoginUserName) === 0)
                }

                //set the field IsCOR
                if (ASD_SPContextObj.COR) {
                    var CORUserName = ASD_SPContextObj.COR[0].Key.split("|")[1];//required field, no need to check if value exist - only 1 people allowed in COR field                    
                    this.isCOR = (CORUserName.localeCompare(LoginUserName) === 0);
                }

                //Set the field BelongsToCOGroup
                this.BelongsToCOGroup = this.DoesUserBelongsToGroup( ASD_SPContextObj.siteAbsoluteUrl, ASD_SPContextObj.userId, ASD_Enum_Group.CO_Group );

                //Set the field IsCS
                if ((ASD_SPContextObj.CS) && (ASD_SPContextObj.CS.length > 0)) {
                    //this check is to prevent if CS is not assigned value
                    var ContractSpecialistAssigned = ASD_SPContextObj.CS[0].Key.split("|")[1];
                    this.isCS = (ContractSpecialistAssigned.localeCompare(LoginUserName) === 0);
                }

                //Set the field "BelongToEndUserGroup"
                if (ASD_SPContextObj.End_User_Office) {
                    var EndUserGroup = ASD_SPContextObj.End_User_Office;
                    this.BelongsToEndUserGroup = this.DoesUserBelongsToGroup( ASD_SPContextObj.siteAbsoluteUrl, ASD_SPContextObj.userId, EndUserGroup );
                }
            } else {
                ASD_HelperScripts.insertLogListItem( "Unknown Page: " + serverRequestPath );
            }
        }
    },

    //*********************************************************************
    //determine if current login user belongs to group. CSOM have this built -in functions, but this is for rest api call.
    DoesUserBelongsToGroup: function (siteURL, userId, groupName) {
        try {
            var returnValue = false;
            $.ajax({
                async: false,
                url: siteURL + "/_api/web/sitegroups()?$select=id&$filter=(Title eq '" + groupName + "')",
                method: "GET",
                headers: {
                    "accept": "application/json; odata=verbose"
                },
                success: function (groupData) {
                    var listResults = groupData.d.results;
                    if (listResults.length > 0) {
                        $.ajax({
                            async: false,
                            url: siteURL + "/_api/Web/SiteGroups/GetById(" + listResults[0].Id + ")/Users?$select=Id,Title&$filter=(Id eq " + userId + ")",
                            method: "GET",
                            headers: {
                                "accept": "application/json; odata=verbose"
                            },
                            success: function (userData) {
                                if (userData.d.results.length > 0) {                                    
                                    returnValue = true;
                                }
                                else {
                                    returnValue = false;
                                }
                            },
                            error: function (err) {
                                // Error
                                ASD_HelperScripts.insertLogListItem("Error: " +JSON.stringify(err));
                            }
                        });
                    }
                },
                error: function (err) {
                    // Error
                    ASD_HelperScripts.insertLogListItem( "Error: " + JSON.stringify( err ) );
                }

            });

            return returnValue;
        }
        catch ( err ) {
            ASD_HelperScripts.insertLogListItem( "Error: " + JSON.stringify( err ) );
        }
    },

    //*********************************************************************
    //make rest api call to get login user name
    getLoginUserName: function (siteURL, UserId) {
        var returnValue;
        jQuery.ajax({
            async: false,//login must be ready for further processing, 
            url: siteURL + "/_api/Web/GetUserById(" + UserId + ")",
            type: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            success: function (data) {
                var dataResults = data.d;
                //get login name    
                returnValue = dataResults.LoginName.split('|')[1];
            }

        });
        return returnValue;//return value should be return here, not above, or it will have undefine value??? don't know why
    }
};


//******************************************************************************************
//Object to centralize the action of getting context value
//issue: when we change field name --> internal field name change --> we may get wrong value --> 
//how to find this reference - open F12 in IE, search for object WPQ2FormCtx. You may need to copy entire object code 
//to another notepad to anaylyze and find the property name.
var ASD_SPContextObj = {
    ContentType: ASD_String_Constant.Empty,
    ListItemId: ASD_String_Constant.Empty,
    REQStatus: ASD_String_Constant.Empty,
    PreviousREQStatus: ASD_String_Constant.Empty,
    ASDAction: ASD_String_Constant.Empty,
    Submitting_Office: ASD_String_Constant.Empty,
    Author: ASD_String_Constant.Empty,
    Authorization_Official: ASD_String_Constant.Empty,
    COR: ASD_String_Constant.Empty,
    CS: ASD_String_Constant.Empty,
    End_User_Office: ASD_String_Constant.Empty,
    Date_Submitted: ASD_String_Constant.Empty,
    siteAbsoluteUrl: ASD_String_Constant.Empty,
    serverRequestPath: ASD_String_Constant.Empty,
    userId: ASD_String_Constant.Empty,
    AssignedDate: ASD_String_Constant.Empty,
    populateData: function () {
        if (typeof WPQ2FormCtx !== 'undefined')
        {
            var ListData = WPQ2FormCtx.ListData;
            ASD_SPContextObj.ContentType = ListData.ContentType;
            ASD_SPContextObj.ListItemId = WPQ2FormCtx.ItemAttributes.Id;
            ASD_SPContextObj.REQStatus = ListData.REQ_x0020_STATUS;
            ASD_SPContextObj.PreviousREQStatus = ListData.Previous_x0020_REQ_x0020_Status;
            ASD_SPContextObj.ASDAction = ListData.ASD_x0020_Action;
            ASD_SPContextObj.Submitting_Office = ListData.Submitting_x0020_Office;
            ASD_SPContextObj.Author = ListData.Author; //"2;#Liem Nguyen,#i:0#.w|adferc\\lnguyen,#,#,#Liem Nguyen"
            ASD_SPContextObj.Authorization_Official = ListData.Authorization_x0020_Official;
            ASD_SPContextObj.COR = ListData.COR;
            ASD_SPContextObj.CS = ListData.Contract_x0020_Specialist_x0020_;
            ASD_SPContextObj.End_User_Office = ListData.End_x0020_User_x0020_Office;
            ASD_SPContextObj.Date_Submitted = ListData.Date_x0020_Submitted;
            ASD_SPContextObj.AssignedDate = ListData.Assigned_x0020_Date;
        }

        //------------------------------------------------
        ASD_SPContextObj.siteAbsoluteUrl = _spPageContextInfo.siteAbsoluteUrl;
        ASD_SPContextObj.serverRequestPath = _spPageContextInfo.serverRequestPath;
        ASD_SPContextObj.userId = _spPageContextInfo.userId;
    },

};
