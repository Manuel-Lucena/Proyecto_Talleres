import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTaller } from './form-taller';

describe('FormTaller', () => {
  let component: FormTaller;
  let fixture: ComponentFixture<FormTaller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTaller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTaller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
