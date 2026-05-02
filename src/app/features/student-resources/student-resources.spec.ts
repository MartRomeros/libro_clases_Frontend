import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentResources } from './student-resources';

describe('StudentResources', () => {
  let component: StudentResources;
  let fixture: ComponentFixture<StudentResources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentResources],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentResources);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
