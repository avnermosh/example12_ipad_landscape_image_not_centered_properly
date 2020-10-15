////////////////////////////////////////////////////////////////
//
// The Model file is 
//
////////////////////////////////////////////////////////////////

import { Util } from "./example12_Util.js";
import { Layer } from "./example12_Layer.js";


class Model {

    static getUrlImagePathBase = function () {
        return 'avner/img';
    };
    
    static getUrlBase = function () {
        return this._urlBase;
    };

    static createLayer = function (layerName) {
        console.log('BEG createLayer');

        this._$texturePaneWrapper = $('<div id="texture-pane-wrapper"></div>');
        // tbd RemoveME - no such class "texturePaneWrapper"??
        this._$texturePaneWrapper.addClass("texturePaneWrapper");

        this.texCanvasWrapper = $('<div id="texCanvasWrapper"></div>');
        // // tbd RemoveME - no such class "texCanvasWrapper" (id but not class ?) ??
        // this.texCanvasWrapper.addClass("texCanvasWrapper");
        

        this._$texturePaneWrapper.appendTo('#grid-container1');
        this._$texturePaneWrapper.append(this.texCanvasWrapper);

        let layer = new Layer(layerName);
        layer.initLayer();
        return layer;
    };

    static removeCanvasFromTexturePane = function (layer) {
        // console.log('BEG removeCanvasFromTexturePane');

        // console.log('remove canvasTexEl of of the layer from #texCanvasWrapper'); 
        let texCanvasWrapperEl = document.getElementById("texCanvasWrapper");
        let texturePanelPlugin = layer.getTexturePanelPlugin();
        let texRenderer = texturePanelPlugin.getTexRenderer();
        let canvasTexEl = texRenderer.domElement;
        texCanvasWrapperEl.removeChild(canvasTexEl);
    };
    
    static setSelectedLayer = async function (layer) {
        
        this._selectedLayer = layer;
        
        let texturePanelPluginNew = this._selectedLayer.getTexturePanelPlugin();
        if(Util.isObjectValid(texturePanelPluginNew))
        {
            // add canvasTexEl of the new selected layer to #texCanvasWrapper
            let texRendererNew = texturePanelPluginNew.getTexRenderer();
            let canvasTexElNew = texRendererNew.domElement;
            let texCanvasWrapperEl = document.getElementById("texCanvasWrapper");
            texCanvasWrapperEl.appendChild(canvasTexElNew);
        }

        await this._selectedLayer.updateLayerImageRelatedRenderring();

    };

    static getSelectedLayer = function () {
        return this._selectedLayer;
    };
    
};

Model._urlBase = window.location.origin + '/';
Model._selectedLayer = null;

export { Model };

