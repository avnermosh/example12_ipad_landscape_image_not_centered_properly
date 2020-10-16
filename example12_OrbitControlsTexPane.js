
import {Vector3 as THREE_Vector3,
        Quaternion as THREE_Quaternion,
        EventDispatcher as THREE_EventDispatcher
       } from '../../include/three.js/three.js-r120/build/three.module.js';

import { Model } from "./example12_Model.js";
import { OrbitControlsUtils } from "./example12_OrbitControlsUtils.js";
import { Util } from "./example12_Util.js";

"use strict";


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
            let texturePlugin = selectedLayer.getTexturePanelPlugin()
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
    
    dispose() {
        this.deactivate();
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
        
        // setCameraFrustumAndZoom -> setCameraFrustum
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

        let x1 = 0;
        let x3 = 0;
        if(viewportExtendsOnX)
        {
            x1 = this.camera.position.x + (this.camera.left * this.minZoom / this.camera.zoom);
            x3 = this.camera.position.x + (this.camera.right * this.minZoom / this.camera.zoom);
        }
        else
        {
            x1 = this.camera.position.x + (this.camera.left / this.camera.zoom);
            x3 = this.camera.position.x + (this.camera.right / this.camera.zoom);
        }
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
            let x2 = 0;
            if(viewportExtendsOnX)
            {
                let pos_x1 = x1a - (this.camera.left * this.minZoom / this.camera.zoom);
                x2 = pos_x1 + (this.camera.right * this.minZoom / this.camera.zoom);
                let x2a = Math.min(x2, bbox.max.x);
                pos_x = x2a - (this.camera.right * this.minZoom / this.camera.zoom);
            }
            else
            {
                let pos_x1 = x1a - (this.camera.left / this.camera.zoom);
                x2 = pos_x1 + (this.camera.right / this.camera.zoom);
                let x2a = Math.min(x2, bbox.max.x);
                pos_x = x2a - (this.camera.right / this.camera.zoom);
            }
        }
        
        // _TEXTURE_2D - x-red - directed right (on the screen), y-green directed up (on the screen), z-blue directed towards the camera

        let y1 = 0;
        let y1a = 0;
        let pos_y1 = 0;
        let y3 = 0;
        if(viewportExtendsOnX)
        {
            y1 = this.camera.position.y + (this.camera.bottom / this.camera.zoom);
            y1a = Math.max(y1, bbox.min.y);
            pos_y1 = y1a - (this.camera.bottom / this.camera.zoom);
            y3 = this.camera.position.y + (this.camera.top / this.camera.zoom);
        }
        else
        {
            y1 = this.camera.position.y + (this.camera.bottom * this.minZoom / this.camera.zoom);
            y1a = Math.max(y1, bbox.min.y);
            pos_y1 = y1a - (this.camera.bottom * this.minZoom / this.camera.zoom);
            y3 = this.camera.position.y + (this.camera.top * this.minZoom / this.camera.zoom);
        }

        let pos_y = 0;
        if((y1 <= bbox.min.y) && (y3 >= bbox.max.y))
        {
            // the camera view exceeds the image
            // Center the image (y axis) in the view window
            pos_y = (bbox.min.y + bbox.max.y) / 2;
        }
        else
        {
            let y2 = 0;
            let y2a = 0;
            if(viewportExtendsOnX)
            {
                y2 = pos_y1 + (this.camera.top / this.camera.zoom);
                y2a = Math.min(y2, bbox.max.y);
                pos_y = y2a - (this.camera.top / this.camera.zoom);
            }
            else
            {
                y2 = pos_y1 + (this.camera.top * this.minZoom / this.camera.zoom);
                y2a = Math.min(y2, bbox.max.y);
                pos_y = y2a - (this.camera.top * this.minZoom / this.camera.zoom);
            }
        }
        
        // Limit the panning
        this.camera.position.set(pos_x, pos_y, this.camera.position.z);
        this.camera.lookAt(pos_x, pos_y, this.target.z);
        this.target.set(pos_x, pos_y, 0);

    };

};

OrbitControlsTexPane.EPS = 0.0001;

export { OrbitControlsTexPane };
