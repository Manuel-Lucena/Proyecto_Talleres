import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaMuro } from './aula-muro';

describe('AulaMuro', () => {
  let component: AulaMuro;
  let fixture: ComponentFixture<AulaMuro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaMuro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaMuro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
