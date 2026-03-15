import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Notificacion } from './notificacion'; 
import { NotificacionService } from '../../../services/Notificacion.Service';

describe('Notificacion', () => {
  let component: Notificacion;
  let fixture: ComponentFixture<Notificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificacion], 
      providers: [NotificacionService] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notificacion);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});