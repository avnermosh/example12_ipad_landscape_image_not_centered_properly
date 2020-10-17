
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
        this.textureSprite1;
        this.bbox;
        this.viewportExtendsOnX = false;
        this.currentViewportNormalized;
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

    getTexRenderer() {
        return this.texRenderer;
    };

    getTexScene() {
        return this.texScene;
    };

    getTexCamera() {
        return this.texCamera;
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
        // this.textureSprite1.name = "textureSprite";
        
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

        let currentViewport = new THREE_Vector4();
        this.texRenderer.getCurrentViewport(currentViewport);

        let pixelRatio = this.texRenderer.getPixelRatio();
        this.currentViewportNormalized = new THREE_Vector4();
        this.currentViewportNormalized.copy(currentViewport)
        this.currentViewportNormalized.divideScalar(pixelRatio);

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


export { TexturePanelPlugin };
