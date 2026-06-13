import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatriculaPage } from './matricula.page';

describe('MatriculaPage', () => {
  let component: MatriculaPage;
  let fixture: ComponentFixture<MatriculaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatriculaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MatriculaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
