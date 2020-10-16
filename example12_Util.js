
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


export {Util};
