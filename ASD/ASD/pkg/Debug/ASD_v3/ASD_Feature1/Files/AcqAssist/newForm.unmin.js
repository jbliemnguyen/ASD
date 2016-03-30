/* main logic */
(function (window, $, undefined) {
    "use strict";
    $sp.renderForm = function () {
        var hiddenClass = "ms-hidden",
			formId = "#onetIDListForm",
			twirlyWhirly = {
			    "class": "pl-wait-gif",
			    src: "/asd/_layouts/15/images/spiral.gif"
			},
			fields = $sp.enums.columns,
			listDetails = $sp.enums.lists

        ;

        function setupForm() {
            var dfd = $.Deferred(),
                            $title = $sp.findFormRow(fields.title)
                                .find("input"),
                            $reqStatus = $sp.findFormRow(fields.reqStatus).find("input")

            ;



            //diabled Acquisition Request Number field
            $title.prop("disabled", true);
            
            $reqStatus.prop("disabled", true);
            

            $title.prepend("<img class='" + twirlyWhirly["class"] + "' src='" + twirlyWhirly.src + "' />");
            //$title.find("input").addClass(hiddenClass);


            $sp.findFormRow(fields.contractSpecialist).addClass(hiddenClass);
            
            $sp.findFormRow(fields.dateSubmitted).addClass(hiddenClass);
            $sp.findFormRow(fields.systemAction).addClass(hiddenClass);

            hideCustomActionButtons($reqStatus.val());
            // $("input[value='Save'], input[value='Cancel']").hide();

            $("head").append("<link href='/asd/Lists/Scripts/AcqAssist/form.css' rel='stylesheet' type='text/css' />");
            $("head").append("<link href='/asd/Lists/Scripts/asd.css' rel='stylesheet' type='text/css' />");

            //Liem
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
            

            
            return dfd.resolve().promise();
        }

        function removeCustomActionButtons($el, btnText) {
            var risValidButton = new RegExp(btnText + "|Save|^Cancel$", "i")
                // risValidButton = new RegExp(cancelledText + "|" + btnText + "|Save|Cancel", "i")

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

        function removeTwirlyWhirly() {
            $("." + twirlyWhirly["class"]).remove();
        }

        function getAcqNumber() {
            var lastAcqAssistItemUrl = "/asd/_api/web/lists/GetByTitle('" +
					listDetails.AcqAssist.displayName + "')/items?$orderby=ID desc&$top=1&$select=ID," + fields.title

            ;

            return $sp.get(lastAcqAssistItemUrl).then(
				updateAcqNumber,
				errorHandler.bind("Could not find the correct Acquisition Form #.")
			);
        }

        function updateAcqNumber(data) {
            var results = data.d.results,
				acqFormNum = generateAcqFormNum(moment(new Date()), results),
				$acqNumRow = $sp.findFormRow(fields.title),
				$input = $acqNumRow.find("input")

            ;

            $acqNumRow.find("." + twirlyWhirly["class"]).remove();
            $input.val(acqFormNum).removeClass(hiddenClass).prop("disabled", true);
            
            
            
            
            // Not sure if needed for PreSaveAction promise chain.
            // return true;
        }

        function generateAcqFormNum(now, data) {
            var isNewFiscalYear = now.isAfter(now.year() + "-09-30"),
				acqNum = "0001",
				acqNumMaxLength = 4,
				twoDigitYear,
				previousAcqNum

            ;

            if (isNewFiscalYear) {
                now.add(1, "y");
            }

            if (data.length) {
                previousAcqNum = data[0].Title;
                previousAcqNum = previousAcqNum.slice(-4);

                acqNum = parseInt(previousAcqNum, 10) + 1;
                acqNum = (acqNum + "").slice(-4);

                while (acqNum.length < acqNumMaxLength) {
                    acqNum = "0" + acqNum;
                }
            }

            twoDigitYear = (now.year() + "").slice(2, 4);
            return twoDigitYear + acqNum;
        }

        function errorHandler() {
            var that = this;

            removeTwirlyWhirly();
            ExecuteOrDelayUntilScriptLoaded(function () {
                var statusId = SP.UI.Status.addStatus(that);

                SP.UI.Status.setStatusPriColor(statusId, "Red");
            }, "sp.js");
        }

        window.PreSaveAction = function PreSaveAction() {
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
                var $this = $(this),
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

            
            return getAcqNumber().then(
            	function () {
            	    $sp.findFormRow(fields.reqStatus)
            			.find("input").prop("disabled", false);

            	    $sp.findFormRow(fields.title).find("input").prop("disabled", false);

            	    setTimeout(function () {
            	        if ($(".ms-formtable").find(".ms-formvalidation").length) {
            	            $("input[value='Save']").eq(0).click();
	                    }
            	    }, 250);

                    
            	    
            	    return true;
            	},
            	errorHandler.bind("Something went wrong while saving this form.  Refresh the browser to try and solve this problem.")
            	);
        };

        setupForm().done(getAcqNumber);
    };
}(window, jQuery));