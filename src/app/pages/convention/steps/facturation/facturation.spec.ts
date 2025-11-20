import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Facturation } from './facturation';

describe('Facturation', () => {
  let component: Facturation;
  let fixture: ComponentFixture<Facturation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Facturation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Facturation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
