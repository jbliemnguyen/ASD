//http://fdc1s-sp23wfed2/sites/asd/_layouts/images/kpipepperslarge-0.gif - green
//http://fdc1s-sp23wfed2/sites/asd/_layouts/images/kpipepperslarge-1.gif - yellow
//http://fdc1s-sp23wfed2/sites/asd/_layouts/images/kpipepperslarge-2.gif - red

( function () {

    //   Initialize the variables for overrides objects
    var overrideCtx = {};
    overrideCtx.Templates = {};

    //overrideCtx.BaseViewID = 1;
    //overrideCtx.ListTemplateType = 11000;

    //Override applies only specified fields
    overrideCtx.Templates.Fields = {
        "_x004b_PI1": { "View": DisplayKPI },
    };

    
    
    //   Register the template overrides
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

} )();

function DisplayKPI( ctx ) {
    if ( ctx == null ) return '';
    var returnHtml = "";

    //Set up parameter - May need to change when deploy
    var greenIconLocation = "<img src='/_layouts/images/kpipepperslarge-0.gif' title='Not Due until {0}' height='16' width='16'></img>";
    var yellowIconLocation = "<img src='/_layouts/images/kpipepperslarge-1.gif' title='Due Today' height='16' width='16'></img>";
    var redIconLocation = "<img src='/_layouts/images/kpipepperslarge-2.gif' title='Pass Due Date' height='16' width='16'></img>";
    var holdIconLocation = "<img src='../Lists/Scripts/images/hold.jpg' title='On Hold' height='16' width='16'></img>";
    
    var reqStatus = ctx.CurrentItem.REQ_x0020_STATUS;
    var ctxAnticipatedAwardDate = ctx.CurrentItem.Anticipated_x0020_Award_x0020_Da;
    
    if (ctxAnticipatedAwardDate) {
        //check the status, only display icon when status = Assigned, In Review, AO Approve
        
        if (reqStatus.localeCompare("ASSIGNED") === 0) {
            var anticipatedAwardDate = new Date(ctxAnticipatedAwardDate);
            var today = (new Date()).setHours(0, 0, 0, 0); //dis-regard the time
            if (anticipatedAwardDate > today) {
                //green
                returnHtml = greenIconLocation.replace('{0}', ctxAnticipatedAwardDate);
            } else {
                if (anticipatedAwardDate < today) {
                    //red
                    returnHtml = redIconLocation;
                } else {
                    //yellow
                    returnHtml = yellowIconLocation;
                }
            }
        } else {
            if (reqStatus.localeCompare("HOLD") === 0) {
                //Display special icon when it is On-Hold        
                returnHtml = holdIconLocation;
            }
        }
    } else {
        if ( reqStatus.localeCompare( "HOLD" ) === 0 ) {
            //Display special icon when it is On-Hold        
            returnHtml = holdIconLocation;
        }
    }

    return returnHtml;
}


