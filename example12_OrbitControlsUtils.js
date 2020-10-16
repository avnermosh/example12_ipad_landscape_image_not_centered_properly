
import { Model } from "./example12_Model.js";
import { Layer } from "./example12_Layer.js";

import {Vector3 as THREE_Vector3
       } from '../../include/three.js/three.js-r120/build/three.module.js';


var OrbitControlsUtils = {};


OrbitControlsUtils.getRotationParams = function (imageOrientation) {
    // console.log('BEG OrbitControlsUtils.getRotationParams');
    
    let rotationVal = 0;
    let flipY = true;

    let selectedLayer = Model.getSelectedLayer();
    let browserDetect = selectedLayer.getBrowserDetect();
    console.log('browserDetect.11OS', browserDetect.OS);
    // console.log('browserDetect.browser', browserDetect.browser);
    // console.log('browserDetect.version', browserDetect.version);
    
    switch (imageOrientation) {
        case 6:
            {
                // portrait
                switch (browserDetect.OS) {
                    case 'Linux':
                    case 'Android':
                    case 'Windows':
                        {
                            switch( browserDetect.browser )
                            {
                                case 'Firefox':
                                {
                                    rotationVal = (0);
                                    flipY = true;
                                    break;
                                }
                                default:
                                {
                                    rotationVal = (-Math.PI / 2);
                                    flipY = true;
                                    break;
                                }
                            }
                            break;
                        }
                    case 'Mac':
                        {
                            switch( browserDetect.browser )
                            {
                                case 'Firefox':
                                case 'Safari':
                                {
                                    rotationVal = (0);
                                    flipY = true;
                                    break;
                                }
                                default:
                                {
                                    rotationVal = (-Math.PI / 2);
                                    flipY = true;
                                    break;
                                }
                            }
                            break;
                        }
                    case 'iOS':
                        {
                            rotationVal = 0;
                            flipY = true;
                            break;
                        }
                    default:
                        {
                            console.log('OS is not supported: ', browserDetect.OS, '. Using the default image orientation' ); 
                            break;
                        }
                }
                break;
            }
        default:
            {
                let msgStr = "imageOrientation is not supported: " + imageOrientation;
                console.error(msgStr); 
                console.error('Using the default orientation'); 
                rotationVal = 0;
                flipY = true;
                break;
            }
    }

    let rotationParams = {
        rotationVal: rotationVal,
        flipY: flipY
    };

    return rotationParams;
};

OrbitControlsUtils.getScaleAndRatio = function (width, height, imageOrientation) {
    // console.log('BEG OrbitControlsUtils.getScaleAndRatio');
    
    let scaleX = height;
    let scaleY = width;
    let selectedLayer = Model.getSelectedLayer();
    let browserDetect = selectedLayer.getBrowserDetect();

    scaleX = width;
    scaleY = height;
    switch (imageOrientation) {
        case 6:
            {
                // portrait
                switch (browserDetect.OS) {
                    case 'Linux':
                    case 'Android':
                    case 'Windows':
                        {
                            switch( browserDetect.browser )
                            {
                                case 'Firefox':
                                {
                                    scaleX = width;
                                    scaleY = height;
                                    break;
                                }
                                default:
                                {
                                    scaleX = height;
                                    scaleY = width;
                                    break;
                                }
                            }
                            break;
                        }
                    case 'Mac':
                        {
                            switch( browserDetect.browser )
                            {
                                case 'Chrome':
                                {
                                    scaleX = height;
                                    scaleY = width;
                                    break;
                                }
                                case 'Safari':
                                {
                                    scaleX = width;
                                    scaleY = height;
                                    break;
                                }
                                default:
                                {
                                    scaleX = width;
                                    scaleY = height;
                                    break;
                                }
                            }
                            break;
                        }
                    case 'iOS':
                        {
                            scaleX = width;
                            scaleY = height;
                            break;
                        }
                    default:
                        {
                            console.log('OS is not supported: ', browserDetect.OS, '. Using the default image orientation' ); 
                            break;
                        }
                }
                break;
            }
        default:
            {
                let msgStr = "imageOrientation is not supported: " + imageOrientation;
                console.error(msgStr); 
                console.error('Using the default orientation'); 
                // throw new Error(msgStr);

                scaleX = width;
                scaleY = height;
                break;
            }
    }

    let rotationParams = OrbitControlsUtils.getRotationParams(imageOrientation);

    let retVal = {
        scaleX: scaleX,
        scaleY: scaleY,
        rotationVal: rotationParams.rotationVal,
        flipY: rotationParams.flipY
    };

    return retVal;
};



OrbitControlsUtils.calcCanvasParams = function (guiWindowWidth,
                                                guiWindowHeight,
                                                imageWidth,
                                                imageHeight) {
    console.log('BEG calcCanvasParams');

    // canvasWidth, canvasHeight - the canvas size that preserves the aspectRatio of the image.
    // The canvas size exceeds the gui window, i.e. canvasWidth>=guiWindowWidth, canvasHeight>=guiWindowHeight
    // canvasWidth, canvasHeight is also the size of the viewport.
    let canvasWidth = 0;
    let canvasHeight = 0;

    // canvasOffsetLeft, canvasOffsetTop - offset from the orgin of the gui window to the origin of the canvas and the viewport
    let canvasOffsetLeft = 0;
    let canvasOffsetTop = 0;

    let guiWindow_w_h_ratio = guiWindowWidth / guiWindowHeight;
    let image_w_h_ratio = imageWidth / imageHeight;
    let viewportExtendsOnX = false;

    if(guiWindow_w_h_ratio > image_w_h_ratio)
    {
        console.log('foo1'); 
        // canvasHeight is bigger than guiWindowHeight
        canvasWidth = guiWindowWidth;
        canvasHeight = canvasWidth / image_w_h_ratio;
        
        canvasOffsetTop = (canvasHeight - guiWindowHeight) / 2;

        // canvasOffsetTop = (canvasHeight - guiWindowHeight) / 2.5;
        viewportExtendsOnX = false;
    }
    else
    {
        // canvasWidth is bigger than guiWindowWidth
        canvasHeight = guiWindowHeight;
        canvasWidth = canvasHeight * image_w_h_ratio;
        
        canvasOffsetLeft = (canvasWidth - guiWindowWidth) / 2;
        viewportExtendsOnX = true;
    }

    let canvasParams = {
        viewportExtendsOnX: viewportExtendsOnX,
        canvasOffsetLeft: canvasOffsetLeft,
        canvasOffsetTop: canvasOffsetTop,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
    };

    return canvasParams;
};


export {OrbitControlsUtils};
