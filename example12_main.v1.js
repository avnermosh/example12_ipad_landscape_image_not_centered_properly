
import {Vector3 as THREE_Vector3,
        Vector2 as THREE_Vector2,
        Box3 as THREE_Box3,
        Vector4 as THREE_Vector4,
        Scene as THREE_Scene,
        OrthographicCamera as THREE_OrthographicCamera,
        WebGLRenderer as THREE_WebGLRenderer,
        SpriteMaterial as THREE_SpriteMaterial,
        Sprite as THREE_Sprite,
        Quaternion as THREE_Quaternion,
        EventDispatcher as THREE_EventDispatcher,
        TextureLoader as THREE_TextureLoader,
        RGBFormat as THREE_RGBFormat,
        ClampToEdgeWrapping as THREE_ClampToEdgeWrapping,
        LinearFilter as THREE_LinearFilter
       } from './three.js-r120/build/three.module.js';

// } from 'https://cdn.jsdelivr.net/npm/three@0.120/build/three.module.js';

'use strict';


//////////////////////////////////////////////////////////////
// Model
//////////////////////////////////////////////////////////////

class Model {
    static createLayer = function () {
        console.log('BEG createLayer v1');

        this._$texturePaneWrapper = $('<div id="texture-pane-wrapper"></div>');
        this.texCanvasWrapper = $('<div id="texCanvasWrapper"></div>');

        this._$texturePaneWrapper.appendTo('#grid-container1');
        this._$texturePaneWrapper.append(this.texCanvasWrapper);

        let layer = new Layer();
        layer.initLayer();
        return layer;
    };

    static getSelectedLayer = function () {
        return this._selectedLayer;
    };
    
};

Model._selectedLayer = null;

//////////////////////////////////////////////////////////////
// Layer
//////////////////////////////////////////////////////////////

class Layer {
    constructor(){
        this.texturePanelPlugin = undefined;
        this.textureImageInfo = undefined;
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

        let titleStr = "BrowserDetect";
        let msgStr = navigator.userAgent + ', OS: ' +
            this._browserDetect.OS + ", Browser: " +
            this._browserDetect.browser + ", Version: " +
            this._browserDetect.version;
        toastr.success(msgStr, titleStr, Util.toastrSettings);
    };

    initLayer = function () {
        console.log('BEG initLayer'); 

        this.texturePanelPlugin = new TexturePanelPlugin();
        this.texturePanelPlugin.initTexturePanelPlugin();
    };
    
    // getBrowserDetect = function () {
    //     return this._browserDetect;
    // };

    // Returns blobUrl for image specified with imageFilename.
    getImageBlobUrl = async function (imageFilename) {
        let url = imageFilename;
        console.log('url', url); 
        
        let response = await fetch(url);
        if (!response.ok) {
            let msgStr = "Request rejected with status: " + response.status + ", and statusText: " + response.statusText;
            throw Error(msgStr);
        }
        
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
        // let selectedImageFilename = 'http://192.168.1.74/avner/img/7/7/exampleImg_3840_2160.jpg';
        let selectedImageFilename = 'https://cdn.jsdelivr.net/gh/avnermosh/example12_ipad_landscape_image_not_centered_properly/exampleImg_3840_2160.jpg';
        console.log('selectedImageFilename', selectedImageFilename); 
        
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
                let texturePanelPlugin = selectedLayer.texturePanelPlugin;
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

//////////////////////////////////////////////////////////////
// OrbitControlsUtils
//////////////////////////////////////////////////////////////

var OrbitControlsUtils = {};

OrbitControlsUtils.getRotationParams = function (imageOrientation) {
    // console.log('BEG OrbitControlsUtils.getRotationParams');
    
    let rotationVal = 0;
    let flipY = true;

    let selectedLayer = Model.getSelectedLayer();
    let browserDetect = selectedLayer._browserDetect;
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
    let browserDetect = selectedLayer._browserDetect;

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



//////////////////////////////////////////////////////////////
// Util
//////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////
// TexturePanelPlugin
//////////////////////////////////////////////////////////////

class TexturePanelPlugin {
    constructor(){
        this.texCamera;
        this.texScene;
        this.texRenderer;
        this.texControls;
        this.rotationVal = 0;
        this.flipY = true;
        this.textureSprite1;
        this.bbox;
        this.viewportExtendsOnX = false;
    };

    initTexturePanelPlugin() {
        console.log('BEG initTexturePanelPlugin');

        let left = -100;
        let right = 100;
        let top = 50;
        let bottom = -50;
        let near = -500;
        let far = 1000;

        this.texCamera = new THREE_OrthographicCamera(left, right, top, bottom, near, far);
        this.texCamera.position.set( 0, 0, 80 );
        this.texScene = new THREE_Scene();

        this.texRenderer = new THREE_WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true});
        
        this.texRenderer.domElement.id = 'canvasTex';
        this.texRenderer.setPixelRatio(window.devicePixelRatio);
        this.texRenderer.setClearColor(0XDBDBDB, 1); //Webgl canvas background color
        
        this.initializeOrbitControlsTex();

        $(window).resize(function () {
            console.log('BEG TexturePanelPlugin window resize2');
            let selectedLayer = Model.getSelectedLayer();
            let texturePanelPlugin = selectedLayer.texturePanelPlugin;

            let textureImageInfo = selectedLayer.textureImageInfo;
            console.log('textureImageInfo', textureImageInfo); 
            let materialTexture = Util.getNestedObject(textureImageInfo, ['data', 'material', 'map']);
            
            if(Util.isObjectValid(materialTexture))
            {
                let imageOrientation = textureImageInfo.imageOrientation;
                texturePanelPlugin.set_camera_canvas_renderer_and_viewport2(materialTexture, imageOrientation);
            }
        });

    };

    set_camera_canvas_renderer_and_viewport2(materialTexture, imageOrientation) {
        console.log('BEG set_camera_canvas_renderer_and_viewport2'); 

        let texCanvasWrapperSize = this.getTexCanvasWrapperSize();
        console.log('texCanvasWrapperSize22', texCanvasWrapperSize); 

        
        //////////////////////////////////////////////////
        // Set the texCamera
        // Create new camera that covers the entire image                     
        //////////////////////////////////////////////////

        let near = -500;
        let far = 1000;
        this.texCamera = new THREE_OrthographicCamera(-(materialTexture.image.width/2),
                                                      materialTexture.image.width/2,
                                                      materialTexture.image.height/2,
                                                      -(materialTexture.image.height/2),
                                                      near,
                                                      far);
        this.texCamera.position.set( 0, 0, TexturePanelPlugin.initialCameraHeightAboveGround );
        this.texControls.camera = this.texCamera;

        this.texCamera.updateProjectionMatrix();

        let retVal = OrbitControlsUtils.getScaleAndRatio((this.texCamera.right - this.texCamera.left),
                                                         (this.texCamera.top - this.texCamera.bottom),
                                                         imageOrientation);

        this.rotationVal = retVal.rotationVal;
        this.flipY = retVal.flipY;
        materialTexture.flipY = this.flipY;

        let material = new THREE_SpriteMaterial( { map: materialTexture,
                                                   color: 0xffffff,
                                                   rotation: this.rotationVal,
                                                   fog: true } );

        this.textureSprite1 = new THREE_Sprite( material );
        this.textureSprite1.position.set( 0, 0, 0 );
        this.textureSprite1.scale.set( retVal.scaleX, retVal.scaleY, 1 );
        
        //////////////////////////////////////////////////
        // Set the bbox for the textureSprite1
        //////////////////////////////////////////////////

        this.bbox = new THREE_Box3().setFromObject(this.textureSprite1);
        if(this.textureSprite1.material.rotation === 0)
        {
            // landscape
        }
        else
        {
            // portrait
            let minX = this.bbox.min.x;
            this.bbox.min.x = this.bbox.min.y;
            this.bbox.min.y = minX;

            let maxX = this.bbox.max.x;
            this.bbox.max.x = this.bbox.max.y;
            this.bbox.max.y = maxX;
        }

        //Add the mesh to the scene
        this.texScene.add(this.textureSprite1);
        
        this.updateCameraAndCanvasForTheSelectedImage(imageOrientation);
    };
    
    getBoundingBox() {
        return this.bbox;
    };

    doesViewportExtendOnX() {
        return this.viewportExtendsOnX;
    };

    initializeOrbitControlsTex() {
        // console.log('BEG initializeOrbitControlsTex'); 

        let texCanvasWrapperElement = document.getElementById('texCanvasWrapper');
        this.texControls = new OrbitControlsTexPane(this.texCamera, texCanvasWrapperElement);

        // need to set this.texCamera.position after construction of this.texControls
        this.texCamera.position.copy( TexturePanelPlugin.initialCameraHeightPosition );
        this.texCamera.zoom = 0.42;

        this.texControls.target.copy(this.texCamera.position);
        this.texControls.target.setY(0.0);
    };

    
    loadTextureImageToTexturePane(textureImageInfo) {
        console.log('BEG loadTextureImageToTexturePane');
        
        let texCanvasWrapper = $('#texCanvasWrapper');
        texCanvasWrapper.append(this.texRenderer.domElement);

        //Always remove everything from the scene when creating the meshes and adding them to the scene
        for (let i = this.texScene.children.length - 1; i >= 0; i--) {
            if(this.texScene.children[i].type == "Sprite")
            {
                this.texScene.remove(this.texScene.children[i]);
            }
        }
        
        let materialTexture = textureImageInfo.data.material.map;
        this.set_camera_canvas_renderer_and_viewport2(materialTexture, textureImageInfo.imageOrientation);
        
        TexturePanelPlugin.render2();
    };

    static render2() {
        // console.log('BEG TexturePanelPlugin render2');

        let selectedLayer = Model.getSelectedLayer();
        let texturePanelPlugin = selectedLayer.texturePanelPlugin;
        let texRenderer2 = texturePanelPlugin.texRenderer;
        let texScene2 = texturePanelPlugin.texScene;
        let texCam2 = texturePanelPlugin.texCamera;

        if(texRenderer2)
        {
            texRenderer2.render(texScene2, texCam2);
        }
    };

    getTexCanvasWrapperSize() {
        // console.log('BEG TexturePanelPlugin getTexCanvasWrapperSize');
        let texCanvasWrapper = $('#texCanvasWrapper');
        let texCanvasWrapperSize = {width: texCanvasWrapper.innerWidth(),
                                    height: texCanvasWrapper.innerHeight()};
        return texCanvasWrapperSize;
    };

    updateCameraAndCanvasForTheSelectedImage(imageOrientation) {
        console.log('BEG updateCameraAndCanvasForTheSelectedImage');

        let texCanvasWrapperSize = this.getTexCanvasWrapperSize();
        let guiWindowWidth = texCanvasWrapperSize.width;
        let guiWindowHeight = texCanvasWrapperSize.height;

        //////////////////////////////////////////////////////////////////////
        // Set the camera frustum, zoom to cover the entire image
        //////////////////////////////////////////////////////////////////////
        
        let imageWidth = Util.getNestedObject(this.textureSprite1, ['material', 'map', 'image', 'width']);
        let imageHeight = Util.getNestedObject(this.textureSprite1, ['material', 'map', 'image', 'height']);

        let retVal = this.texControls.setCameraAndCanvas(guiWindowWidth,
                                                         guiWindowHeight,
                                                         imageWidth,
                                                         imageHeight,
                                                         imageOrientation);


        /////////////////////////////////////////////////////////////////////////////////////
        // Scale the texture such that it fits the entire image
        /////////////////////////////////////////////////////////////////////////////////////

        this.textureSprite1.scale.set( retVal.scaleX, retVal.scaleY, 1 );
        this.viewportExtendsOnX = retVal.viewportExtendsOnX;
        this.texRenderer.setSize(texCanvasWrapperSize.width, texCanvasWrapperSize.height);
        this.texRenderer.setViewport( -retVal.canvasOffsetLeft,
                                      -retVal.canvasOffsetTop,
                                      retVal.canvasWidth,
                                      retVal.canvasHeight );

        this.texControls.setZoom(this.texControls.minZoom);
        
        this.texCamera.updateProjectionMatrix();
    };
};

TexturePanelPlugin.initialCameraHeightPosition = new THREE_Vector3(643, 603, 2000);
TexturePanelPlugin.initialCameraHeightAboveGround = 80;

$(window).load(function () {
    console.log('BEG windows.load()');
    
    var texturePanelPlugin = new TexturePanelPlugin();
    texturePanelPlugin.initTexturePanelPlugin();

    let selectedLayer = Model.getSelectedLayer();
    selectedLayer.loadTheSelectedImageAndRender();
    
    animate();
});

function animate() {
    requestAnimationFrame(animate);
    let selectedLayer = Model.getSelectedLayer();
    if(Util.isObjectValid(selectedLayer))
    {
        let texturePanelPlugin = selectedLayer.texturePanelPlugin;
        texturePanelPlugin.texControls.update();
        TexturePanelPlugin.render2();
    }
};


//////////////////////////////////////////////////////////////
// OrbitControlsTexPane
//////////////////////////////////////////////////////////////

class OrbitControlsTexPane extends THREE_EventDispatcher
{
    constructor(camera, domElement){
        super();
        // console.log('BEG construct OrbitControlsTexPane'); 
        this.domElement = ( Util.isObjectValid(domElement) ) ? domElement : document;
        
        if ( !camera.isOrthographicCamera ) {
            // sanity check
            throw new Error('camera is not orthographic');
        }
        this.camera = camera;

        // "target" sets the location of focus, where the camera orbits around
        // for texPane camera, it is alway the previous camera (position.x, position.x, 0), and
        // it gets updated to the new camera position (position.x, position.x, 0) after pan
        // so that the camera always look down (i.e. 90 degrees) at the target.
        this.target = new THREE_Vector3();
        
        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;
        
        this.offset = new THREE_Vector3();

        // so camera.up is the orbit axis
        this.quat = new THREE_Quaternion().setFromUnitVectors( this.camera.up, new THREE_Vector3( 0, 1, 0 ) );
        this.quatInverse = this.quat.clone().inverse();

        this.lastPosition = new THREE_Vector3();
        this.lastQuaternion = new THREE_Quaternion();
        this.cameraHeightAboveGround = 80;
        this.scale = 1;
        this.zoomChanged = false;
    };

    initOrbitControlsTexPane()
    {
        // console.log('BEG initOrbitControlsTexPane');
        this.domElement.activate();
    };

    setZoom(zoomFactor) {
        // console.log('BEG setZoom');
        this.camera.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, zoomFactor ) );
        this.camera.updateProjectionMatrix();
        this.zoomChanged = true;
    };

    update() {
        // console.log('BEG OrbitControlsTexPane::update()');
        
        // Set the camera above the target.
        this.camera.position.set( this.target.x, this.target.y, this.cameraHeightAboveGround );
        this.camera.lookAt( this.target );
        this.scale = 1;
        
        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > OrbitControlsTexPane.EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        let positionShift = this.lastPosition.distanceToSquared( this.camera.position );
        let condition3 = 8 * ( 1 - this.lastQuaternion.dot( this.camera.quaternion ) );

        if ( this.zoomChanged ||
             (positionShift > OrbitControlsTexPane.EPS) ||
             (condition3 > OrbitControlsTexPane.EPS) ) {

            this.lastPosition.copy( this.camera.position );
            this.lastQuaternion.copy( this.camera.quaternion );
            this.zoomChanged = false;

            let selectedLayer = Model.getSelectedLayer();
            let texturePlugin = selectedLayer.texturePanelPlugin;
            let bBox = texturePlugin.getBoundingBox();
            let viewportExtendsOnX = texturePlugin.doesViewportExtendOnX();
            if(bBox)
            {
                this.limitPanning(bBox, viewportExtendsOnX);
            }
            
            return true;
        }

        return false;
    };
    
    setCameraFrustumAndZoom(guiWindowWidth,
                            guiWindowHeight,
                            imageWidth,
                            imageHeight,
                            imageOrientation) {

        // console.log('BEG setCameraFrustumAndZoom');
        this.camera.left = -imageWidth/2;
        this.camera.right = imageWidth/2;
        this.camera.top = imageHeight/2;
        this.camera.bottom = -imageHeight/2;
        this.setZoom(this.minZoom);
        this.camera.updateProjectionMatrix();
    };

    setMinZoom2(guiWindowWidth,
                guiWindowHeight,
                imageWidth,
                imageHeight,
                canvasWidth,
                canvasHeight) {
        // console.log('BEG setMinZoom2');
        
        let image_w_h_ratio = imageWidth / imageHeight;
        let guiWindow_w_h_ratio = guiWindowWidth / guiWindowHeight;
        let canvas_w_h_ratio = canvasWidth / canvasHeight;

        let zoomFactor = 1;
        if(guiWindow_w_h_ratio > image_w_h_ratio)
        {
            // canvasWidth is smaller than guiWindowWidth
            zoomFactor = guiWindowHeight / canvasHeight;
        }
        else
        {
            zoomFactor = guiWindowWidth / canvasWidth;
        }

        this.minZoom = zoomFactor;

        // make sure that the current zoom is bounded by the new value of this.minZoom 
        this.setZoom(this.camera.zoom);
    };

    setCameraAndCanvas(guiWindowWidth,
                       guiWindowHeight,
                       imageWidth,
                       imageHeight,
                       imageOrientation) {
        // console.log('BEG setCameraAndCanvas');
        
        this.setCameraFrustumAndZoom(guiWindowWidth,
                                     guiWindowHeight,
                                     imageWidth,
                                     imageHeight,
                                     imageOrientation);
        
        let retVal0 = OrbitControlsUtils.getScaleAndRatio(imageWidth,
                                                          imageHeight,
                                                          imageOrientation);

        let scaleX = retVal0.scaleX;
        let scaleY = retVal0.scaleY;


        let isTexturePane = true;
        let retVal1 = OrbitControlsUtils.calcCanvasParams(guiWindowWidth,
                                                          guiWindowHeight,
                                                          imageWidth,
                                                          imageHeight,
                                                          isTexturePane);

        console.log('guiWindowWidth', guiWindowWidth);
        console.log('guiWindowHeight', guiWindowHeight);
        console.log('imageWidth', imageWidth); 
        console.log('imageHeight', imageHeight); 
        console.log('retVal1', retVal1);
        
        this.setMinZoom2(guiWindowWidth,
                         guiWindowHeight,
                         imageWidth,
                         imageHeight,
                         retVal1.canvasWidth,
                         retVal1.canvasHeight);

        this.setZoom(this.minZoom);
        this.camera.updateProjectionMatrix();

        let retVal = {
            scaleX: scaleX,
            scaleY: scaleY,
            viewportExtendsOnX: retVal1.viewportExtendsOnX,
            canvasOffsetLeft: retVal1.canvasOffsetLeft,
            canvasOffsetTop: retVal1.canvasOffsetTop,
            canvasWidth: retVal1.canvasWidth,
            canvasHeight: retVal1.canvasHeight
        };
        
        return retVal;
    };
    

    ///////////////////////////////////////////////////////////////////////////
    // limitPanning() insures that the image always covers the view window:
    // - The minimal zoom is set to 1, to prevent a case where the image is smaller than the view window 
    // - If the zoom is 1, the image covers the view window, and panning is disabled.
    // - If the zoom is bigger than 1, panning is enabled as long as the image covers the view window.
    ///////////////////////////////////////////////////////////////////////////

    limitPanning(bbox, viewportExtendsOnX) {
        console.log('BEG limitPanning'); 

        console.log('viewportExtendsOnX111111111111111111111111111111', viewportExtendsOnX);
        
        let x1 = this.camera.position.x + (this.camera.left / this.camera.zoom);
        let x3 = this.camera.position.x + (this.camera.right / this.camera.zoom);
        let x1a = Math.max(x1, bbox.min.x);
        
        let pos_x = 0;
        if((x1 <= bbox.min.x) && (x3 >= bbox.max.x))
        {
            // the camera view exceeds the image
            // Center the image (x axis) in the view window
            pos_x = (bbox.min.x + bbox.max.x) / 2;
        }
        else
        {
            let pos_x1 = x1a - (this.camera.left / this.camera.zoom);
            let x2 = pos_x1 + (this.camera.right / this.camera.zoom);
            let x2a = Math.min(x2, bbox.max.x);
            pos_x = x2a - (this.camera.right / this.camera.zoom);
        }
        
        let y1 = this.camera.position.y + (this.camera.bottom * this.minZoom / this.camera.zoom);
        let y1a = Math.max(y1, bbox.min.y);
        let pos_y1 = y1a - (this.camera.bottom * this.minZoom / this.camera.zoom);
        let y3 = this.camera.position.y + (this.camera.top * this.minZoom / this.camera.zoom);

        let pos_y = 0;
        if((y1 <= bbox.min.y) && (y3 >= bbox.max.y))
        {
            // the camera view exceeds the image
            // Center the image (y axis) in the view window
            pos_y = (bbox.min.y + bbox.max.y) / 2;
        }
        else
        {
            let y2 = pos_y1 + (this.camera.top * this.minZoom / this.camera.zoom);
            let y2a = Math.min(y2, bbox.max.y);
            pos_y = y2a - (this.camera.top * this.minZoom / this.camera.zoom);
        }
        
        // Limit the panning
        this.camera.position.set(pos_x, pos_y, this.camera.position.z);
        this.camera.lookAt(pos_x, pos_y, this.target.z);
        this.target.set(pos_x, pos_y, 0);

    };

};

OrbitControlsTexPane.EPS = 0.0001;


//////////////////////////////////////////////////////////////
// BrowserDetect
//////////////////////////////////////////////////////////////

// https://gist.github.com/2107/5529665

class BrowserDetect {

    // browser detect
    constructor(){

        this.dataBrowser = [{
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        }, {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        }, {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        }, {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        }, {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        }, {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
        }, {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }]
        
        this.dataOS = [{
	    string: navigator.platform,
	    subString: "Win",
	    identity: "Windows"
        }, {
	    string: navigator.platform,
	    subString: "Mac",
	    identity: "Mac"
        }, {
	    string: navigator.userAgent,
	    subString: "iPhone",
	    identity: "iPhone/iPod"
        }, {
	    string: navigator.platform,
	    subString: "Linux",
	    identity: "Linux"
        }]
    };
    
    init = function () {
	this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
	this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
	this.OS = this.searchString(this.dataOS) || "an unknown OS";
    };
    
    searchString = function (data) {
	for (var i = 0; i < data.length; i++) {
	    var dataString = data[i].string;
	    var dataProp = data[i].prop;
	    this.versionSearchString = data[i].versionSearch || data[i].identity;
	    if (dataString) {
		if (dataString.indexOf(data[i].subString) != -1) return data[i].identity;
	    } else if (dataProp) return data[i].identity;
	}
    };
    
    searchVersion = function(dataString) {
	var index = dataString.indexOf(this.versionSearchString);
	if (index == -1) return;
	return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    };

};


//////////////////////////////////////////////////////////////
// main code
//////////////////////////////////////////////////////////////

console.log('BEG main code'); 
Model._selectedLayer = Model.createLayer();
