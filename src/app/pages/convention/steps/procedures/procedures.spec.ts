import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Procedures } from './procedures';

describe('Procedures', () => {
  let component: Procedures;
  let fixture: ComponentFixture<Procedures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Procedures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Procedures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
