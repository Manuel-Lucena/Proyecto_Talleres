import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHorarios } from './admin-horarios';

describe('AdminHorarios', () => {
  let component: AdminHorarios;
  let fixture: ComponentFixture<AdminHorarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHorarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHorarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
