import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges
} from '@angular/core';

import * as PIXI from 'pixi.js/dist/pixi.js';

export interface GraphBounds
{
  left: number,
  top: number,
  right: number,
  bottom: number,
};

export type GraphFunction = (x: number) => number;

export const DEF_BOUNDS: GraphBounds = {
  left: 0,
  top: 0,
  right: 10,
  bottom: 10,
};

@Directive({
  selector: '[quickPlot]'
})
export class QuickPlotDirective implements OnChanges
{
  @Input()
  public bounds: GraphBounds = DEF_BOUNDS;

  @Input()
  public pixiOptions: object = {
    backgroundColor: 0xefefef,
    antialias: true
  };

  protected _container: HTMLDivElement;        // DOM container for freehand strokes (DIV)
  protected _rect: ClientRect | DOMRect;

  // PIXI app and stage references
  protected _app: PIXI.Application;
  protected _stage: PIXI.Container;
  protected _width: number;
  protected _height: number;

  // px/unit lengths along each axis
  protected _pxPerUnitX: number;
  protected _pxPerUnitY: number;

  // internal plot bounds
  protected _left: number;
  protected _top: number;
  protected _right: number;
  protected _bottom: number;

  // plot container
  protected _plotContainer: PIXI.Container;    // container for everything plotted

  // user-defined layers
  protected _userLayers: Record<string, PIXI.Graphics>;

  constructor(protected _elRef: ElementRef)
  {
    this._container = this._elRef.nativeElement as HTMLDivElement;

    this._userLayers = {};

    this._rect = this._container.getBoundingClientRect();

    const options = Object.assign(
      {width: this._container.clientWidth, height: this._container.clientHeight},
      this.pixiOptions
    );

    this._app = new PIXI.Application(options);

    this._container.appendChild(this._app.view);

    this._stage  = this._app.stage;
    this._width  = this._app.view.width;
    this._height = this._app.view.height;

    this.__pixiSetup();
  }

  /**
   * Add a layer to the plot and return a reference to the graphics context for optional custom plotting
   *
   * @param layerName Name of the layer to be created
   */
  public addLayer(layerName: string): PIXI.Graphics | null
  {
    if (layerName !== undefined && layerName != null && layerName !== '')
    {
      const g: PIXI.Graphics = new PIXI.Graphics();

      this._userLayers[layerName] = g;
      this._plotContainer.addChild(g);

      return g;
    }

    return null;
  }

  /**
   * Clear the plot in the supplied layer
   *
   * @param layerName Name of the layer to be cleared
   */
  public clearLayer(layerName: string): void
  {
    if (layerName !== undefined && layerName != null && layerName !== '')
    {
      const g: PIXI.Graphics = this._userLayers[layerName];

      if (g) g.clear();
    }
  }

  /**
   * Add a line to the selected layer (the line is added onto any existing graphics in the layer)
   *
   * @param layerName Layer to which the line will be added
   *
   * @param lineWidth Line width in px
   *
   * @param color Stroke color, i.e. '0xff0000'
   *
   * @param x1 x-coordinate of initial point of the line
   *
   * @param y1 y-coordinate of the initial point of the line
   *
   * @param x2 x-coordinate of the terminal point of the line
   *
   * @param y2 y-coordinate of the termainal point of the line
   */
  public addLine(layerName: string, lineWidth: number, color: number | string, x1: number, y1: number, x2: number, y2: number): void
  {
    const g: PIXI.Graphics = this._userLayers[layerName];

    if (g !== undefined)
    {
      g.lineStyle(lineWidth, color);

      g.moveTo((x1 - this._left) * this._pxPerUnitX, (this._top - y1) * this._pxPerUnitY);
      g.lineTo((x2 - this._left) * this._pxPerUnitX, (this._top - y2) * this._pxPerUnitY);
    }
  }

  /**
   * Add a collection of line segments to the selected layer (the segments are added onto any existing graphics in the layer)
   *
   * @param layerName Layer to which the line segments are to be added
   *
   * @param lineWidth Stroke with in px
   *
   * @param color Line color, i.e. '0xff0000'
   *
   * @param points Collection of points that describe the line segments.  There is no presumption of continuity among the segments,
   * so repeat end points as initial points if the segments are connected.
   */
  public addSegments(layerName: string, lineWidth: number, color: number | string, points: Array<{x: number, y: number}>): void
  {
    const g: PIXI.Graphics = this._userLayers[layerName];
    const n: number        = points.length;

    if (n < 2) return;

    let i: number;

    if (g !== undefined)
    {
      g.lineStyle(lineWidth, color);

      g.moveTo((points[0].x - this._left) * this._pxPerUnitX, (this._top - points[0].y) * this._pxPerUnitY);

      for (i = 1; i < n; ++i) {
        g.lineTo((points[i].x - this._left) * this._pxPerUnitX, (this._top - points[i].y) * this._pxPerUnitY);
      }
    }
  }

  /**
   * Add a single point to the specified layer (the point is added onto any existing graphics in the layer)
   *
   * @param layerName Layer to which the point is added
   *
   * @param x x-coordinate of the point in user coordinates
   *
   * @param y y-coordinate of the point in user coordinates
   *
   * @param r radius of the circle in px
   *
   * @param c circle color, i.e. '0xff0000'
   */
  public addPoint(layerName: string, x: number, y: number, r: number, c: number | string): void
  {
    const g: PIXI.Graphics = this._userLayers[layerName];

    if (g !== undefined)
    {
      g.beginFill(c);
      g.drawCircle((x - this._left) * this._pxPerUnitX, (this._top - y) * this._pxPerUnitY, r);
      g.endFill();
    }
  }

  /**
   * Graph a function across the current graph domain (the function graph is added onto any existing graphics in the layer)
   *
   * @param layerName Layer to which the function graph is added
   *
   * @param lineWidth Stroke width in px
   *
   * @param color Stroke color, i.e. '0xff0000'
   *
   * @param f {GraphFunction} that is executed across the current range of x-coordinates to generate points that are plotted
   * into the specified layer.  The points are sufficiently close to simulate a smooth curve when plotted with line segments.
   */
  public graphFunction(layerName: string, lineWidth: number, color: number | string, f: GraphFunction): void
  {
    let x: number = this._left;
    let y: number = f(this._left);

    const w: number = this._width / 3;
    const d: number = (this._right - this._left) / w;

    const g: PIXI.Graphics = this._userLayers[layerName];

    if (g !== undefined)
    {
      g.lineStyle(lineWidth, color);

      g.moveTo((x - this._left) * this._pxPerUnitX, (this._top - y) * this._pxPerUnitY);

      while (x < this._right)
      {
        x += d;
        y  = f(x);

        g.lineTo((x - this._left) * this._pxPerUnitX, (this._top - y) * this._pxPerUnitY);
      }

      y = f(this._right);
      g.lineTo((x - this._left) * this._pxPerUnitX, (this._top - y) * this._pxPerUnitY);
    }
  }

  public ngOnChanges(changes: SimpleChanges): void
  {
    let prop: string;
    let change: SimpleChange;

    // tslint:disable-next-line:forin
    for (prop in changes)
    {
      change = changes[prop];

      switch (prop)
      {
        case 'bounds':
          const bounds: GraphBounds = change.currentValue as GraphBounds;

          this._left   = !isNaN(bounds.left) ? bounds.left : this._left;
          this._top    = !isNaN(bounds.top) ? bounds.top : this._top;
          this._right  = !isNaN(bounds.right) ? bounds.right : this._right;
          this._bottom = !isNaN(bounds.bottom) ? bounds.bottom : this._bottom;

          this.__update();
          break;
      }
    }
  }

  /**
   * Update pixels per unit X and Y given new graph bounds
   *
   * @private
   */
  protected __update(): void
  {
    if (isNaN(this._left)) return;
    if (isNaN(this._top)) return;
    if (isNaN(this._right)) return;
    if (isNaN(this._bottom)) return;

    if (this._left >= this._right) return;
    if (this._top <= this._bottom) return;

    if (this._width !== 0 && this._height !== 0)
    {
      this._pxPerUnitX = this._width / (this._right - this._left);
      this._pxPerUnitY = this._height / (this._top - this._bottom);
    }
  }

  /**
   * Setup the PIXI graphics primary container and add to the stage
   *
   * @private
   */
  protected __pixiSetup(): void
  {
    this._plotContainer  = new PIXI.Container();

    this._stage.addChild(this._plotContainer);
  }
}
