import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fichiers } from './fichiers';

describe('Fichiers', () => {
  let component: Fichiers;
  let fixture: ComponentFixture<Fichiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fichiers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fichiers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
