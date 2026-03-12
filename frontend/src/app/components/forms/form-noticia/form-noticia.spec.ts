import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNoticia } from './form-noticia';

describe('FormNoticia', () => {
  let component: FormNoticia;
  let fixture: ComponentFixture<FormNoticia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormNoticia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNoticia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
