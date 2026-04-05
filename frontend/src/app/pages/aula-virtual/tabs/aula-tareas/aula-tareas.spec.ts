import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaTareas } from './aula-tareas';

describe('AulaTareas', () => {
  let component: AulaTareas;
  let fixture: ComponentFixture<AulaTareas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaTareas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaTareas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
