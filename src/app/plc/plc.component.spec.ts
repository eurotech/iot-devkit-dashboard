import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlcComponent } from './plc.component';

describe('PlcComponent', () => {
  let component: PlcComponent;
  let fixture: ComponentFixture<PlcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
