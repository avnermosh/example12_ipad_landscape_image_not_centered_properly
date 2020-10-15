
import {Vector3 as THREE_Vector3,
        Vector2 as THREE_Vector2,
        Box3 as THREE_Box3,
        Vector4 as THREE_Vector4,
        Scene as THREE_Scene,
        OrthographicCamera as THREE_OrthographicCamera,
        WebGLRenderer as THREE_WebGLRenderer,
        SpriteMaterial as THREE_SpriteMaterial,
        Sprite as THREE_Sprite
       } from '../../include/three.js/three.js-r120/build/three.module.js';

import { Model } from "./example12_Model.js";
import { Layer } from "./example12_Layer.js";
import {CSS2DRenderer} from "../../include/CSS2DRenderer.js";
import { OrbitControlsTexPane } from  "./example12_OrbitControlsTexPane.js";
import { OrbitControlsUtils } from "./example12_OrbitControlsUtils.js";
import {Util} from "./example12_Util.js";

'use strict';

class TexturePanelPlugin {
    constructor(){
        this.texCamera;
        this.texScene;
        this.texRenderer;
        this.texControls;
        this.rotationVal = 0;
        this.flipY = true;
        
        // https://threejs.org/docs/#api/en/objects/Sprite
        // textureSprite1 is the threejs planar Sprite object to show the selected images
        this.textureSprite1;

        // Bounding box around the texture image
        this.bbox;
        
        this.viewportExtendsOnX = false;
        this.currentViewportNormalized;

        this.imageWidth = undefined;
        this.imageHeight = undefined;
    };

    initTexturePanelPlugin() {
        console.log('BEG initTexturePanelPlugin');

        //////////////////////////////////////
        // Set camera related parameters
        //////////////////////////////////////

        // https://discourse.threejs.org/t/does-change-in-camera-position-impact-the-left-top-right-and-bottom-parameters-of-orthographic-camera/5501
        // left,right,top,bottom are in world units, i.e. for OrthographicCamera: leftBorderX = camera.position.x + (camera.left / camera.zoom);
        //
        // left,right,top,bottom (-50, 50, 50, -50) goes together with textureSprite.scale (100, 100, 1)
        // because the vertices of textureSprite.geometry.attributes.position.data.array which is of type THREE_Sprite are normalized (-0.5 - 0.5)
        // then the combination of left,right,top,bottom (-50, 50, 50, -50), and textureSprite.scale (100, 100, 1) fills in the entire window
        // for combination of left,right,top,bottom (-50, 50, 50, -50), and textureSprite.scale (50, 100, 1) the image covers 1/2 of the window on the x axis
        // for combination of left,right,top,bottom (-200, 200, 200, -200), and textureSprite.scale (100, 100, 1) the image covers 1/4 of the window on the x axis, and on the y axis

        let left = -100;
        let right = 100;
        let top = 50;
        let bottom = -50;
        let near = -500;
        let far = 1000;

        this.texCamera = new THREE_OrthographicCamera(left, right, top, bottom, near, far);
        this.texCamera.position.set( 0, 0, 80 );
        
        this.texScene = new THREE_Scene();

        //////////////////////////////////////
        // Set texRenderer related parameters
        //////////////////////////////////////

        this.texRenderer = new THREE_WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true});
        
        this.texRenderer.domElement.id = 'canvasTex';
        this.texRenderer.setPixelRatio(window.devicePixelRatio);
        this.texRenderer.setClearColor(0XDBDBDB, 1); //Webgl canvas background color
        
        let texRendererJqueryObject = $('#' + this.texRenderer.domElement.id);
        texRendererJqueryObject.addClass("showFullSize");
        

        ////////////////////////////////////////////////////
        // INIT CONTROLS
        ////////////////////////////////////////////////////

        // this.setTexControls();
        this.initializeOrbitControlsTex();

        ////////////////////////////////////////////////////
        // EVENT HANDLERS
        ////////////////////////////////////////////////////

        // $(window).resize(function () {
        //     console.log('BEG TexturePanelPlugin window resize2');
        //     let selectedLayer = Model.getSelectedLayer();
        //     let texturePanelPlugin = selectedLayer.getTexturePanelPlugin();

        //     let textureImageInfo = selectedLayer.getCurrentTextureImageInfo();
        //     let materialTexture = Util.getNestedObject(textureImageInfo, ['data', 'material', 'map']);
            
        //     if(Util.isObjectValid(materialTexture))
        //     {
        //         // let vh = window.innerHeight * 0.01;
        //         let vh = 985 * 0.01;
        //         document.documentElement.style.setProperty('--vh', `${vh}px`);
        //         let val1 = document.documentElement.style.getPropertyValue('--vh');
        //         console.log('val1', val1); 
                
        //         texturePanelPlugin.set_camera_canvas_renderer_and_viewport2(materialTexture, imageOrientation);
        //     }
        // });

    };

    _init() {
        this.hideWidgets();
    };

    getTexRenderer() {
        return this.texRenderer;
    };

    getTexScene() {
        return this.texScene;
    };

    getTexCamera() {
        return this.texCamera;
    };

    // set_camera_canvas_renderer_and_viewport2 - does for a specific texture:
    // 
    //  - sets the texCamera
    //    - sets the texCamera position
    //       - if camera of the specific texture does NOT pre-exists, sets the camera Frustum And Zoom
    //       - if camera of the specific texture does pre-exists, sets the texCamera position to the previous camera position
    //
    //  - sets texControls
    //    - sets the texControls.camera, texControls.target, texControls.minZoom
    //       - if the specific texture already has a camera, sets variables of the texControls object from the new camera
    //       - if the specific texture already does NOT have a camera, sets variables of the texControls object from the existing settings for the texture
    //
    //  - sets textureSprite1
    //    - adds textureSprite1 texScene
    //
    //  - updateCameraAndCanvasForTheSelectedImage
    //    -- calls OrbitControls3Dpane::setCameraAndCanvas - does xxx
    // 
    //  - sets currentViewportNormalized

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

        //////////////////////////////////////////////////
        // Set the textureSprite1
        //////////////////////////////////////////////////

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

        // TBD - delete previously existing this.textureSprite1 (to prevent memory leak ??)
        this.textureSprite1 = new THREE_Sprite( material );
        this.textureSprite1.position.set( 0, 0, 0 );
        this.textureSprite1.scale.set( retVal.scaleX, retVal.scaleY, 1 );
        this.textureSprite1.name = "textureSprite";
        
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
            // RemoveME ???
            // portrait
            let minX = this.bbox.min.x;
            this.bbox.min.x = this.bbox.min.y;
            this.bbox.min.y = minX;

            let maxX = this.bbox.max.x;
            this.bbox.max.x = this.bbox.max.y;
            this.bbox.max.y = maxX;
        }

        // console.log('this.bbox.min', this.bbox.min);
        // console.log('this.bbox.max', this.bbox.max);
        
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

    getTexControls() {
        return this.texControls;
    };
    
    setTexControls() {
        // console.log('BEG setTexControls');

        // Need to be similar to what is in OrbitControlsTexPane.js constructor
        let texCanvasWrapperElement = document.getElementById('texCanvasWrapper');

        this.texControls = new OrbitControlsTexPane(this.texCamera, texCanvasWrapperElement);
        
        //////////////////////////////////////
        // Set default zoom related parameters
        //////////////////////////////////////

        this.texControls.zoomSpeed = 0.8;
        this.texControls.minZoom = 1;
        this.texControls.maxZoom = Infinity;

        //////////////////////////////////////
        // Set pan related parameters
        //////////////////////////////////////

        this.texControls.screenSpacePanning = true;

        this.texControls.panSpeed = 0.6;
            
        this.texControls.addEventListener('change', TexturePanelPlugin.render2);

    };

    initializeOrbitControlsTex() {
        // console.log('BEG initializeOrbitControlsTex'); 

        let texCanvasWrapperElement = document.getElementById('texCanvasWrapper');
        this.texControls = new OrbitControlsTexPane(this.texCamera, texCanvasWrapperElement);

        //////////////////////////////////////
        // Set rotate related parameters
        //////////////////////////////////////

        // No rotation.
        this.texControls.enableRotate = false;

        // Set the rotation angle (with 0 angle change range) to 0
        // coordinate axis system is:
        // x-red - directed right (on the screen), z-blue directed down (on the screen), y-green directed towards the camera
        this.texControls.minPolarAngle = 0; // radians
        this.texControls.maxPolarAngle = 0; // radians

        // No orbit horizontally.
        this.texControls.minAzimuthAngle = 0; // radians
        this.texControls.maxAzimuthAngle = 0; // radians

        //////////////////////////////////////
        // Set zoom related parameters
        //////////////////////////////////////

        this.texControls.zoomSpeed = 1.2;
        // this.texControls.minZoom = 1;
        // this.texControls.maxZoom = Infinity;

        //////////////////////////////////////
        // Set pan related parameters
        //////////////////////////////////////

        this.texControls.panSpeed = 0.6;
        // if true, pan in screen-space
        this.texControls.screenSpacePanning = true;
        // // pixels moved per arrow key push
        // this.texControls.keyPanSpeed = 7.0;

        this.texControls.keys = [65, 83, 68, 70, 71, 72];

        // https://css-tricks.com/snippets/javascript/javascript-keycodes/
        // shift        16
        // ctrl         17
        // alt  18

        // need to set this.texCamera.position after construction of this.texControls
        this.texCamera.position.copy( TexturePanelPlugin.initialCameraHeightPosition );
        this.texCamera.zoom = 0.42;

        this.texControls.target.copy(this.texCamera.position);
        // initial this.texControls.target.Y is set to 0
        this.texControls.target.setY(0.0);

    };

    
    // loadTextureImageToTexturePane - loads the texture to the texturePane
    
    loadTextureImageToTexturePane(textureImageInfo) {
        console.log('BEG loadTextureImageToTexturePane');
        
        if(Util.isObjectInvalid(textureImageInfo))
        {
            throw new Error('textureImageInfo is invalid');
        }
        
        let texCanvasWrapper = $('#texCanvasWrapper');
        texCanvasWrapper.append(this.texRenderer.domElement);

        //Always remove everything from the scene when creating the meshes and adding them to the scene
        for (let i = this.texScene.children.length - 1; i >= 0; i--) {
            if(this.texScene.children[i].type == "Sprite")
            {
                this.texScene.remove(this.texScene.children[i]);
            }
        }
        
        this.showWidgets();

        // materialTexture stores the color/texture for the "material" (https://threejs.org/docs/#api/en/materials/MeshBasicMaterial)
        // The object type of materialTexture is: 'Texture' (https://threejs.org/docs/#api/en/textures/Texture)
        let materialTexture = textureImageInfo.data.material.map;
        // materialTexture.needsUpdate = true;

        //////////////////////////////////////////////////
        // Set:
        // texCamera
        // textureSprite1
        // bbox for the textureSprite1
        //////////////////////////////////////////////////

        this.set_camera_canvas_renderer_and_viewport2(materialTexture, textureImageInfo.imageOrientation);
        
        TexturePanelPlugin.render2();
    };

    static render2() {
        // console.log('BEG TexturePanelPlugin render2');

        let selectedLayer = Model.getSelectedLayer();
        let texturePanelPlugin = selectedLayer.getTexturePanelPlugin();
        let texRenderer2 = texturePanelPlugin.getTexRenderer();
        let texScene2 = texturePanelPlugin.getTexScene();
        let texCam2 = texturePanelPlugin.getTexCamera();

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

    // updateCameraAndCanvasForTheSelectedImage - updates the texCamera and the canvas for a specific texture:
    // 
    //  - sets the texCamera
    //    - sets the texCamera position
    //       - if camera of the specific texture does NOT pre-exists, to the center of the image, and height to TexturePanelPlugin::initialCameraHeightAboveGround, or
    //       - if camera of the specific texture does pre-exists, to the previous camera position
    //
    //  - sets the texRenderer viewport
    //    - calls calcCanvasParams (e.g. offsetLeft, offsetTop) to set the viewport

    updateCameraAndCanvasForTheSelectedImage(imageOrientation) {
        console.log('BEG updateCameraAndCanvasForTheSelectedImage');

        /////////////////////////////////////////////////////////////////////////////////////
        // Set this.texCamera to default position (where the selected image is centered and fills the entire canvas)
        /////////////////////////////////////////////////////////////////////////////////////

        // texCanvasWrapperSize - the size of the gui window
        let texCanvasWrapperSize = this.getTexCanvasWrapperSize();
        let guiWindowWidth = texCanvasWrapperSize.width;
        let guiWindowHeight = texCanvasWrapperSize.height;

        let retVal0 = undefined;
        let retVal = undefined;

        //////////////////////////////////////////////////////////////////////
        // Set the camera frustum, zoom to cover the entire image
        //////////////////////////////////////////////////////////////////////
        
        this.imageWidth = Util.getNestedObject(this.textureSprite1, ['material', 'map', 'image', 'width']);
        if(Util.isNumberInvalid(this.imageWidth))
        {
            console.error('this.textureSprite1', this.textureSprite1); 
            throw new Error('this.textureSprite1.material.map.image.width is invalid.');
        }
        
        this.imageHeight = Util.getNestedObject(this.textureSprite1, ['material', 'map', 'image', 'height']);
        if(Util.isNumberInvalid(this.imageHeight))
        {
            throw new Error('this.textureSprite1.material.map.image.height is invalid.');
        }

        retVal = this.texControls.setCameraAndCanvas(guiWindowWidth,
                                                     guiWindowHeight,
                                                     this.imageWidth,
                                                     this.imageHeight,
                                                     imageOrientation);


        /////////////////////////////////////////////////////////////////////////////////////
        // Scale the texture such that it fits the entire image
        /////////////////////////////////////////////////////////////////////////////////////

        this.textureSprite1.scale.set( retVal.scaleX, retVal.scaleY, 1 );
        this.viewportExtendsOnX = retVal.viewportExtendsOnX;

        // tbd - should texCanvasWrapperSize be set only one time ???
        this.texRenderer.setSize(texCanvasWrapperSize.width, texCanvasWrapperSize.height);

        // Set viewport
        this.texRenderer.setViewport( -retVal.canvasOffsetLeft,
                                      -retVal.canvasOffsetTop,
                                      retVal.canvasWidth,
                                      retVal.canvasHeight );

        let currentViewport = new THREE_Vector4();
        this.texRenderer.getCurrentViewport(currentViewport);

        let pixelRatio = this.texRenderer.getPixelRatio();
        this.currentViewportNormalized = new THREE_Vector4();
        this.currentViewportNormalized.copy(currentViewport)
        this.currentViewportNormalized.divideScalar(pixelRatio);

        this.texControls.setZoom(this.texControls.minZoom);
        
        this.texCamera.updateProjectionMatrix();
    };

    hideWidgets() {
        $("#texCanvasWrapper").hide();
        $("#texInfoContainer").hide();
    };

    showWidgets() {
        $("#texCanvasWrapper").show();
        $("#texInfoContainer").show();
    };

};

///////////////////////////////////
// BEG Static class variables
///////////////////////////////////

TexturePanelPlugin.initialCameraHeightPosition = new THREE_Vector3(643, 603, 2000);
TexturePanelPlugin.initialCameraHeightAboveGround = 80;

///////////////////////////////////
// END Static class variables
///////////////////////////////////


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
        let texturePanelPlugin = selectedLayer.getTexturePanelPlugin();
        texturePanelPlugin.texControls.update();
        TexturePanelPlugin.render2();
    }
};

$(document).on("SceneLayerSelected", function (event, layer) {
    console.log('BEG SceneLayerSelected');
});


export { TexturePanelPlugin };
