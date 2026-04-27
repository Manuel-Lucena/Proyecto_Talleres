import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLabel } from './form-label';

describe('FormLabel', () => {
  let component: FormLabel;
  let fixture: ComponentFixture<FormLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLabel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
