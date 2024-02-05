import { NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxLoadingModule, NgxLoadingService } from 'ngx-loading';

@Component({
  selector: 'app-edit-itinerary',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, CommonModule, NgxLoadingModule],
  templateUrl: './edit-itinerary.component.html',
  styleUrl: './edit-itinerary.component.css'
})
export class EditItineraryComponent implements OnInit {

  itineraryForm: FormGroup;
  cookieValue: string | null = null;
  loading:boolean=false;
  itineraryId: string | null = null;
  itinerary: { id: number, location: string, no_of_days: number, days: string[][], qr_code: string, qr_url: string } | null = null;

  constructor(private route: ActivatedRoute,private cookieService: CookieService, private fb: FormBuilder, private _toastService: ToastService, private router: Router, private ngxLoadingService: NgxLoadingService, private cdr: ChangeDetectorRef) {
    this.itineraryForm = this.fb.group({
      days: this.fb.array([this.createDayControl()]),
    });
  }

  ngOnInit(){

    this.cookieValue = this.cookieService.get('Token');

    this.route.paramMap.subscribe(params => {
      this.itineraryId = params.get('id');
    });

    axios.get('http://127.0.0.1:8000/itinerary/' + this.itineraryId).then((res) => {
        this.itinerary=res.data
        this.populateDaysAndPoints();
        this.cdr.detectChanges();
      }).catch((e) => {
        console.log(e);
      });
  }

  populateDaysAndPoints() {
    const days = this.itinerary?.days || [];
    const dayControls = days.map((day) => {
      const pointsArray = day.map((point) => this.createPointControl(point));
      return this.fb.group({
        points: this.fb.array(pointsArray)
      });
    });

    this.itineraryForm.setControl('days', this.fb.array(dayControls));
  }

  get dayControls() {
    return (this.itineraryForm?.get('days') as FormArray).controls as FormGroup[];
  }

  createDayControl() {
    return this.fb.group({
      points: this.fb.array([this.createPointControl('')])
    });
  }

  createPointControl(point: string) {
    return this.fb.control(point, Validators.required);
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
      pointsArray.push(this.createPointControl(''));
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

      axios.put('http://127.0.0.1:8000/edit_itinerary/'+this.itineraryId,{
          location: this.itinerary!.location,
          no_of_days: this.itineraryForm.value.days.length,
          days: this.itineraryForm.value.days.map((itinerary: { points: string[]; }) => itinerary.points),
          qr_code: this.itinerary!.qr_code,
          qr_url: this.itinerary!.qr_url

        },config).then((res)=>{

        // console.log(res.data);
        this.loading=false;
        this.router.navigateByUrl('/my-itineraries')

      }).catch((e) => console.log(e));

    }
    else {
      this.addErrorToast("Please complete all fields to submit.");
    }
  }

  addErrorToast(message: string) {
    this._toastService.error(message);
  }
  
}
