import { BrowserModule } from '@angular/platform-browser';
import { NgModule      } from '@angular/core';

import { AppComponent       } from './app.component';
import { QuickPlotDirective } from './shared/directives/quick-plot.directive';

@NgModule({
  declarations: [
    AppComponent,
    QuickPlotDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
