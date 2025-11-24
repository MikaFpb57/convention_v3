/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompInputComponent } from './comp-input.component';

describe('CompInputComponent', () => {
  let component: CompInputComponent;
  let fixture: ComponentFixture<CompInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
