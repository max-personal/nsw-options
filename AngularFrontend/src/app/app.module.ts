import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { NavbarComponent } from './navbar/navbar.component';
import { OutputTableComponent } from './output-table/output-table.component';
import { DataService } from './services/data.service';
import { MapFrameComponent } from './map-frame/map-frame.component';
import { HighchartYearlyComponent } from './highchart-yearly/highchart-yearly.component';
import { HighchartDailyComponent } from './highchart-daily/highchart-daily.component';
import { HighchartDailyDropdownComponent } from './highchart-daily-dropdown/highchart-daily-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    NavbarComponent,
    OutputTableComponent,
    MapFrameComponent,
    HighchartYearlyComponent,
    HighchartDailyComponent,
    HighchartDailyDropdownComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    MatMenuModule,
    MatButtonModule,
    BrowserAnimationsModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
