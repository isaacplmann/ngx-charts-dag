import { NgModule } from '@angular/core';
import { GraphComponent } from './graph.component';
import { ChartCommonModule } from '@swimlane/ngx-charts';
import { MouseWheelDirective } from './mouse-wheel.directive';
import { LayoutService } from './layouts/layout.service';
export { GraphComponent };
var GraphModule = /** @class */ (function () {
    function GraphModule() {
    }
    GraphModule.decorators = [
        { type: NgModule, args: [{
                    imports: [ChartCommonModule],
                    declarations: [GraphComponent, MouseWheelDirective],
                    exports: [GraphComponent, MouseWheelDirective],
                    providers: [LayoutService]
                },] },
    ];
    return GraphModule;
}());
export { GraphModule };
//# sourceMappingURL=graph.module.js.map