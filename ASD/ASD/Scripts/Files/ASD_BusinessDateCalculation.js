///<reference path="ASD_Constant.js" />
var ASD_BusinessDateCalculation = {

    //input: fromDate: regular date format: MM-DD-YYYY
    //return: Next business date in string format
    getNextBusinessDate: function (siteURL, strFromDate, intNumberOfBusinessDays,strBusinessOffDateList) {
        var nextDate = moment(strFromDate);
        var isOffDate = false;
        for (i = 1; i <= intNumberOfBusinessDays; i++) {
            isOffDate = false;
            do {
                isOffDate = false;
                nextDate = nextDate.add(1, 'd');
                isOffDate = ((nextDate.day() === 0) || (nextDate.day() === 6) ||//checked date is weekend(sat or sun)
                (strBusinessOffDateList.indexOf(nextDate.format(ASD_String_Constant.BusinessDateFormat)) > -1));//checked date is off date

            } while (isOffDate);
        }
        return nextDate.format("MM/D/YYYY");//this format is used to set the calendar control before saving it back to sharepoint
    },
    
    getBusinessOffDaysList: function (siteURL) {
        try {
            var returnValue = ASD_String_Constant.Empty;
            $.ajax({
                async: false,
                url: siteURL + "/_api/web/Lists/getByTitle('" + ASD_ListName.BusinessOffDays + "')/Items",
                method: "GET",
                headers: {
                    "accept": "application/json; odata=verbose"
                },
                success: function (data) {
                    var listItems = data.d.results;
                    if (listItems.length > 0) {
                        //concatenate date into string by looping thru
                        jQuery.each(listItems, function (index, value) {
                            //use the format value string to make sure all format is the same when compare 
                            returnValue = returnValue + "_" + moment.utc(value["Date"]).format(ASD_String_Constant.BusinessDateFormat);
                        });
                    }

                },
                error: function (err) {
                    // Error
                    ASD_HelperScripts.insertLogListItem( "Error: " + JSON.stringify( err ));
                }
            });
            return returnValue;
        }
        catch ( err ) {
            ASD_HelperScripts.insertLogListItem( "Error: " + JSON.stringify( err ) );
        }
    },
};