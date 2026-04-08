import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInscripciones } from './admin-inscripciones';

describe('AdminInscripciones', () => {
  let component: AdminInscripciones;
  let fixture: ComponentFixture<AdminInscripciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInscripciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInscripciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
