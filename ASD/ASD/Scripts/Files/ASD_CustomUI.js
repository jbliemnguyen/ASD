//inspired from 
//http://www.markrackley.net/2013/08/29/easy-custom-layouts-for-default-sharepoint-forms/
///<reference path="ASD_Constant.js" />
"use strict";
var ASD_CustomUI = {
    replace: function () {
        var elem;
        //loop through all the spans in the custom layout        
        jQuery("tr.needtoconvert").each(function () {
            //get the display name from the custom layout
            var displayName = jQuery(this).attr("data-displayName");
            var isReadOnly = jQuery(this).attr("isReadOnly");
            elem = jQuery(this);
            //find the corresponding field from the default form and move it
            //into the custom layout
            jQuery("table.ms-formtable tr").each(function () {
                if (this.innerHTML.indexOf('FieldName="' + displayName + '"') !== -1) {
                    var cleanHtml = ASD_CustomUI.cleanupFormat(jQuery(this), isReadOnly);
                    cleanHtml.appendTo(elem);
                    return false;//break the loop
                }
            });

        });
    },

    //
    cleanupFormat: function (TRObj, isReadOnly) {
        //format the first td
        TRObj.find("td:first").removeClass("ms-formlabel").addClass("ferc-formlabel").removeAttr("nowrap");

        //reformat the second td
        TRObj.find("td:first").next().removeClass("ms-formbody").addClass("ferc-formbody");
        TRObj.find("h3").removeAttr("class");
        TRObj.find("nobr").contents().unwrap();
        if (isReadOnly) {
            TRObj.find("input").attr("disabled", "disabled");
            TRObj.find("textarea").attr( "disabled", "disabled" );
            //TRObj.find("a").attr("disabled", "disabled");
        }

        return TRObj;
    },

    //create html code to display requried document list for each content type
    createRequiredDocumentsList: function (contentType) {
        if (contentType.localeCompare(ASD_Enum_ContentType.PRODUCT) === 0)
        {
            //Product content type
            return "";

        }
    },

};

