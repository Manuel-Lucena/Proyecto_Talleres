import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInscripcion } from './form-inscripcion';

describe('FormInscripcion', () => {
  let component: FormInscripcion;
  let fixture: ComponentFixture<FormInscripcion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInscripcion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInscripcion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
