/* eslint-disable max-len */
// //////////////////////////////////////////////////////////////
//
// The layer file is 
//
// //////////////////////////////////////////////////////////////

/* global THREE*/
/* global Note*/

import {Object3D as THREE_Object3D,
        MeshBasicMaterial as THREE_MeshBasicMaterial,
        SphereGeometry as THREE_SphereGeometry,
        Mesh as THREE_Mesh,
        Vector3 as THREE_Vector3,
        MeshPhongMaterial as THREE_MeshPhongMaterial, 
        DoubleSide as THREE_DoubleSide,
        Geometry as THREE_Geometry,
        Face3 as THREE_Face3, 
        Box3 as THREE_Box3,
        Vector2 as THREE_Vector2,
        Vector4 as THREE_Vector4,
        TextureLoader as THREE_TextureLoader,
        RGBFormat as THREE_RGBFormat,
        ClampToEdgeWrapping as THREE_ClampToEdgeWrapping,
        LinearFilter as THREE_LinearFilter,
        SpriteMaterial as THREE_SpriteMaterial,
        Sprite as THREE_Sprite        
       } from '../../include/three.js/three.js-r120/build/three.module.js';

import {CSS2DObject, CSS2DRenderer} from "../../include/CSS2DRenderer.js";
        
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
        
        this._browserDetect = undefined;
        this.detectUserAgent();
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

    getImageBlobUrlFromWebServer = async function (url) {
        console.log('BEG getImageBlobUrlFromWebServer'); 
        // The url is without /api/v1_2
        // so this causes a simple fetch (GET) via the browser 
        // and does NOT work through the backend api (i.e. python flask)
        
        // e.g. https://localhost/avner/img/45/56/IMG_6626.jpg
        let response = await fetch(url);
        ErrorHandlingUtil.handleErrors(response);
        
        let blob = await response.blob()
        let blobUrl = URL.createObjectURL(blob);
        return blobUrl;
    };
    
    // Returns blobUrl for image specified with imageFilename.
    getImageBlobUrl = async function (imageFilename) {
        // tbd = point to jsdelivr
        // e.g. https://localhost/avner/img/45/56/image_0.jpg
        // let url = Model.getUrlBase() + Model.getUrlImagePathBase() +
        //     '/' + this.planInfo.siteId + '/' +
        //     this.planInfo.id + '/' + imageFilename;

        // let url = 'https://cdn.jsdelivr.net/gh/avnermosh/example10_flipTextureOfSprite/landscapeOrientation.jpg';
        let url = imageFilename;
        console.log('url', url); 
        
        let blobUrl = await this.getImageBlobUrlFromWebServer(url);
        console.log('blobUrl', blobUrl); 
        return blobUrl;
    };

    
    loadTheSelectedImageAndRender = async function () {
        // console.log('BEG loadTheSelectedImageAndRender');
        
        // Get the image blobUrl from memory, or from webserver
        // let selectedImageFilename = 'https://cdn.jsdelivr.net/gh/avnermosh/example10_flipTextureOfSprite/landscapeOrientation.jpg';
        // let selectedImageFilename = 'https://cdn.jsdelivr.net/gh/avnermosh/example12_ipad_landscape_image_not_centered_properly/foo1_3840_2160.jpg';
        let selectedImageFilename = 'https://cdn.jsdelivr.net/gh/avnermosh/example12_ipad_landscape_image_not_centered_properly/exampleImg_3840_2160.jpg';
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
                console.log('BEG onLoad_Texture');
                // This anonymous function will be called when the texture2 has finished loading
                
                texture2.wrapS = THREE_ClampToEdgeWrapping;
                texture2.wrapT = THREE_ClampToEdgeWrapping;
                
                texture2.needsUpdate = true; // We need to update the texture2
                // Prevent warning when texture is not a power of 2
                // https://discourse.threejs.org/t/warning-from-threejs-image-is-not-power-of-two/7085
                texture2.minFilter = THREE_LinearFilter;
                // texture.generateMipmaps = false;

                let selectedLayer = Model.getSelectedLayer();
                if(Util.isObjectInvalid(selectedLayer))
                {
                    throw new Error('Selected layer is invalid');
                }

                let rotationParams = OrbitControlsUtils.getRotationParams(imageOrientation);
                let rotationVal = rotationParams.rotationVal;
                let flipY = rotationParams.flipY;

                texture2.flipY = flipY;
                
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
