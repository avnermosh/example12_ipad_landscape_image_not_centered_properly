
var Util = {};

Util.isObjectValid = function (object) {
    let retval = true;
    if( (object === undefined) || (object === null))
    {
        retval = false;
    }
    return retval;
};


// get nested object safely, using reduce
Util.getNestedObject = function (nestedObj, pathArr) {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
};

Util.bootstrap_alert_success = function (message) {
    $('<div id="bootstrap_alert_success" class="alert alert-success alert-dismissible my-alerts fade show" role="alert">' + message + '<button type="button" class="close" data-dismiss="alert"><span>×</span></button></div>').appendTo($('#alert_placeholder'));
}

Util.toastrSettings = { "timeOut": 2000,
                        "extendedTimeOut": 2000,
                        "closeButton": true,
                        "closeDuration": 1000};

export {Util};
