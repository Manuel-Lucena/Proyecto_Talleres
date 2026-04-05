import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaParticipantes } from './aula-participantes';

describe('AulaParticipantes', () => {
  let component: AulaParticipantes;
  let fixture: ComponentFixture<AulaParticipantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaParticipantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaParticipantes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
