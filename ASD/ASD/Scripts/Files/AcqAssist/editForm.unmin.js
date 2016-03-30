(function (window, $, undefined) {
    $sp.renderForm = function () {
        var hiddenClass = "ms-hidden",
			listDetails = $sp.enums.lists,
			fields = $sp.enums.columns,
			itemUrl = "/asd/_api/web/lists/GetByTitle('" + listDetails.AcqAssist.displayName +
				"')/items?$filter=(ID eq '" + $sp.queryStrings.ID +
				"')&$select=AuthorId,Contract_x0020_Specialist_x0020_Id,CORId"

        ;

        function getSiteGroups() {
            function getSiteGroupsIds(groups) {
                var reqStatus = $sp.findFormRow(fields.reqStatus).find("input").val(),
                    appStates = $sp.enums.appStates,
                    endUserOffice = $sp.findFormRow(fields.endUserOffice).find("select").val(),
					submittingOffice = $sp.findFormRow(fields.submittingOffice).find("select").val(),
                    runAuthorizedCOStatus = new RegExp("^" + appStates.draft + "$|^" + appStates.submitted + "$", "i"),
                    risAuthorizedEU_SOStatus = new RegExp("^" + appStates.draft + "$", "i"),
					risAuthorizedGroup = new RegExp("^" + endUserOffice + "$|^" + submittingOffice + "$", "i")

                ;

                groups = groups.d.results;

                return groups.filter(function (v) {
                    if (v.LoginName === "CO") {
                        // Not draft or submitted status
                        return !runAuthorizedCOStatus.test(reqStatus);
                    } else if (risAuthorizedEU_SOStatus.test(reqStatus)) {
                        // Request is in draft, return valid groups.
                        return risAuthorizedGroup.test(v.LoginName);
                    }
                }).map(function (v) {
                    return v.Id;
                });
            }

            return $sp.get("/asd/_api/web/sitegroups")
				.then(getSiteGroupsIds, errorHandler.bind("getSiteGroups failed."));
        }

        function getCurrentItem() {
            return $sp.get(itemUrl);
        }

        function renderForm() {
            var appStates = $sp.enums.appStates,
                $reqStatus = $sp.findFormRow(fields.reqStatus).find("input"),
                reqVal = $reqStatus.val()
            ;

            $("#pl-hide-form").remove();
            $("head").append("<link href='/asd/Lists/Scripts/AcqAssist/form.css' rel='stylesheet' type='text/css' />");
            $("head").append("<link href='/asd/Lists/Scripts/asd.css' rel='stylesheet' type='text/css' />");
            $reqStatus.prop("disabled", true);
            $sp.findFormRow(fields.title).find("input").prop("disabled", true);
            $sp.findFormRow(fields.cancelledReason).addClass(hiddenClass);
            $sp.findFormRow(fields.dateSubmitted).addClass(hiddenClass);

            hideCustomActionButtons(reqVal);

            if (reqVal === appStates.submitted || reqVal === appStates.draft) {
                $sp.findFormRow(fields.contractSpecialist).addClass(hiddenClass);
            }

	        if (
	            reqVal === appStates.assigned ||
	            reqVal === appStates.completed ||
                reqVal === appStates.approved
	        ) {
	            $sp.findFormRow(fields.contractSpecialist).find("h3.ms-standardheader")
	                .append("<span class='ms-accentText' title='This is a required field.'> *</span>");
	        }
            
            // $("input[value='Save'], input[value='Cancel']").hide();

            //number the fields for easy reference
            var j = 1;
	        jQuery("td > h3.ms-standardheader").each(function (i) {
	            if (!$(this).parent().parent().hasClass("ms-hidden")) {
	                $(this).prepend(j + ". ");
	                j = j + 1;
	            }
	        });

            //Add header for the form
	        jQuery("#listFormToolBarTop").next("span").next("span").text("Acquisition Assistance Request").addClass("headerSection");
        }

        function removeCustomActionButtons($el, btnText) {
            var cancelledText = "CancelRequest",
                risValidButton = new RegExp(cancelledText + "|" + btnText + "|Save|^Cancel$", "i")
                // risValidButton = new RegExp(cancelledText + "|" + btnText, "i")

            ;

            $el.filter(function (i, el) {
                var text = $(this).find(".ms-cui-ctl-largelabel").text();
                return !risValidButton.test(text);
            }).addClass(hiddenClass);
        }

        function hideCustomActionButtons(reqStatus) {
            var appStates = $sp.enums.appStates,
                $ribbonCustomActions = $("#Ribbon\\.ListForm\\.Edit\\.Commit").find("a")

            ;

            switch (reqStatus) {
                case appStates.draft:
                    removeCustomActionButtons($ribbonCustomActions, "Submit");

                    break;
                case appStates.submitted:
                    removeCustomActionButtons($ribbonCustomActions, "Approve");

                    break;
                case appStates.approved:
                    removeCustomActionButtons($ribbonCustomActions, "Assign");

                    break;
                case appStates.assigned:
                    removeCustomActionButtons($ribbonCustomActions, "Complete");

                    break;
                case appStates.completed:
                    $ribbonCustomActions.end().addClass(hiddenClass);

                    break;
            }
        }

        function numNullCheck(v) {
            return v || 0;
        }

        function isUserAuthorized(groupIds, itemResults) {
            var item = itemResults[0].d.results[0],
                corId = numNullCheck(item.CORId),
                csId = numNullCheck(item.Contract_x0020_Specialist_x0020_Id),
                authorId = numNullCheck(item.AuthorId),
				userId = _spPageContextInfo.userId,
				appStates = $sp.enums.appStates,
                reqVal = $sp.findFormRow(fields.reqStatus).find("input").val(),
				showForm = false,

				// groupMembershipUrl = "/asd/_api/Web/SiteGroups/GetById({0})/Users?$select=Id,Title&$filter=(Id eq '" + userId + "')",
                groupMembershipUrl = "/asd/_api/Web/SiteGroups/GetById({0})/Users?$select=Id,Title&$filter=(Id%20eq%20" + userId + ")",
                // groupMembershipUrl = "/asd/_api/web/sitegroups/GetById({0})/Users?$select=Id,Title"
                // groupMembershipUrl = "/_api/web/sitegroups(7)/users/getbyid(23)"
				promises
            ;

            function groupMembershipCheck() {
                var dfd = $.Deferred(),
                    arrUtil = [],
					args = arrUtil.slice.call(arguments),
                    isArray = Object.prototype.toString.call(args[0]) === '[object Array]'
                results = args.map(function (v) {
                    var data

                    ;

                    if (isArray) {
                        data = v[0].d.results;
                    } else {
                        data = v && v.d && v.d.results || [];
                    }

                    return data.length && data[0].Id;
                }),
                /*
                results = arrUtil.concat.apply([], args.map(function (v) {
                    return v[0].d.results.map(function(y) {
                        return y.Id;
                    });
                })),
                */
                hasGroupMembership = results.some(function (v) {
                    return v === userId;
                })

                ;

                if (hasGroupMembership) {
                    return dfd.resolve().promise();
                } else {
                    return dfd.reject().promise();
                }
            }

            switch (reqVal) {
                case appStates.draft:
                    if (authorId === userId) {
                        // User has access.
                        return $.Deferred().resolve().promise();
                    } else {
                        // Get group membership for currentUser	
                        promises = groupIds.map(function (v) {
                            var url = groupMembershipUrl.replace("{0}", v);

                            return $sp.get(url);
                        });

                        return $.when.apply($, promises)
                            .then(
                                groupMembershipCheck,
                                errorHandler.bind("Querying groupIds failed.")
                            )
                        ;
                    }

                case appStates.submitted:
                    if (corId === userId) {
                        // User has access.
                        return $.Deferred().resolve().promise();
                    } else {
                        // User doesn't have access to edit.
                        return $.Deferred().reject().promise();
                    }

                case appStates.approved:
                case appStates.assigned:
                    if (csId === userId) {
                        // User has access.
                        return $.Deferred().resolve().promise();
                    } else {
                        // Get CO group membership for currentUser
                        promises = groupIds.map(function (v) {
                            var url = groupMembershipUrl.replace("{0}", v);

                            return $sp.get(url);
                        });

                        return $.when.apply($, promises)
                            .then(
                                groupMembershipCheck,
                                errorHandler.bind("Querying groupIds failed.")
                            )
                        ;
                    }

                case appStates.cancelled:
                case appStates.completed:
                    // User doesn't have access to edit.
                    return $.Deferred().reject().promise();
            }
        }

        window.PreSaveAction = function PreSaveAction(doNotDisableControls) {
            var validated = true,
                $invalidEls = $(".ms-accentText").closest("tr").find("input:not(.sp-peoplepicker-editorInput), select").filter(function (i, el) {
                    var $this = $(this),
                    	value = $this.val(),
                    	isNotValid

                    ;

                    try {
                        value = JSON.parse(value);
                    } catch (e) {

                    }

                    // Handle people picker
                    if (Object.prototype.toString.call(value) === "[object Array]") {
                        if (value.length === 0) {
                            isNotValid = true;
                        } else {
                            isNotValid = value[0].IsResolved === false;
                        }
                    } else {
                        isNotValid = value === "";
                    }

                    return isNotValid;
                })

            ;
            
            $invalidEls.each(function (el, i) {
                var $this = $(this);
                isPeoplePicker = /HiddenInput$/i.test(this.id)

                ;

                validated = false;
                $this.closest("tr").addClass("pl-invalid");

                if (isPeoplePicker) {
                    $this = $this.siblings(".sp-peoplepicker-editorInput");
                }

                $this.one("change.pl-event keyup.pl-event paste.pl-event input.pl-event", function (event) {
                    $this.closest("tr").removeClass("pl-invalid");
                    $this.off(".pl-event");

                    $this = null;
                });
            });

            if (!validated) {
                return validated;
            }

            if (!doNotDisableControls) {
                $sp.findFormRow(fields.reqStatus)
                    .find("input").prop("disabled", false);

                $sp.findFormRow(fields.title)
                    .find("input").prop("disabled", false);
            }

            return true;
        };

        function errorHandler() {
            var that = this,
				$ribbonCmdsEdit = $("#Ribbon\\.ListForm\\.Edit\\.Commit"),
				$ribbonCmdsAction = $("#Ribbon\\.ListForm\\.Edit\\.Actions")

            ;

            $ribbonCmdsEdit.find(".ms-cui-ctl-large").slice(0, 6).addClass(hiddenClass);
            $ribbonCmdsAction.addClass(hiddenClass);
            ExecuteOrDelayUntilScriptLoaded(function () {
                var statusId = SP.UI.Status.addStatus(that);

                SP.UI.Status.setStatusPriColor(statusId, "Red");
            }, "sp.js");
        }

        // init.
        $.when(getSiteGroups(), getCurrentItem())
			.then(isUserAuthorized, errorHandler.bind("Site Group query failed."))
			.then(renderForm, errorHandler.bind("You do not have edit permissions."))
        ;
    };
}(window, jQuery));