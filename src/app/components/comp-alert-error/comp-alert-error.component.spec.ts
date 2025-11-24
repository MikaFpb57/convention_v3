/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompAlertErrorComponent } from './comp-alert-error.component';

describe('CompAlertErrorComponent', () => {
  let component: CompAlertErrorComponent;
  let fixture: ComponentFixture<CompAlertErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompAlertErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompAlertErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
