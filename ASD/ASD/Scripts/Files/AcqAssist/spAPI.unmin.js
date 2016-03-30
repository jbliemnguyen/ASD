/*!
 * Created by Matthew Bramer
 * Released under the MIT license
 * Date: 2015-04-18
 */
window.$sp = window.$sp || {};
window.$sp.init = function () {
    (function (window, $) {
        "use strict";
        function findFormRow(v) {
            var $formBody = $("td.ms-formbody, td.ms-formbodysurvey"),
	            escapeRegExp = function (v) {
	                return v.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	            },
	            columnName = escapeRegExp(v),
	            rcommentValidation = new RegExp("(?:Field|FieldInternal)Name=\"" + columnName + "\"", "i"),
	            $columnNode = $formBody.contents().filter(function () {
	                return this.nodeType === 8 && rcommentValidation.test(this.nodeValue);
	            })
            // columnComment = $columnNode[0].nodeValue.trim()

            ;

            return $columnNode.closest("tr");
        }

        function buildUrl(v) {
            var rstartsWithHttp = /^http/i

            ;

            if (rstartsWithHttp.test(v)) {
                return v;
            }

            return v;
        }

        function getOdataHeader() {
            return "application/json;odata=verbose";
        }
        // http://stackoverflow.com/questions/647259/javascript-query-string
        function getQueryString() {
            var result = {}, queryString = location.search.substring(1),
				re = /([^&=]+)=([^&]*)/g,
				m;

            while (m = re.exec(queryString)) {
                result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
            }
            return result;
        }

        function get(url) {
            url = buildUrl(url);

            return $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                headers: {
                    "Accept": getOdataHeader()
                }
            });
        }
        /*
                function incorrectActionPressed() {
                    var message = "The action taken cannot be processed.";
                    SP.UI.Notify.addNotification(message, false);
        
                    return false;
                }
        */

        function customAction(action) {
            var appStates = enums.appStates,
            	fields = $sp.enums.columns,
            	// $dateSubmittedRow = $sp.findFormRow(fields.dateSubmitted),
                $sysUserAction = $sp.findFormRow(fields.systemAction).find("input"),
            	$reqStatus = $sp.findFormRow(fields.reqStatus).find("input"),
            	prevReqStatus = $reqStatus.val(),
            	// dateSubmitted = $dateSubmittedRow.find("input").val().trim(),
            	id = enums.qs.ID,
                wfOpts = {
                    name: "Acquisition Assistance Notification",
                    initiationParams: {
                        EmailType: action
                    }
                }
            ;

            // Update REQ Status.			
            // $reqStatus.val(action);
            // Set the workflow callback.
            $sp.wf.set_successHandler(function () {
                var wfName = this.name || this.subscription && this.subscription.get_name(),
                    message = "Workflow " + wfName + " has started."

                ;

                if (this.id) {
                    message = message.replace(".", "");
                    message += " on this item. ID: " + this.id;
                }

                SP.UI.Notify.addNotification(message, false);

                initiateSave();
            });

            // Submitted button could be pressed on initial render
            // of the new form.  The id will be null.  The 
            // workflow is set to autorun on new items to handle this.
            if (id) {
                wfOpts.id = id;
            } else if (action === appStates.submitted) {
                $sysUserAction.val(appStates.submitted);
                // Could be handled in workflow, but here it is.
                // Now this is handled within the workflow!
                // if (!dateSubmitted) {
                //    $dateSubmittedRow.find("input").val(moment().format("MM/DD/YYYY"));
                // }

                // Submit was pressed on NewForm.aspx.
                // Never fire workflow here b/c item doesn't exist.
                // Set the sysUserAction instead and check that value during workflow.
                // return $sp.wf.startWorkflow(wfOpts);
                // return to prevent workflow from firing on NewForm.aspx.
                return initiateSave();
            }

            if (action === appStates.assigned) {
                var isValidated = PreSaveAction(true);

                if (isValidated) {
                    $sp.wf.startWorkflow(wfOpts);
                }

                return;
            }

            // If cancelled, capture cancellation reasoning. 
            if (action === appStates.cancelled) {
                var $el = $("<div>")

                ;

                if (prevReqStatus === appStates.draft) {
                    $reqStatus.val(prevReqStatus);
                    return SP.UI.Notify.addNotification("You cannot cancel a request that isn't created.", false);
                }

                $el.html(
					"<div class='container'>" +
						"<textarea rows='6' cols='72'></textarea>" +
						"<div class='action'>" +
							"<button onclick='SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.OK, document.querySelector(&quot;.container > textarea&quot;).value);'>Save</button>" +
						"</div>" +
					"</div>"
				);

                SP.UI.ModalDialog.showModalDialog({
                    title: "Enter cancellation reason",
                    html: $el[0],
                    showClose: true,
                    width: 550,
                    height: 250,
                    dialogReturnValueCallback: function (result, returnValue) {
                        if (result === SP.UI.DialogResult.OK) {

                            //if Cancel, remove the class "ms-accenText" which determines "contract special assigned" is required
                            //or "Contract Specialist Assigned" is not required when Cancel
                            $sp.findFormRow(fields.contractSpecialist).find(".ms-accentText").remove();

                            $sp.findFormRow(fields.cancelledReason).find("textarea").val(returnValue);
                            $sp.wf.startWorkflow(wfOpts);
                            // initiateSave();
                        }
                    }
                });
            } else {
                var isValidated = PreSaveAction(true);

                if (isValidated) {
                    $sp.wf.startWorkflow(wfOpts);
                }
                // initiateSave();
            }
        }

        function initiateSave() {
            $("input[value='Save']").eq(0).click();
        }

        var enums = {
            appStates: {
                approved: "Approved",
                assigned: "Assigned",
                cancelled: "Cancelled",
                completed: "Completed",
                draft: "DRAFT",
                submitted: "Submitted"
            },
            columns: {
                title: "Title",
                contractSpecialist: "Contract_x0020_Specialist_x0020_",
                cor: "COR",
                dateSubmitted: "Date_x0020_Submitted",
                endUserOffice: "End_x0020_User_x0020_Office",
                reqStatus: "REQ_x0020_STATUS",
                submittingOffice: "Submitting_x0020_Office",
                cancelledReason: "CancellationReason",
                systemAction: "SysUserAction"
            },
            lists: {
                AcqAssist: {
                    displayName: "Acquisition Assistance",
                    staticName: "AcqAssist"
                }
            },
            qs: getQueryString()
        };

        window.$sp.customAction = customAction;
        window.$sp.enums = enums;
        window.$sp.get = get;
        window.$sp.queryStrings = enums.qs;
        window.$sp.findFormRow = findFormRow;

    }(window, window.jQuery));

    /* SharePoint Workflow API */
    window.$sp.wf = (function ($, undefined) {
        "use strict";
        var ctx,
	        web,
	        wfManager,
	        JS_SUFFIX = ".js",
	        SP_WORKFLOW_SERVICES = "SP.WorkflowServices",
	        SP_WORKFLOW_SERVICES_SCRIPT_NAME = SP_WORKFLOW_SERVICES + JS_SUFFIX,
	        risGuid = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
	        oDataHeader = "application/json;odata=verbose",
	        initializeVariables = function () {
	            ctx = SP.ClientContext.get_current();
	            web = ctx.get_web();
	            wfManager = SP.WorkflowServices.WorkflowServicesManager.newObject(ctx, web);
	        },
	        registerWFscripts = function () {
	            SP.SOD.registerSod(
	                SP_WORKFLOW_SERVICES_SCRIPT_NAME,
	                SP.Utilities.Utility.getLayoutsPageUrl(SP_WORKFLOW_SERVICES + JS_SUFFIX)
	            );
	            SP.SOD.executeFunc(
	                SP_WORKFLOW_SERVICES_SCRIPT_NAME,
	                SP_WORKFLOW_SERVICES + ".WorkflowServicesManager",
	                initializeVariables
	            );
	        },
	        init = function () {
	            SP.SOD.executeFunc(
	                "sp" + JS_SUFFIX,
	                "SP.ClientContext",
	                registerWFscripts
	            );
	        },
	        set_errorHandler = function (func) {
	            errorHandler = func;
	        },
	        errorHandler = function (sender, args) {
	            var message = this,
	                spError = args && args.get_message,
	                restAPIError = sender && sender.responseText

	            ;

	            if (this.id) {
	                message += " on item with ID: " + this.id;
	            }

	            SP.UI.Notify.addNotification(message, false);
	            console.log(message);

	            if (spError) {
	                console.log("Error:", args.get_message(), "\nStackTrace:", args.get_stackTrace());
	            }

	            if (restAPIError) {
	                console.log(restAPIError);
	            }
	        },
	        set_successHandler = function (func) {
	            successHandler = func;
	        },
	        successHandler = function (sender, args) {
	            var wfName = this.name || this.subscription && this.subscription.get_name(),
	                message = "Workflow " + wfName + " has started."

	            ;

	            if (this.id) {
	                message = message.replace(".", "");
	                message += " on this item. ID: " + this.id;
	            }

	            SP.UI.Notify.addNotification(message, false);
	        },
	        fireWfByName = function (sender, args) {
	            var subscription = this.subscription,
	                id = this.id,
	                initiationParams = this.initiationParams || {},
	                workflowType = this.workflowType,
	                workflows = subscription.getEnumerator(),
	                workflow,
	                foundWrkFlow = false

	            ;

	            while (workflows.moveNext()) {
	                workflow = workflows.get_current();

	                if (workflow.get_name() === this.name) {
	                    startWorkflow({
	                        subscriptionId: workflow.get_id(),
	                        id: id,
	                        initiationParams: initiationParams,
	                        workflowType: workflowType
	                    });

	                    foundWrkFlow = true;
	                    break;
	                }
	            }

	            if (!foundWrkFlow) {
	                errorHandler.call("Could not find workflow named: " + this.name);
	            }
	        },
	        fireWfBySubscription = function (sender, args) {
	            var subscription = this.subscription,
	                id = this.id,
	                initiationParams = this.initiationParams || {},
	                wfInstance = wfManager.getWorkflowInstanceService()

	            ;

	            // https://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.workflowservices.workflowinstanceservice_methods.aspx

	            if (id) {
	                wfInstance.startWorkflowOnListItem(subscription, id, initiationParams);
	            } else {
	                wfInstance.startWorkflow(subscription, initiationParams);
	            }

	            ctx.executeQueryAsync(
	                successHandler.bind(this),
	                errorHandler.bind("Could not fire workflow. SubscriptionId: " + this.subscriptionId)
	            );
	        },
	        startWorkflow = function (opt) {
	            var subscriptionService = wfManager.getWorkflowSubscriptionService(),
	                success,
	                error

	            ;

	            // different methods to fire workflows with 2013.
	            // https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.workflowservices.workflowsubscriptionservice_members.aspx
	            if (opt.subscriptionId) {
	                opt.subscription = subscriptionService.getSubscription(opt.subscriptionId);
	                ctx.load(opt.subscription);
	                success = fireWfBySubscription.bind(opt);
	                error = errorHandler.bind("Failed to load subscription: " + opt.subscriptionId);
	            } else {
	                opt.subscription = subscriptionService.enumerateSubscriptions();
	                ctx.load(opt.subscription);
	                success = fireWfByName.bind(opt);
	                error = errorHandler.bind("Failed to load workflow subscriptions.");
	            }

	            ctx.executeQueryAsync(
	                success,
	                error
	            );
	        },
	        removeDemCurlies = function (v) {
	            return v.replace(/{|}/g, "");
	        },
	        getListItemDeets = function (listUrl) {
	            return $.ajax({
	                type: "GET",
	                url: listUrl,
	                dataType: "json",
	                headers: {
	                    "Accept": oDataHeader,
	                    "Content-Type": oDataHeader
	                }
	            });
	        },
	        fire2010Workflow = function (data) {
	            var success,
	                listGuid = data.d.__metadata.uri.match(risGuid)[0],
	                itemId = data.d.GUID
	            ;

	            this.result = this.subscriptionService.startWorkflow(this.name, null, listGuid, itemId, this.initiationParams);
	            success = successHandler.bind(this);

	            ctx.executeQueryAsync(
	                success,
	                this.error
	            );
	        },
	        start2010Workflow = function (opt) {
	            var subscriptionService = wfManager.getWorkflowInteropService(),
	                wfName = opt.name,
	                id = opt.id,
	                itemGuid,
	                initiationParams = opt.initiationParams,
	                queryPrefix = "/_api/web/lists",
	                querySuffix = "/items(" + id + ")?$select=GUID",
	                // May need to do this later when ctx is dynamic.
	                // listUrl = web.get_url(),
	                listUrl = _spPageContextInfo.webAbsoluteUrl + queryPrefix,
	                listGuid,
	                errorMessage = "Failed to fire 2010 {0} Workflow.",
	                success,
	                error

	            ;

	            // Fire 2010 workflows!
	            // https://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.workflowservices.interopservice.startworkflow.aspx

	            // Not sure if opt.result is going to be helpful, but leaving it here for the meantime.
	            // If it is useful, then I'll bind it to the both handlers.
	            // If not, I'll drop it altogether.
	            if (id) {
	                listGuid = opt.list.match(risGuid);
	                if (listGuid) {
	                    listGuid = removeDemCurlies(listGuid[0]);
	                    listUrl += "(guid'" + listGuid + "')";
	                } else {
	                    listUrl += "/GetByTitle('" + opt.list + "')";
	                }

	                listUrl += querySuffix;

	                // converts numbers to strings.
	                id = id + "";
	                itemGuid = id.match(risGuid);

	                if (listGuid && itemGuid) {
	                    // List GUID and item GUID were provided, no need for API call.
	                    opt.result = subscriptionService.startWorkflow(wfName, null, listGuid, itemGuid[0], initiationParams);
	                    success = successHandler.bind(opt);
	                    error = errorHandler.bind(errorMessage.replace("{0}", "Site"));
	                } else {
	                    // Need to resolve List GUID and get the item GUID.
	                    opt.subscriptionService = subscriptionService;
	                    opt.error = errorHandler.bind(errorMessage.replace("{0}", "List"));

	                    return getListItemDeets.bind(opt)(listUrl)
	                        .then(fire2010Workflow.bind(opt), opt.error);
	                }
	            } else {
	                // Site WF
	                opt.result = subscriptionService.startWorkflow(wfName, null, null, null, initiationParams);
	                success = successHandler.bind(opt);
	                error = errorHandler.bind(errorMessage.replace("{0}", "Site"));
	            }

	            ctx.executeQueryAsync(
	                success,
	                error
	            );
	        }

        ;


        init();

        // TODO:
        // Look at custom events.
        // https://msdn.microsoft.com/en-us/library/office/dn481315.aspx
        // 2010 custom events.
        // https://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.workflowservices.interopservice.startworkflow.aspx
        // Add promises.
        return {
            set_errorHandler: set_errorHandler,
            set_successHandler: set_successHandler,
            startWorkflow: startWorkflow,
            start2010Workflow: start2010Workflow
        };
    }(window.jQuery));
};