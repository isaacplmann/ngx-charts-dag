import { Injectable } from '@angular/core';
import { DagreLayout } from './dagre';
import { DagreClusterLayout } from './dagreCluster';
import { DagreNodesOnlyLayout } from './dagreNodesOnly';
var layouts = {
    dagre: DagreLayout,
    dagreCluster: DagreClusterLayout,
    dagreNodesOnly: DagreNodesOnlyLayout,
};
var LayoutService = /** @class */ (function () {
    function LayoutService() {
    }
    LayoutService.prototype.getLayout = function (name) {
        if (layouts[name]) {
            return new layouts[name]();
        }
        else {
            throw new Error("Unknown layout type '" + name + "'");
        }
    };
    LayoutService.decorators = [
        { type: Injectable },
    ];
    return LayoutService;
}());
export { LayoutService };
//# sourceMappingURL=layout.service.js.map