(function (window, document) {
    "use strict";
    var el = document.createElement("script"),
        head = document.getElementsByTagName("head")[0],
        formId = "#onetIDListForm",
		cssText = formId + "{ display: none; }",
        loadingAssetsError = "The JavaScript dependencies failed to load.  Try refreshing your browser to fix.",
   		hasErrorLoadingScripts = false,
		url = location.href.replace(/[\?#].*/, ""),
		risNewForm = /newForm\.aspx$/i,
		appAssetPath = "/asd/Lists/Scripts/AcqAssist/",
		fileName = (risNewForm.test(url)) ?
			"newForm.unmin.js" :
			"editForm.unmin.js",
		formScript = appAssetPath + fileName

    ;

    el.src = "/asd/Lists/Scripts/jquery-1.11.1.min.js";
    el.onload = init;
    head.parentNode.insertBefore(el, head);

    function init() {
        var error = errorHandler.bind(loadingAssetsError),
          dependencies = [
            "/asd/Lists/Scripts/moment.min.js",
            "/asd/Lists/Scripts/AcqAssist/spAPI.unmin.js"
          ],
          scriptsToLoad

        ;

        if (!risNewForm.test(url)) {
            // Hide form.
            addStyle(cssText);
        }

        // Prevents cache-busting, obvi.
        $.ajaxSetup({
            cache: true
        });

        scriptsToLoad = dependencies.map(function (v) {
            return $.getScript(v).error(error);
        });

        // Main logic.
        $.when.apply($, scriptsToLoad)
        	.then(loadFormJs, error)
            .then(initializeSP, error)
        ;
    }

    function loadFormJs() {
        return $.get(formScript);
    }

    function initializeSP() {
        $sp.init();
        $sp.renderForm();
    }

    function addStyle(v) {
        var node = document.createElement('style');

        node.id = "pl-hide-form";
        node.innerHTML = v;
        head.appendChild(node);
    }

    function errorHandler() {
        var that = this;

        if (!hasErrorLoadingScripts) {
            ExecuteOrDelayUntilScriptLoaded(function () {
                var statusId = SP.UI.Status.addStatus(that);

                SP.UI.Status.setStatusPriColor(statusId, "Red");
            }, "sp.js");
        }

        hasErrorLoadingScripts = true;
    }
}(window, document));