import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import axios from 'axios';
import { Observable, map, startWith } from 'rxjs';
import { cities } from '../../assets/citiesData';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NgxLoadingModule, NgxLoadingService } from 'ngx-loading';
import { environment } from '../../environments/environment';



@Component({
  selector: 'app-create-itinerary',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, CommonModule, NgSelectModule, NgxLoadingModule],
  templateUrl: './create-itinerary.component.html',
  styleUrls: ['./create-itinerary.component.css']
})
export class CreateItineraryComponent {
  itineraryForm: FormGroup;
  filteredCities: Observable<{ name: string; value: string; }[]>;
  cookieValue: string | null = null;
  loading:boolean=false;

  constructor(private cookieService: CookieService, private fb: FormBuilder, private _toastService: ToastService, private router: Router, private ngxLoadingService: NgxLoadingService) {

    this.cookieValue = this.cookieService.get('Token');

    this.itineraryForm = this.fb.group({
      location: ['', Validators.required],
      days: this.fb.array([this.createDayControl()]),
    });

    this.filteredCities = this.itineraryForm.get('location')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): { name: string; value: string; }[] {
    const filterValue = value.toLowerCase();
    if (filterValue === '') {
      return cities.map(city => ({ name: city, value: city }));
    } else {
      return cities.filter(city => city.toLowerCase().includes(filterValue)).map(city => ({ name: city, value: city }));
    }
  }

  addErrorToast(message: string) {
    this._toastService.error(message);
  }

  get dayControls() {
    return (this.itineraryForm.get('days') as FormArray).controls as FormGroup[];
  }

  createDayControl() {
    return this.fb.group({
      points: this.fb.array([this.createPointControl()])
    });
  }

  createPointControl() {
    return this.fb.control('', Validators.required);
  }

  getPointsControl(dayIndex: number): FormArray {
    return (this.dayControls[dayIndex].get('points') as FormArray);
  }

  getPointControl(dayIndex: number, pointIndex: number): FormControl {
    return this.getPointsControl(dayIndex).at(pointIndex) as FormControl;
  }

  addDay() {
    const daysArray = this.itineraryForm.get('days') as FormArray;
    const lastDayControl = daysArray.at(daysArray.length - 1) as FormGroup;
    const lastPointControl = (lastDayControl.get('points') as FormArray).at((lastDayControl.get('points') as FormArray).length - 1) as FormControl;
    if (lastPointControl.valid && lastPointControl.value !== '') {
      daysArray.push(this.createDayControl());
    }
  }

  addPoint(dayIndex: number) {
    const dayControl = this.dayControls[dayIndex];
    const pointsArray = dayControl.get('points') as FormArray;
    const lastPointControl = pointsArray.at(pointsArray.length - 1) as FormControl;

    if (lastPointControl.valid && lastPointControl.value !== '') {
      pointsArray.push(this.createPointControl());
    }
  }

  deleteDay(index: number) {
    const daysArray = this.itineraryForm.get('days') as FormArray;

    if (daysArray.length > 1) {
      daysArray.removeAt(index);
    }
  }

  deletePoint(dayIndex: number, pointIndex: number) {
    const dayControl = this.dayControls[dayIndex];
    const pointsArray = dayControl.get('points') as FormArray;

    if (pointsArray.length > 1) {
      pointsArray.removeAt(pointIndex);
    }
  }

  onSubmit() {
    if (this.itineraryForm.valid) {

      this.loading=true;

      let config = {
        headers: {
          'Authorization': 'Token ' + this.cookieValue
        }
      }

      let config_qr = {
        headers: {
          'Authorization': 'Token '+environment.qrApiKey
        }
      }

      let itinerary_id=null;
      let qr_id=null;
      let qr_url="#";

      axios.post('http://127.0.0.1:8000/create_itinerary', {
        location: this.itineraryForm.value.location,
        no_of_days: this.itineraryForm.value.days.length,
        days: this.itineraryForm.value.days.map((itinerary: { points: string[]; }) => itinerary.points),
        qr_code: "#",
        qr_url:"#"
      }, config).then((res) => {
        // console.log(res.data);
        itinerary_id=res.data.id;

          const body = {
            "name": "Custom URL",
            "organization": environment.qrOrg,
            "qr_type": 2,
            "campaign": {
              "content_type": 1,
              "custom_url": "http://localhost:4200/itinerary/"+ itinerary_id!.toString()
            },
            "location_enabled": false,
            "attributes": {
              "color": "#8C7D6B",
              "colorDark": "#8C7D6B",
              "margin": 80,
              "isVCard": false,
              "dataPattern": "square",
              "eyeBallShape": "circle",
              "gradientType": "none",
              "eyeFrameColor": "#8C7D6B",
              "eyeFrameShape": "rounded"
            }
          }

        return axios.post('https://q.api.beaconstac.com/api/2.0/qrcodes/', body, config_qr);
      }).then((res)=>{
        // console.log(res.data);
        qr_id=res.data.id;
        return axios.get('https://q.api.beaconstac.com/api/2.0/qrcodes/' + qr_id + '/download/?size=1024&error_correction_level=5&canvas_type=png', config_qr)

      })
      .then((res)=>{
        // console.log(res.data);
        qr_url=res.data.urls.png;

        return axios.put('http://127.0.0.1:8000/edit_itinerary/'+itinerary_id!.toString(),{
          location: this.itineraryForm.value.location,
          no_of_days: this.itineraryForm.value.days.length,
          days: this.itineraryForm.value.days.map((itinerary: { points: string[]; }) => itinerary.points),
          qr_code: qr_id!.toString(),
          qr_url: qr_url
        },config);

      })
      .then((res)=>{
        // console.log(res.data);
        this.loading=false;
        this.router.navigateByUrl('/my-itineraries')
      }).catch((e) => console.log(e));

    }
    else {
      this.addErrorToast("Please complete all fields to submit.");
    }
  }
}
