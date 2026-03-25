import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTalleres } from './admin-talleres';

describe('AdminTalleres', () => {
  let component: AdminTalleres;
  let fixture: ComponentFixture<AdminTalleres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTalleres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTalleres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
