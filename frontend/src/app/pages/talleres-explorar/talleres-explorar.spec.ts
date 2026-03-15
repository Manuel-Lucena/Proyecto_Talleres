import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalleresExplorar } from './talleres-explorar';

describe('TalleresExplorar', () => {
  let component: TalleresExplorar;
  let fixture: ComponentFixture<TalleresExplorar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalleresExplorar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalleresExplorar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
