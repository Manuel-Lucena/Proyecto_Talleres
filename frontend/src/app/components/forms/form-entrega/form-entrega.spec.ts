import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEntrega } from './form-entrega';

describe('FormEntrega', () => {
  let component: FormEntrega;
  let fixture: ComponentFixture<FormEntrega>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEntrega]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormEntrega);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
