import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioTareas } from './calendario-tareas';

describe('CalendarioTareas', () => {
  let component: CalendarioTareas;
  let fixture: ComponentFixture<CalendarioTareas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioTareas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioTareas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
