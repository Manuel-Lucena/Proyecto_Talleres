import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioTalleres } from './calendario-talleres';

describe('CalendarioTalleres', () => {
  let component: CalendarioTalleres;
  let fixture: ComponentFixture<CalendarioTalleres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioTalleres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioTalleres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
