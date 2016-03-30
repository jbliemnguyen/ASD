//http://sharepointbrian.com/2013/07/sharepoint-2013-check-user-in-spgroup-using-rest-in-javascript/
///<reference path="ASD_Constant.js" />
///<reference path="ASD_Object.js" />
"use strict";
var ASD_Authorization = {
    displaySections: function ( REQStatus, PreviousREQStatus ) {
        //populateData();//this method should be called first before any other methods becuase it load current user permission level
        //*******************************************************************
        var btnSubmit = jQuery( "a[id^='FERC.SharePoint.ASD.btnSubmit']" );
        var btnApprove = jQuery( "a[id^='FERC.SharePoint.ASD.btnApprove']" );
        var btnReject = jQuery( "a[id^='FERC.SharePoint.ASD.btnReject']" );
        var btnCancelRequest = jQuery( "a[id^='FERC.SharePoint.ASD.btnCancelRequest']" );
        var btnReview = jQuery( "a[id^='FERC.SharePoint.ASD.btnReview']" );
        var btnAssign = jQuery( "a[id^='FERC.SharePoint.ASD.btnAssign']" );
        var btnRequirementCancel = jQuery( "a[id^='FERC.SharePoint.ASD.btnRequirementCancel']" );
        var btnReturn = jQuery( "a[id^='FERC.SharePoint.ASD.btnReturn']" );
        var btnHold = jQuery( "a[id^='FERC.SharePoint.ASD.btnHold']" );
        var btnRelease = jQuery( "a[id^='FERC.SharePoint.ASD.btnRelease']" );
        var btnAward = jQuery( "a[id^='FERC.SharePoint.ASD.btnAward']" );
        var btnSave = jQuery( "a[id^='Ribbon.ListForm.Edit.Commit.Publish']" );
        var btnAttachFile = jQuery( "a[id^='Ribbon.ListForm.Edit.Actions.AttachFile']" );//Attach File has same visiblity of Save button
        //var btnDelete = jQuery("a[id^='Ribbon.ListForm.Edit.Actions.DeleteItem']")

        //*******************************************************************
        switch ( REQStatus ) {
            case ASD_Enum_REQ_STATUS.DRAFT:
            case ASD_Enum_REQ_STATUS.RETURNED:
            case ASD_Enum_REQ_STATUS.NOT_APPROVED:
                //IF REQStatus is DRAFT/InComplete/Rejected, 
                if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                    ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {
                    //External visible to: Submitting Office + creator, AO and COR
                    this.makeSectionsVisible( true, true, false );
                    //Save, Submit button visible to Submitting Office + creator, AO and COR
                    this.makeControlVisible( btnSave );
                    this.makeControlVisible( btnAttachFile );
                    this.makeControlVisible( btnSubmit );
                    if ( ASD_SPContextObj.serverRequestPath.indexOf( "NewForm.aspx" ) == -1 ) {//if not the new form, user can cancel the request
                        this.makeControlVisible( btnCancelRequest );
                    }

                }
                else {
                    ASD_HelperScripts.insertLogListItem("you don't have view permission");
                }
                break;
            case ASD_Enum_REQ_STATUS.SUBMITTED:
                //do somthing
                //external section visible to Submitting Offce, creator, AO and COR
                if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                    ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {
                    this.makeSectionsVisible( true, true, false );

                    if ( ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {//AO and COR can see the Save, Approve, Reject button
                        this.makeControlVisible( btnSave );
                        this.makeControlVisible( btnAttachFile );
                        this.makeControlVisible( btnApprove );
                        this.makeControlVisible( btnReject );
                    } else {//other (submitting office + creator) can see the Cancel Request button
                        this.makeControlVisible( btnCancelRequest );
                    }
                } else {
                    ASD_HelperScripts.insertLogListItem("you don't have view permission");
                }

                break;
            case ASD_Enum_REQ_STATUS.AO_APPROVED:
                //do somthing
                //extenal section visible to Submitting Offce + creator, AO and COR, CS group
                //external and internal section visible to CO group
                if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup ) {
                    this.makeSectionsVisible( true, true, true );
                    //CO can see Save, Review, Assign, Requirement Cancel, Return, Hold (if not On Hold)
                    this.makeControlVisible( btnSave );
                    this.makeControlVisible( btnAttachFile );
                    this.makeControlVisible( btnReview );
                    this.makeControlVisible( btnAssign );
                    this.makeControlVisible( btnRequirementCancel );
                    this.makeControlVisible( btnReturn );
                    

                    //HOLD button should be visible 
                    this.makeControlVisible( btnHold );


                } else {
                    if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                        ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {
                        this.makeSectionsVisible( true, true, false );
                    } else {
                        ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                    }
                }

                break;
            case ASD_Enum_REQ_STATUS.IN_REVIEW:
                //extenal section visible to Submitting Offce + creator, AO and COR
                //external and internal section visible to CO group
                if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup ) {
                    this.makeSectionsVisible( true, true, true );
                    //CO can see Save, Assign, Requirement Cancel, Return, Hold (if not On Hold)
                    this.makeControlVisible( btnSave );
                    this.makeControlVisible( btnAttachFile );
                    this.makeControlVisible( btnAssign );
                    this.makeControlVisible( btnRequirementCancel );
                    this.makeControlVisible( btnReturn );

                    //HOLD button should be visible 
                    this.makeControlVisible( btnHold );

                } else {
                    if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                        ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {
                        this.makeSectionsVisible( true, true, false );
                    } else {
                        ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                    }
                }
                break;
            case ASD_Enum_REQ_STATUS.ASSIGNED:
                //extenal section visible to Submitting Offce + creator, AO and COR
                //external and internal section visible to CO group, CS
                if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup || ASD_CurrentLoginPermissionLevel.isCS ) {
                    this.makeSectionsVisible( true, true, true );
                    if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup ) {//CO can see Save, Requirement Cancel, Return, Hold (if not on Hold), Award
                        this.makeControlVisible( btnSave );
                        this.makeControlVisible( btnAttachFile );
                        this.makeControlVisible( btnRequirementCancel );
                        this.makeControlVisible( btnReturn );
                        this.makeControlVisible( btnAward );

                        //HOLD button should be visible 
                        this.makeControlVisible( btnHold );

                    } else {//this is CS 
                        //CS can see the Save and Reward
                        this.makeControlVisible( btnSave );
                        this.makeControlVisible( btnAttachFile );
                        this.makeControlVisible( btnAward );
                    }
                } else {
                    if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                        ASD_CurrentLoginPermissionLevel.isAO ||
                        ASD_CurrentLoginPermissionLevel.isCOR ) {
                        this.makeSectionsVisible( true, true, false );
                    } else {
                        ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                    }
                }
                break;
            case ASD_Enum_REQ_STATUS.HOLD:
                //Copy from previous code above, don't write it
                //Need to change the btnHold to not display
                switch ( PreviousREQStatus ) {
                    case ASD_Enum_REQ_STATUS.AO_APPROVED:
                        //extenal section visible to Submitting Offce + creator, AO and COR, CS group
                        //external and internal section visible to CO group
                        if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup ) {
                            this.makeSectionsVisible( true, true, true );
                            //CO can see Save, Review, Assign, Requirement Cancel, Return, Hold (if not On Hold)
                            this.makeControlVisible( btnSave );
                            this.makeControlVisible( btnAttachFile );
                            this.makeControlVisible( btnReview );
                            this.makeControlVisible( btnAssign );
                            this.makeControlVisible( btnRequirementCancel );
                            this.makeControlVisible( btnReturn );

                            //HOLD button should be invisible - Release button visible for CO only
                            this.makeControlVisible( btnRelease);
                        } else {
                            if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                                ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {
                                this.makeSectionsVisible( true, true, false );
                            } else {
                                ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                            }
                        }

                        break;
                    case ASD_Enum_REQ_STATUS.IN_REVIEW:
                        //extenal section visible to Submitting Offce + creator, AO and COR
                        //external and internal section visible to CO group
                        if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup ) {
                            this.makeSectionsVisible( true, true, true );
                            //CO can see Save, Assign, Requirement Cancel, Return, Hold (if not On Hold)
                            this.makeControlVisible( btnSave );
                            this.makeControlVisible( btnAttachFile );
                            this.makeControlVisible( btnAssign );
                            this.makeControlVisible( btnRequirementCancel );
                            this.makeControlVisible( btnReturn );

                            //HOLD button should be invisible - Release button visible for CO only
                            this.makeControlVisible( btnRelease );

                        } else {
                            if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                                ASD_CurrentLoginPermissionLevel.isAO || ASD_CurrentLoginPermissionLevel.isCOR ) {
                                this.makeSectionsVisible( true, true, false );
                            } else {
                                ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                            }
                        }
                        break;
                    case ASD_Enum_REQ_STATUS.ASSIGNED:
                        //extenal section visible to Submitting Offce + creator, AO and COR
                        //external and internal section visible to CO group, CS
                        //change from above code: CS should not see Award button when it is On-Hold
                        if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup || ASD_CurrentLoginPermissionLevel.isCS ) {
                            this.makeSectionsVisible( true, true, true );
                            if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup ) { //CO can see Save, Requirement Cancel, Return, Hold (if not on Hold), Award
                                this.makeControlVisible( btnSave );
                                this.makeControlVisible( btnAttachFile );
                                this.makeControlVisible( btnRequirementCancel );
                                this.makeControlVisible( btnReturn );
                                this.makeControlVisible( btnAward );

                                //HOLD button should be invisible - Release button visible for CO only
                                this.makeControlVisible( btnRelease );
                            } else { //this is CS 
                                //CS can see the Save and Attach file
                                this.makeControlVisible( btnSave );
                                this.makeControlVisible( btnAttachFile );
                                //CS can not see award because request is Hold, only CO can Release it
                                this.makeControlVisible( btnAward );
                            }
                        } else {
                            if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                                ASD_CurrentLoginPermissionLevel.isAO ||
                                ASD_CurrentLoginPermissionLevel.isCOR ) {
                                this.makeSectionsVisible( true, true, false );
                            } else {
                                ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                            }
                        }
                        break;
                    default:
                        ASD_HelperScripts.insertLogListItem( "invalid Previous REQ Status: " + PreviousREQStatus );
                }
                break;//break of the HOLD outer switch
            case ASD_Enum_REQ_STATUS.REQUIREMENT_CANCEL:
            case ASD_Enum_REQ_STATUS.AWARDED:
            case ASD_Enum_REQ_STATUS.CANCEL_BY_REQUESTOR:
                //do somthing
                //extenal section visible to Submitting Offce, creator, AO,COR, End User
                //internal and external section visible to CS group, CO
                if ( ASD_CurrentLoginPermissionLevel.BelongsToCOGroup || ASD_CurrentLoginPermissionLevel.isCS ) {
                    this.makeSectionsVisible( true, true, true );
                    //CO and CS can see the Save and attach file so they can attach more files
                    this.makeControlVisible( btnSave );
                    this.makeControlVisible( btnAttachFile );
                } else {
                    if ( ASD_CurrentLoginPermissionLevel.BelongsToSubmittingOffice || ASD_CurrentLoginPermissionLevel.IsCreator ||
                        ASD_CurrentLoginPermissionLevel.isAO ||
                        ASD_CurrentLoginPermissionLevel.isCOR || ASD_CurrentLoginPermissionLevel.BelongsToEndUserGroup ) {
                        this.makeSectionsVisible( true, true, false );
                    } else {
                        ASD_HelperScripts.insertLogListItem( "you don't have view permission" );
                    }
                }
                break;
            default:
                ASD_HelperScripts.insertLogListItem( "invalid REQ Status: " + REQStatus );
        }
    },
    makeSectionsVisible: function ( headerSectionVisible, ExternalSectionVisible, InternalSectionVisible ) {
        if ( headerSectionVisible ) {
            jQuery( "#headerSection" ).removeClass( "invisible" );
        }

        if ( ExternalSectionVisible ) {
            jQuery( "#externalSection" ).removeClass( "invisible" );
        }

        if ( InternalSectionVisible ) {
            jQuery( "#internalSection" ).removeClass( "invisible" );
        }

    },
    makeControlVisible: function ( jQuerycontrol ) {
        jQuerycontrol.removeClass( "invisible" );
    },
};