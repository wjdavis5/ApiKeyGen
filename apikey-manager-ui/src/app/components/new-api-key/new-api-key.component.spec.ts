import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewApiKeyComponent } from './new-api-key.component';

describe('NewApiKeyComponent', () => {
  let component: NewApiKeyComponent;
  let fixture: ComponentFixture<NewApiKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewApiKeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewApiKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
