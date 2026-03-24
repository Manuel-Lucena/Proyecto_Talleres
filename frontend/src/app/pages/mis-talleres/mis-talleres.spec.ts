import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTalleres } from './mis-talleres';

describe('MisTalleres', () => {
  let component: MisTalleres;
  let fixture: ComponentFixture<MisTalleres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTalleres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTalleres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
