/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompTdComponent } from './comp-td.component';

describe('CompTdComponent', () => {
  let component: CompTdComponent;
  let fixture: ComponentFixture<CompTdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompTdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompTdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
