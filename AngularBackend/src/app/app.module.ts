import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { FormComponent } from './form/form.component';
import { NavbarComponent } from './navbar/navbar.component';
import { OutputTableComponent } from './output-table/output-table.component';
import { DataService } from './services/data.service';
import { ChartTestComponent } from './chart-test/chart-test.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    FormComponent,
    NavbarComponent,
    OutputTableComponent,
    ChartTestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
