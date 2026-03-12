import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mensaje } from './mensaje';

describe('Mensaje', () => {
  let component: Mensaje;
  let fixture: ComponentFixture<Mensaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mensaje]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mensaje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
