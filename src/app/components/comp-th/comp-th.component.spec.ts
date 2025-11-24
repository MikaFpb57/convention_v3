/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompThComponent } from './comp-th.component';

describe('CompThComponent', () => {
  let component: CompThComponent;
  let fixture: ComponentFixture<CompThComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompThComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompThComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
