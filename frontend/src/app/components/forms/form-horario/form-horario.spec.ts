import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHorario } from './form-horario';

describe('FormHorario', () => {
  let component: FormHorario;
  let fixture: ComponentFixture<FormHorario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHorario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormHorario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
