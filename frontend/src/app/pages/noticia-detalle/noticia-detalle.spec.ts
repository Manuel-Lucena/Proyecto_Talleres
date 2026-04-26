import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticiaDetalle } from './noticia-detalle';

describe('NoticiaDetalle', () => {
  let component: NoticiaDetalle;
  let fixture: ComponentFixture<NoticiaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticiaDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticiaDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
