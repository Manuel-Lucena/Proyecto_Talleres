import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCalificar } from './form-calificar';

describe('FormCalificar', () => {
  let component: FormCalificar;
  let fixture: ComponentFixture<FormCalificar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCalificar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCalificar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
