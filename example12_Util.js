
var Util = {};

// list of colors
// https://www.imagemagick.org/script/color.php
// online color chooser
// https://www.htmlcsscolor.com/hex/00AA00
// color names
// https://www.htmlcsscolor.com/#wheel
Util.redColor = 0xff0000;
Util.greenColor = 0x00ff00;
Util.whiteColor = 0xffffff;
Util.yellowColor = 0xffff00;
Util.blueColor = 0x0000ff;
Util.islamicGreenColor = 0x00aa00;
Util.Gold = 0xFFD700;
Util.LavenderBlush1 = 0xFFF0F5;
Util.Orchid = 0xDA70D6;
Util.Orchid1 = 0xFF83FA;
Util.Orchid2 = 0xEE7AE9;
Util.Orchid3 = 0xCD69C9;
Util.darkOrangeColor = 0xFF8C00;
Util.sandyBrownColor = 0xF4A460;
Util.acquaColor = 0x00FFFF;

//////////////////////////////////////
// BEG File related utils
//////////////////////////////////////

Util.getFileTypeFromFilename = function (filename) {
    let fileExtention = Util.getFileExtention(filename);
    let fileType = undefined;
    switch(fileExtention) {
        case "":{
            fileType = undefined;
            break;
        }
        case "jpg":
        case "jpeg":
        case "JPG": {
            fileType = 'jpg';
            break;
        }
        case "png": {
            fileType = 'png';
            break;
        }
        case "mtl": {
            fileType = 'mtl';
            break;
        }
        case "obj": {
            fileType = 'obj';
            break;
        }
        case "json": {
            fileType = 'json';
            break;
        }
        case "zip": {
            fileType = 'zip';
            break;
        }
        case "txt": {
            fileType = 'txt';
            break;
        }
        default: {
            var msgStr = 'Failed to get fileType from fileExtension: ' + fileExtention;
            throw Error(msgStr);
        }
    }
    return fileType;
};

Util.getFileExtention = function (filename2) {
    // http://www.jstips.co/en/javascript/get-file-extension/
    var fileExt = filename2.slice((filename2.lastIndexOf(".") - 1 >>> 0) + 2);
    return fileExt;
};

Util.getPathElements = function (str) {
    // tbd - see if this can be replaced with
    // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/OSFile.jsm/OS.Path#Global_Object_OS.Path
    
    // https://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript
    // "/home/user/foo.txt" -> "/home/user", "foo", "txt"

    let location1 = str.lastIndexOf('/');
    let dirname = new String(str).substring(0, location1); 
    let basename = new String(str).substring(location1 + 1); 
    let extension = undefined;
    if(basename.lastIndexOf(".") != -1) {
        extension = basename.substring(basename.lastIndexOf(".") + 1);
        basename = basename.substring(0, basename.lastIndexOf("."));
    }
    let filename = basename + '.' + extension;
    
    let path_elements = {"dirname": dirname,
                         "basename": basename,
                         "extension": extension,
                         "filename": filename};
    
    return path_elements;
};

Util.filePathToFilename = function (file_path) {
    let filename = file_path.substring(file_path.lastIndexOf('/')+1);
    // console.log('filename', filename); 
    return filename;
};

//////////////////////////////////////
// END File related utils
//////////////////////////////////////
    
Util.isTouchDevice = function () {
    // console.log('BEG Util.isTouchDevice'); 
    let isTouchDevice1 = true;
    if ("ontouchstart" in document.documentElement)
    {
        isTouchDevice1 = true;
    }
    else
    {
        isTouchDevice1 = false;
    }
    return isTouchDevice1;
};

Util.isNumberInvalid = function (number) {
    let retval = false;
    if(Util.isObjectInvalid(number) || (isNaN(number)))
    {
        retval = true;
    }
    return retval;
};

Util.isObjectValid = function (object) {
    let retval = true;
    if( (object === undefined) || (object === null))
    {
        retval = false;
    }
    return retval;
};

Util.isObjectInvalid = function (object) {
    return !Util.isObjectValid(object);
};

Util.isStringValid = function (string) {
    return Util.isObjectValid(string);
};

Util.isStringInvalid = function (string) {
    return !Util.isStringValid(string);
};

Util.IsValidJsonString = function (str) {
    try {
        JSON.parse(str);
    }
    catch {
        return false;
    }
    return true;
}

// https://www.abeautifulsite.net/adding-and-removing-elements-on-the-fly-using-javascript
// add html elemnt dynamically
//
// variables:
// parentId - the id of the parent html element (e.g. '_3DtopDown')
// elementTag - the type of the html element (e.g. div)
// elementId - the id of the html element (e.g. 'note1Id')
// innerHtml - the content of the html element (can be another nested html element e.g. '<div id=editor1Id>')
// elementCssClass - the css class to attach to the newly created elementId (e.g. editorClass)
//
// will create the following structure, e.g.
// <div id="_3DtopDown">
//   <div id=note1Id>
//     <div id=editor1Id class=editorClass></div>
//   </div>
// </div>

Util.addElement = function (parentId, elementTag, elementId, innerHtml, elementCssClass) {
    // Adds an element to the document
    var parentEl = document.getElementById(parentId);
    var newElement = document.createElement(elementTag);
    newElement.setAttribute('id', elementId);
    newElement.setAttribute('class', elementCssClass);
    newElement.innerHTML = innerHtml;
    parentEl.appendChild(newElement);
};


// get nested object safely, using reduce
Util.getNestedObject = function (nestedObj, pathArr) {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
};


/**
 * Returns an the value of a parameter specified in the URL 
 * something like http://www.meshlabjs.net/?filterName=Create%20Sphere
 * 
 * @param {name} The name of the parameter to be retrieve
 * @returns {Array} The string with the value of that parameter. 
 * Strings are URI decoded, so you can put %20 inside to specify a 'space'
 * Returns an empty string if param with that name is found. 
 * It is used to specify name of a  filter at startup;
 */
Util.getURLParam = function(name) {
    name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/**
 * Returns an array without duplicates
 * @param {type} array The array to be cleaned
 * @returns {Array} The array without duplicates
 */
Util.arrayUnique = function (array) {

    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Util.deepCopy = function (otherObject) {
    let object1 = JSON.parse(JSON.stringify(otherObject));
    return object1;
};


Util.compareObjects = function (object1, object2) {
    let object1_str = JSON.stringify(object1);
    let object2_str = JSON.stringify(object2);

    console.log('object1_str', object1_str);
    console.log('object2_str', object2_str);
    
    let retval = (object1_str == object2_str);
    console.log('retval', retval);
    
    return retval;
};

// https://www.sitepoint.com/delay-sleep-pause-wait/
Util.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {Util};
