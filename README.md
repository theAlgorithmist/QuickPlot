# QuickPlot

This is a simple Angular 10 demonstration of the _QuickPlot_ directive that is designed to provide rapid comparison of multiple functions and/or data points across a common range.  It is quick, simple, and without frills such as axes, grids, and other graph annotations.

The Angular 10 demo provided with the code distributions provides examples of how to add plot layers and plot data points, lines, line segments, and arbitrary functions that are defined across the domain of the plottable area.

NOTE:  Understand that an Angular Directive life cycle runs behind that of its containing component.  This is why plot layers are defined in an on-init handler, but the actual plotting is deferred to after view init.


Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Angular: 10.1.6

Angular CLI: 10.1.7

PixiJS: 4.8.2

## Methods

The following methods are available.  'Add' methods add the specified data to anything already plotted in the layer.  Call the _clearLayer_ method to clear any prior graphics in advance.  The _graphFunction_ method clears its layer before computing and graphing the specified function.

```
addLayer(layerName: string): PIXI.Graphics | null;
clearLayer(layerName: string): void;
addLine(layerName: string, lineWidth: number, color: number | string, x1: number, y1: number, x2: number, y2: number): void
addSegments(layerName: string, lineWidth: number, color: number | string, points: Array<{x: number, y: number}>): void
addPoint(layerName: string, x: number, y: number, r: number, c: number | string): void
graphFunction(layerName: string, lineWidth: number, color: number | string, f: GraphFunction): void

```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

[The Algorithmist]: <https://www.linkedin.com/in/jimarmstrong/>
