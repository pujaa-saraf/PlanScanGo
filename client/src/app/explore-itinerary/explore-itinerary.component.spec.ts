import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreItineraryComponent } from './explore-itinerary.component';

describe('ExploreItineraryComponent', () => {
  let component: ExploreItineraryComponent;
  let fixture: ComponentFixture<ExploreItineraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreItineraryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExploreItineraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
