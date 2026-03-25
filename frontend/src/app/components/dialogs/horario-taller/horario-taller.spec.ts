import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioTaller } from './horario-taller';

describe('HorarioTaller', () => {
  let component: HorarioTaller;
  let fixture: ComponentFixture<HorarioTaller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorarioTaller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarioTaller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
