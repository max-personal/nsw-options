import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartDailyComponent } from './highchart-daily.component';

describe('HighchartDailyComponent', () => {
  let component: HighchartDailyComponent;
  let fixture: ComponentFixture<HighchartDailyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighchartDailyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighchartDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
