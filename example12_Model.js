
import { Util } from "./example12_Util.js";
import { Layer } from "./example12_Layer.js";

class Model {

    static createLayer = function (layerName) {
        console.log('BEG createLayer');

        this._$texturePaneWrapper = $('<div id="texture-pane-wrapper"></div>');
        this.texCanvasWrapper = $('<div id="texCanvasWrapper"></div>');

        this._$texturePaneWrapper.appendTo('#grid-container1');
        this._$texturePaneWrapper.append(this.texCanvasWrapper);

        let layer = new Layer(layerName);
        layer.initLayer();
        return layer;
    };

    static getSelectedLayer = function () {
        return this._selectedLayer;
    };
    
};

Model._selectedLayer = null;

export { Model };

