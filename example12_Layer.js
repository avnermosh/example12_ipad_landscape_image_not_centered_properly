/* eslint-disable max-len */

/* global THREE*/
/* global Note*/

import {TextureLoader as THREE_TextureLoader,
        RGBFormat as THREE_RGBFormat,
        ClampToEdgeWrapping as THREE_ClampToEdgeWrapping,
        LinearFilter as THREE_LinearFilter,
        SpriteMaterial as THREE_SpriteMaterial,
        Sprite as THREE_Sprite        
       } from '../../include/three.js/three.js-r120/build/three.module.js';

import { Model } from "./example12_Model.js";
import { TexturePanelPlugin } from "./example12_TexturePanelPlugin.js";
import { Util } from "./example12_Util.js";
import { BrowserDetect } from "./example12_browser_detect.js";
import { ErrorHandlingUtil } from "./example12_ErrorHandlingUtil.js";
import { OrbitControlsUtils } from "./example12_OrbitControlsUtils.js";

class Layer {
    constructor(name){
        this.name = name;

        this.texturePanelPlugin = undefined;
        this.textureImageInfo = undefined;
        
        this._browserDetect = undefined;
        this.detectUserAgent();
    };

    getCurrentTextureImageInfo = function () {
        return this.textureImageInfo;
    };

    setCurrentTextureImageInfo = function (otherTextureImageInfo) {
        this.textureImageInfo = otherTextureImageInfo;
    };
    
    detectUserAgent = function () {
        console.log('BEG detectUserAgent1');
        
        this._browserDetect = new BrowserDetect();
        this._browserDetect.init();

        console.log('this._browserDetect.OS', this._browserDetect.OS);
        console.log('this._browserDetect.browser', this._browserDetect.browser);
        console.log('this._browserDetect.version', this._browserDetect.version);

        // raise a toast to show the browser type
        let titleStr = "BrowserDetect";
        let msgStr = navigator.userAgent + ', OS: ' +
            this._browserDetect.OS + ", Browser: " +
            this._browserDetect.browser + ", Version: " +
            this._browserDetect.version;
        toastr.success(msgStr, titleStr, ErrorHandlingUtil.toastrSettings);
    };
    

    initLayer = function () {
        console.log('BEG initLayer'); 

        this.texturePanelPlugin = new TexturePanelPlugin();
        this.texturePanelPlugin.initTexturePanelPlugin();
    };
    
    getBrowserDetect = function () {
        return this._browserDetect;
    };

    getTexturePanelPlugin = function () {
        return this.texturePanelPlugin;
    };

    // Returns blobUrl for image specified with imageFilename.
    getImageBlobUrl = async function (imageFilename) {
        // tbd = point to jsdelivr
        // e.g. https://localhost/avner/img/45/56/image_0.jpg

        // let url = 'https://cdn.jsdelivr.net/gh/avnermosh/example10_flipTextureOfSprite/landscapeOrientation.jpg';
        let url = imageFilename;
        console.log('url', url); 
        
        let response = await fetch(url);
        ErrorHandlingUtil.handleErrors(response);
        
        let blob = await response.blob()
        let blobUrl = URL.createObjectURL(blob);

        console.log('blobUrl', blobUrl); 
        return blobUrl;
    };
    
    loadTheSelectedImageAndRender = async function () {
        // console.log('BEG loadTheSelectedImageAndRender');
        
        // ok loads (see setup1 in notes)
        // let selectedImageFilename = 'http://localhost/avner/img/9/13/bar1_2048_1536.jpg';
        // let selectedImageFilename = 'http://localhost/avner/img/7/7/exampleImg_3840_2160.jpg';
        let selectedImageFilename = 'http://192.168.1.74/avner/img/7/7/exampleImg_3840_2160.jpg';
        
        let blobUrl = await this.getImageBlobUrl(selectedImageFilename);
        let imageOrientation = 6;
        await this.loadTextureFromFile(blobUrl, imageOrientation);

        return true;
    };

    
    loadTextureFromFile = async function (textureFileUrl, imageOrientation) {
        console.log('BEG loadTextureFromFile');
        
        return new Promise(async function(resolve, reject) {
            try{
                // the "await" causes to wait for the "resolve", or "reject" within onLoad_Texture (at the end)
                await new THREE_TextureLoader().loadAsync(textureFileUrl).then(onLoad_Texture, onProgress_TextureLoader, reject);
                resolve(true);
            } 
            catch(err){
                console.error('err', err); 
                let msgStr = 'Error while trying to load from THREE_TextureLoader.loadAsync. textureFileUrl: ' + textureFileUrl;
                console.error(msgStr); 
                reject(msgStr);
            }

            async function onLoad_Texture( texture2 ) {
                console.log('BEG onLoad_Texture1');
                // This anonymous function will be called when the texture2 has finished loading
                
                texture2.wrapS = THREE_ClampToEdgeWrapping;
                texture2.wrapT = THREE_ClampToEdgeWrapping;
                
                texture2.needsUpdate = true; // We need to update the texture2
                // Prevent warning when texture is not a power of 2
                // https://discourse.threejs.org/t/warning-from-threejs-image-is-not-power-of-two/7085
                texture2.minFilter = THREE_LinearFilter;
                // texture.generateMipmaps = false;

                let selectedLayer = Model.getSelectedLayer();
                let rotationParams = OrbitControlsUtils.getRotationParams(imageOrientation);
                let rotationVal = rotationParams.rotationVal;
                texture2.flipY = rotationParams.flipY;
                
                // https://stackoverflow.com/questions/36668836/threejs-displaying-a-2d-image
                var material2 = new THREE_SpriteMaterial( { map: texture2,
                                                            color: 0xffffff,
                                                            rotation: rotationVal,
                                                            fog: true } );
                
                var sprite2 = new THREE_Sprite( material2 );

                /////////////////////////////////////////////////////////////////////////
                // textureImageInfo stores information about the loaded image
                /////////////////////////////////////////////////////////////////////////

                let texComponentsTitle = "RGB";
                
                let textureImageInfo = {
                    fileName: textureFileUrl,
                    components: texComponentsTitle,
                    format: THREE_RGBFormat,
                    data: sprite2,
                    imageOrientation: imageOrientation
                };

                selectedLayer.textureImageInfo = textureImageInfo;
                
                // the texture image finished openning from file. Load the texture image onto the pane
                let texturePanelPlugin = selectedLayer.getTexturePanelPlugin();
                texturePanelPlugin.loadTextureImageToTexturePane(textureImageInfo);
                
                resolve(true);
            };
            
            // based on three.js/examples/webgl_loader_obj_mtl.html
            var onProgress_TextureLoader = function ( xhr ) {
                console.log('BEG onProgress_TextureLoader'); 
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
                }
            };
        });
    };

};

export { Layer };
