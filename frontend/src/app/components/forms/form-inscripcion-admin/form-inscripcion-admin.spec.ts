import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInscripcionAdmin } from './form-inscripcion-admin';

describe('FormInscripcionAdmin', () => {
  let component: FormInscripcionAdmin;
  let fixture: ComponentFixture<FormInscripcionAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInscripcionAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInscripcionAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
