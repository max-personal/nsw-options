import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFrameComponent } from './map-frame.component';

describe('MapFrameComponent', () => {
  let component: MapFrameComponent;
  let fixture: ComponentFixture<MapFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapFrameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
