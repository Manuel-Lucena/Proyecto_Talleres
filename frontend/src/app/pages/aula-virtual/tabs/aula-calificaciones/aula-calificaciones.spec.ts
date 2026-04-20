import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaCalificaciones } from './aula-calificaciones';

describe('AulaCalificaciones', () => {
  let component: AulaCalificaciones;
  let fixture: ComponentFixture<AulaCalificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaCalificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaCalificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
