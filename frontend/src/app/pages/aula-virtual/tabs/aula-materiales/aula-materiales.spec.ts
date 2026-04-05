import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaMateriales } from './aula-materiales';

describe('AulaMateriales', () => {
  let component: AulaMateriales;
  let fixture: ComponentFixture<AulaMateriales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaMateriales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaMateriales);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
