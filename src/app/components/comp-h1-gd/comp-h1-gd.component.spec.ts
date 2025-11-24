/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompH1GdComponent } from './comp-h1-gd.component';

describe('CompH1GdComponent', () => {
  let component: CompH1GdComponent;
  let fixture: ComponentFixture<CompH1GdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompH1GdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompH1GdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
