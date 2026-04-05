import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaTareaSeguimiento } from './aula-tarea-seguimiento';

describe('AulaTareaSeguimiento', () => {
  let component: AulaTareaSeguimiento;
  let fixture: ComponentFixture<AulaTareaSeguimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaTareaSeguimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaTareaSeguimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
