var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { id } from '../../utils';
import { d3adaptor, } from 'webcola';
import * as d3Dispatch from 'd3-dispatch';
import * as d3Force from 'd3-force';
import * as d3Timer from 'd3-timer';
import { Subject } from 'rxjs';
export function toNode(nodes, nodeRef) {
    if (typeof nodeRef === 'number') {
        return nodes[nodeRef];
    }
    return nodeRef;
}
var ColaForceDirectedLayout = /** @class */ (function () {
    function ColaForceDirectedLayout() {
        this.defaultSettings = {
            force: d3adaptor(__assign({}, d3Dispatch, d3Force, d3Timer))
                .linkDistance(150)
                .avoidOverlaps(true),
            viewDimensions: {
                width: 600,
                height: 600,
                xOffset: 0,
            }
        };
        this.settings = {};
        this.outputGraph$ = new Subject();
    }
    ColaForceDirectedLayout.prototype.run = function (graph) {
        var _this = this;
        this.inputGraph = graph;
        if (!this.inputGraph.clusters) {
            this.inputGraph.clusters = [];
        }
        this.internalGraph = {
            nodes: this.inputGraph.nodes.map(function (n) {
                return (__assign({}, n, { width: n.dimension ? n.dimension.width : 20, height: n.dimension ? n.dimension.height : 20 }));
            }).slice(),
            groups: this.inputGraph.clusters.map(function (cluster) {
                return ({
                    id: cluster.id,
                    padding: 5,
                    groups: cluster.childNodeIds
                        .map(function (nodeId) { return _this.inputGraph.clusters.findIndex(function (node) { return node.id === nodeId; }); })
                        .filter(function (x) { return x >= 0; }),
                    leaves: cluster.childNodeIds
                        .map(function (nodeId) { return _this.inputGraph.nodes.findIndex(function (node) { return node.id === nodeId; }); })
                        .filter(function (x) { return x >= 0; }),
                });
            }).slice(),
            links: this.inputGraph.edges.map(function (e) {
                var sourceNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.source === node.id; });
                var targetNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.target === node.id; });
                if (sourceNodeIndex === -1 || targetNodeIndex === -1) {
                    return undefined;
                }
                return __assign({}, e, { source: sourceNodeIndex, target: targetNodeIndex });
            }).filter(function (x) { return !!x; }).slice(),
            groupLinks: this.inputGraph.edges.map(function (e) {
                var sourceNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.source === node.id; });
                var targetNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.target === node.id; });
                if (sourceNodeIndex >= 0 && targetNodeIndex >= 0) {
                    return undefined;
                }
                return e;
            }).filter(function (x) { return !!x; }).slice()
        };
        this.outputGraph = {
            nodes: [],
            clusters: [],
            edges: [],
            edgeLabels: [],
        };
        this.outputGraph$.next(this.outputGraph);
        this.settings = Object.assign({}, this.defaultSettings, this.settings);
        if (this.settings.force) {
            this.settings.force = this.settings.force.nodes(this.internalGraph.nodes)
                .groups(this.internalGraph.groups)
                .links(this.internalGraph.links)
                .alpha(0.5)
                .on('tick', function () {
                if (_this.settings.onTickListener) {
                    _this.settings.onTickListener(_this.internalGraph);
                }
                _this.outputGraph$.next(_this.internalGraphToOutputGraph(_this.internalGraph));
            });
            if (this.settings.viewDimensions) {
                this.settings.force = this.settings.force.size([
                    this.settings.viewDimensions.width,
                    this.settings.viewDimensions.height,
                ]);
            }
            if (this.settings.forceModifierFn) {
                this.settings.force = this.settings.forceModifierFn(this.settings.force);
            }
            this.settings.force.start();
        }
        return this.outputGraph$.asObservable();
    };
    ColaForceDirectedLayout.prototype.updateEdge = function (graph, edge) {
        var settings = Object.assign({}, this.defaultSettings, this.settings);
        if (settings.force) {
            settings.force.start();
        }
        return this.outputGraph$.asObservable();
    };
    ColaForceDirectedLayout.prototype.internalGraphToOutputGraph = function (internalGraph) {
        var _this = this;
        this.outputGraph.nodes = internalGraph.nodes.map(function (node) {
            return (__assign({}, node, { id: node.id || id(), position: {
                    x: node.x,
                    y: node.y,
                }, dimension: {
                    width: node.dimension && node.dimension.width || 20,
                    height: node.dimension && node.dimension.height || 20,
                }, transform: "translate(" + (node.x - (node.dimension && node.dimension.width || 20) / 2 || 0) + ", " + (node.y - (node.dimension && node.dimension.height || 20) / 2 || 0) + ")" }));
        });
        this.outputGraph.edges = internalGraph.links.map(function (edge) {
            var source = toNode(internalGraph.nodes, edge.source);
            var target = toNode(internalGraph.nodes, edge.target);
            return __assign({}, edge, { source: source.id, target: target.id, points: [
                    source.bounds.rayIntersection(target.bounds.cx(), target.bounds.cy()),
                    target.bounds.rayIntersection(source.bounds.cx(), source.bounds.cy()),
                ] });
        }).concat(internalGraph.groupLinks.map(function (groupLink) {
            var sourceNode = internalGraph.nodes.find(function (foundNode) { return foundNode.id === groupLink.source; });
            var targetNode = internalGraph.nodes.find(function (foundNode) { return foundNode.id === groupLink.target; });
            var source = sourceNode || internalGraph.groups.find(function (foundGroup) { return foundGroup.id === groupLink.source; });
            var target = targetNode || internalGraph.groups.find(function (foundGroup) { return foundGroup.id === groupLink.target; });
            return __assign({}, groupLink, { source: source.id, target: target.id, points: [
                    source.bounds.rayIntersection(target.bounds.cx(), target.bounds.cy()),
                    target.bounds.rayIntersection(source.bounds.cx(), source.bounds.cy()),
                ] });
        }));
        this.outputGraph.clusters = internalGraph.groups.map(function (group, index) {
            var inputGroup = _this.inputGraph.clusters[index];
            return __assign({}, inputGroup, { dimension: {
                    width: group.bounds ? group.bounds.width() : 20,
                    height: group.bounds ? group.bounds.height() : 20,
                }, position: {
                    x: group.bounds ? (group.bounds.x + group.bounds.width() / 2) : 0,
                    y: group.bounds ? (group.bounds.y + group.bounds.height() / 2) : 0,
                } });
        });
        this.outputGraph.edgeLabels = this.outputGraph.edges;
        return this.outputGraph;
    };
    ColaForceDirectedLayout.prototype.onDragStart = function (draggingNode, $event) {
        var nodeIndex = this.outputGraph.nodes.findIndex(function (foundNode) { return foundNode.id === draggingNode.id; });
        var node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        this.draggingStart = { x: node.x - $event.x, y: node.y - $event.y };
        node.fixed = 1;
        this.settings.force.start();
    };
    ColaForceDirectedLayout.prototype.onDrag = function (draggingNode, $event) {
        if (!draggingNode)
            return;
        var nodeIndex = this.outputGraph.nodes.findIndex(function (foundNode) { return foundNode.id === draggingNode.id; });
        var node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        node.x = this.draggingStart.x + $event.x;
        node.y = this.draggingStart.y + $event.y;
    };
    ColaForceDirectedLayout.prototype.onDragEnd = function (draggingNode, $event) {
        if (!draggingNode)
            return;
        var nodeIndex = this.outputGraph.nodes.findIndex(function (foundNode) { return foundNode.id === draggingNode.id; });
        var node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        node.fixed = 0;
    };
    return ColaForceDirectedLayout;
}());
export { ColaForceDirectedLayout };
//# sourceMappingURL=colaForceDirected.js.map