
import { Util } from "./example12_Util.js";

var ErrorHandlingUtil = {};

ErrorHandlingUtil.handleErrors = async function (response, forceOkValToFalse) {

    if (!response.ok || Util.isObjectValid(forceOkValToFalse)) {
        // throw Error(response.statusText);
        // throw Error("Request rejected with status ${response.statusText}");
        let msgStr = "Request rejected with status: " + response.status + ", and statusText: " + response.statusText;
        throw Error(msgStr);
    }

    if (response.statusText == "offline" || response.url == "https://localhost/static/offline/offline.html") {
        // The response is from offline.html
        // - set the page to the content of offline.html (without reloading the page), and
        // - throw an error, (no point to continue the javascript process)

        let dataAsText = await response.text();
        // console.log('dataAsText', dataAsText);
        // console.log('response.statusText', response.statusText);
        // console.log('response.url', response.url);

        document.getElementsByTagName("html")[0].innerHTML = dataAsText;
        // console.log('document.getElementsByTagName("html")[0]', document.getElementsByTagName("html")[0]);
        // window.history.pushState({"html":dataAsText, "pageTitle":response.pageTitle}, "", queryUrl);

        let msgStr = "Network is offline. response status: " + response.status + ", response.statusText: " + response.statusText;
        throw Error(msgStr);
    }

    return response;
}

ErrorHandlingUtil.bootstrap_alert_success = function (message) {
    $('<div id="bootstrap_alert_success" class="alert alert-success alert-dismissible my-alerts fade show" role="alert">' + message + '<button type="button" class="close" data-dismiss="alert"><span>×</span></button></div>').appendTo($('#alert_placeholder'));
}

ErrorHandlingUtil.bootstrap_alert_warning = function (message) {
    $('<div id="bootstrap_alert_warning" class="alert alert-warning alert-dismissible my-alerts fade show" role="alert">' + message + '<button type="button" class="close" data-dismiss="alert"><span>×</span></button></div>').appendTo($('#alert_placeholder'));
}

ErrorHandlingUtil.bootstrap_alert_danger = function (message) {
    $('<div id="bootstrap_alert_danger" class="alert alert-danger alert-dismissible my-alerts fade show" role="alert">' + message + '<button type="button" class="close" data-dismiss="alert"><span>×</span></button></div>').appendTo($('#alert_placeholder'));
}

// let timeOutInMillisec = 8000;
let timeOutInMillisec = 2000;
let extendedTimeOutInMillisec = 2000;
let closeButton = true;
let closeDurationInMillisec = 1000;
ErrorHandlingUtil.toastrSettings = { "timeOut": timeOutInMillisec,
                                     "extendedTimeOut": extendedTimeOutInMillisec,
                                     "closeButton": closeButton,
                                     "closeDuration": closeDurationInMillisec};

export {ErrorHandlingUtil};
