import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaForo } from './aula-foro';

describe('AulaForo', () => {
  let component: AulaForo;
  let fixture: ComponentFixture<AulaForo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaForo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaForo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
