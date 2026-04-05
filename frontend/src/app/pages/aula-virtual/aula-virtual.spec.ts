import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaVirtual } from './aula-virtual';

describe('AulaVirtual', () => {
  let component: AulaVirtual;
  let fixture: ComponentFixture<AulaVirtual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaVirtual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaVirtual);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
