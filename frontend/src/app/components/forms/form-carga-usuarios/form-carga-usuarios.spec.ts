import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCargaUsuarios } from './form-carga-usuarios';

describe('FormCargaUsuarios', () => {
  let component: FormCargaUsuarios;
  let fixture: ComponentFixture<FormCargaUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCargaUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCargaUsuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
