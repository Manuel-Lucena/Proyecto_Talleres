import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCargaInscripciones } from './form-carga-inscripciones';

describe('FormCargaInscripciones', () => {
  let component: FormCargaInscripciones;
  let fixture: ComponentFixture<FormCargaInscripciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCargaInscripciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCargaInscripciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
