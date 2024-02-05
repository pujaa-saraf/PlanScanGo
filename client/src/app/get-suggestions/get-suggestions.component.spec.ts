import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetSuggestionsComponent } from './get-suggestions.component';

describe('GetSuggestionsComponent', () => {
  let component: GetSuggestionsComponent;
  let fixture: ComponentFixture<GetSuggestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetSuggestionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
