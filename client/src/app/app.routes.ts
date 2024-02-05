import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateItineraryComponent } from './create-itinerary/create-itinerary.component';
import { ExploreItineraryComponent } from './explore-itinerary/explore-itinerary.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.gaurd';
import { ViewItineraryComponent } from './view-itinerary/view-itinerary.component';
import { ProfileComponent } from './profile/profile.component';
import { EditItineraryComponent } from './edit-itinerary/edit-itinerary.component';
import { GetSuggestionsComponent } from './get-suggestions/get-suggestions.component';

export const routes: Routes = [
    {path:"", component: HomeComponent},
    {path:"create-itinerary", component: CreateItineraryComponent, canActivate: [AuthGuard]},
    {path:"explore-itinerary", component: ExploreItineraryComponent},
    {path:"login", component:LoginComponent },
    {path:"signup", component:SignupComponent},
    {path:"itinerary/:id", component: ViewItineraryComponent},
    {path:"my-itineraries", component: ProfileComponent},
    {path:"edit-itinerary/:id", component: EditItineraryComponent},
    {path:"get-suggestions", component: GetSuggestionsComponent},
];
