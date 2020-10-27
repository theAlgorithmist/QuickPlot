import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  GraphBounds,
  GraphFunction,
  QuickPlotDirective
} from './shared/directives/quick-plot.directive';

export enum PLOT_LAYERS
{
  POINTS        = 'points',
  LINE          = 'line',
  LINE_SEGMENTS = 'line_segments',
  FUNCTION      = 'function'
}

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit
{
  // data bounding box
  public graphBounds: GraphBounds;

  @ViewChild(QuickPlotDirective, {static: true})
  protected _plot: QuickPlotDirective;

  // y = 0.1*x^2 + 1
  protected _graphFunction: GraphFunction = (x: number): number => 0.1 * x * x + 1;

  constructor()
  {
    this.graphBounds = {
      left: -5,
      right: 5,
      bottom: -5,
      top: 5
    };
  }

  public ngOnInit(): void
  {
    // create layers
    this._plot.addLayer(PLOT_LAYERS.LINE);
    this._plot.addLayer(PLOT_LAYERS.FUNCTION);
    this._plot.addLayer(PLOT_LAYERS.POINTS);
    this._plot.addLayer(PLOT_LAYERS.LINE_SEGMENTS);
  }

  public ngAfterViewInit(): void
  {
    // graph some stuff
    this._plot.addLine(PLOT_LAYERS.LINE, 2, '0x0000ff', 0, 0, 3, 5);

    this._plot.addSegments(PLOT_LAYERS.LINE_SEGMENTS, 2, '0x00ff00', [{x: -5, y: -5}, {x: -1, y: 2}, {x: 1, y: -2}, {x: 5, y: 5}]);

    this._plot.addPoint(PLOT_LAYERS.POINTS, -2, 0, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, -4, 1, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, -1, 4, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, 2, 0, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, 3, -4, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, 4, 1, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, 4.5, 2, 3, '0xff0000');
    this._plot.addPoint(PLOT_LAYERS.POINTS, 2.5, -4, 3, '0xff0000');

    this._plot.graphFunction(PLOT_LAYERS.FUNCTION, 2, '0xffff00', this._graphFunction);
  }
}
