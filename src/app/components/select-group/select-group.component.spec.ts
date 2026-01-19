import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectGroup } from './select-group.component';

describe('SelectGroup', () => {
  let component: SelectGroup;
  let fixture: ComponentFixture<SelectGroup>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
