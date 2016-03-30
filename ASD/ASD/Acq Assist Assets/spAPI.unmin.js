(function (window, $, undefined) {
    "use strict";
    window.$ferc = window.$ferc || { "version": "1.0.0.0" };

    var ctx,
        web,
        wfManager,
        SP_WORKFLOW_SERVICES = "SP.WorkflowServices",
        initializeVariables = function () {
            ctx = SP.ClientContext.get_current();
            web = ctx.get_web();
            wfManager = SP.WorkflowServices.WorkflowServicesManager.newObject(ctx, web);
        },
        registerWFscripts = function () {
            SP.SOD.registerSod(
                "sp.workflowservices.js",
                SP.Utilities.Utility.getLayoutsPageUrl(SP_WORKFLOW_SERVICES + ".js")
            );
            SP.SOD.executeFunc(
                SP_WORKFLOW_SERVICES + ".js",
                SP_WORKFLOW_SERVICES + ".WorkflowServicesManager",
                initializeVariables
            );
        },
        init = function () {
            SP.SOD.executeFunc(
                "sp.js",
                "SP.ClientContext",
                registerWFscripts
            );
        },
        errorHandler = function (sender, args) {
            SP.UI.Notify.addNotification(this, false);
            console.log(this.toString());
            console.log("Error:", args.get_message(), "\nStackTrace:", args.get_stackTrace());
        },
        fireWfByName = function (sender, args) {
            var subscription = this.subscription,
                id = this.id,
                workflows = subscription.getEnumerator(),
                workflow,
                foundWrkFlow = false

            ;

            while (workflows.moveNext()) {
                workflow = workflows.get_current();

                if (workflow.get_name() === this.name) {
                    startListWorkflow({
                        subscriptionId: workflow.get_id(),
                        id: id
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
            var subscriptionName = this.subscription.get_name(),
                id = this.id
            ;

            this.initiationParams = this.initiationParams || {};
            // WorkflowInstanceService.EnumerateInstancesForSite
            // https://msdn.microsoft.com/en-us/library/office/jj253966.aspx
            wfManager.getWorkflowInstanceService().startWorkflowOnListItem(this.subscription, this.id, this.initiationParams);

            ctx.executeQueryAsync(
                function (sender, args) {
                    var message = "The workflow " + subscriptionName + " was started on item with ID " + id;
                    SP.UI.Notify.addNotification(message, false);
                },
                errorHandler.bind("Failed to start workflow: " + subscriptionName + " on item with ID: " + id)
            );
        },
        startListWorkflow = function (opt) {
            var subscriptionService = wfManager.getWorkflowSubscriptionService(),
                success,
                error
            ;

            if (opt.subscriptionId) {
                opt.subscription = subscriptionService.getSubscription(opt.subscriptionId);
                ctx.load(opt.subscription);
                success = fireWfBySubscription.bind(opt);
                error = errorHandler.bind("Failed to load subscription: " + opt.subscriptionId);
            } else if (opt.listId) {
                opt.subscription = subscriptionService.enumerateSubscriptionsByList(opt.listId);
                ctx.load(opt.subscription);
                success = fireWfByName.bind(opt);
                error = errorHandler.bind("Failed to load list: " + opt.listId);
            }

            ctx.executeQueryAsync(
                success,
                error
            );
        },
        findFormRow = function findFormRow(v) {
            var $formBody = $("td.ms-formbody, td.ms-formbodysurvey"),
                // escapeRegExp taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                escapeRegExp = function (v) {
                    return v.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                },
                columnName = escapeRegExp(v),
                rcommentValidation = new RegExp("(?:FieldName|FieldInternalName)=\"" + columnName + "\"", "i"),
                $columnNode = $formBody.contents().filter(function () {
                    return this.nodeType === 8 && rcommentValidation.test(this.nodeValue);
                })

            ;

            return $columnNode.closest("tr");
        }

    ;


   

/* $spREST calls */
// TODO: Use $.extend for $.ajax calls.

    window.$sp.restInit = function (appUrl, hostUrl) {
        var _formDigest = "";
        var _odataType = "verbose";

        function getOdataHeader() {
            return "application/json;odata=" + _odataType;
        }

        function checkFormDigest(formDigest) {
            if (!formDigest) {
                formDigest = _formDigest;
            }

            return formDigest;
        }

        function buildUrl(url) {
            url = appUrl + url;
            if (hostUrl) {
                var api = "_api/";
                var index = url.indexOf(api);
                url = url.slice(0, index + api.length) +
                    "SP.AppContextSite(@target)" +
                    url.slice(index + api.length - 1);

                var connector = "?";
                if (url.indexOf("?") > -1 && url.indexOf("$") > -1) {
                    connector = "&";
                }

                url = url + connector + "@target='" + hostUrl + "'";
            }

            return url;
        }

        function getFormDigest() {
            return _formDigest;
        }

        function setFormDigest(formDigest) {
            _formDigest = formDigest;
        }

        function getOdataType() {
            return _odataType;
        }

        function setOdataType(odataType) {
            _odataType = odataType;
        }

        function get(url) {
            url = buildUrl(url);

            var call = jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                headers: {
                    "Accept": getOdataHeader()
                }
            });

            return call;
        }

        function create(url, body, formDigest) {
            formDigest = checkFormDigest(formDigest);

            url = buildUrl(url);

            var call = jQuery.ajax({
                url: url,
                type: "POST",
                data: body,
                headers: {
                    "Accept": getOdataHeader(),
                    "Content-Type": getOdataHeader(),
                    "X-RequestDigest": formDigest
                }
            });

            return call;
        }

        function update(url, body, etag, formDigest) {
            if (!etag) etag = "*";
            formDigest = checkFormDigest(formDigest);

            url = buildUrl(url);

            var call = jQuery.ajax({
                url: url,
                type: "POST",
                data: body,
                headers: {
                    "Accept": getOdataHeader(),
                    "Content-Type": getOdataHeader(),
                    "X-RequestDigest": formDigest,
                    "IF-MATCH": etag,
                    "X-Http-Method": "PATCH"
                }
            });


            return call;
        }

        function doDelete(url, formDigest) {
            formDigest = checkFormDigest(formDigest);

            url = buildUrl(url);

            var call = jQuery.ajax({
                url: url,
                type: "DELETE",
                data: body,
                headers: {
                    "Accept": getOdataHeader(),
                    "X-RequestDigest": formDigest,
                    "IF-MATCH": "*"
                }
            });
        }

        function failHandler(jqXHR, textStatus, errorThrown) {
            var response = "";
            try {
                var parsed = JSON.parse(jqXHR.responseText);
                response = parsed.error.message.value;
            } catch (e) {
                response = jqXHR.responseText;
            }
            alert("Call failed. Error: " + response);
        }
    }
/* End $spREST calls */

    init();


    window.$ferc.findFormRow = findFormRow;
    window.$ferc.get_formDigest = getFormDigest;
    window.$ferc.set_formDigest = setFormDigest;
    window.$ferc.get_odataType = getOdataType;
    window.$ferc.set_odataType = setOdataType;
    window.$ferc.get = get;
    window.$ferc.create = add;
    window.$ferc.update = update;
    window.$ferc["delete"] = doDelete;
    window.$ferc.failHandler = failHandler;
}( window, jQuery));