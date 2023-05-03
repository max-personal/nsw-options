import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { FormComponent } from './form/form.component';
import { NavbarComponent } from './navbar/navbar.component';
import { OutputTableComponent } from './output-table/output-table.component';
import { DataService } from './services/data.service';
import { MapFrameComponent } from './map-frame/map-frame.component';
import { HighchartYearlyComponent } from './highchart-yearly/highchart-yearly.component';
import { HighchartDailyComponent } from './highchart-daily/highchart-daily.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    FormComponent,
    NavbarComponent,
    OutputTableComponent,
    MapFrameComponent,
    HighchartYearlyComponent,
    HighchartDailyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    HighchartsChartModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
