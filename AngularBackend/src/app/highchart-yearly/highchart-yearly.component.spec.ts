import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartYearlyComponent } from './highchart-yearly.component';

describe('HighchartYearlyComponent', () => {
  let component: HighchartYearlyComponent;
  let fixture: ComponentFixture<HighchartYearlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighchartYearlyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighchartYearlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
