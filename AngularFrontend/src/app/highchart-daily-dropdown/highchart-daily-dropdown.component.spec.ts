import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartDailyDropdownComponent } from './highchart-daily-dropdown.component';

describe('HighchartDailyDropdownComponent', () => {
  let component: HighchartDailyDropdownComponent;
  let fixture: ComponentFixture<HighchartDailyDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighchartDailyDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighchartDailyDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
