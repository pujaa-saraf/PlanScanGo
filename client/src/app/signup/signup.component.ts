import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import axios from 'axios';
import {CookieService} from 'ngx-cookie-service';
import { ToastService } from 'angular-toastify';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive, RouterOutlet, NgIf],
  providers: [CookieService],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  constructor(private cookieService: CookieService,private _toastService: ToastService, private router: Router, private userService: UserService) {

  }

  addErrorToast(message: string) {
    this._toastService.error(message);
  }

  signupForm=new FormGroup({
    username: new FormControl<string|null>(null,[Validators.required]),
    email: new FormControl<string|null>(null,[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    password: new FormControl<string|null>(null,[Validators.required,Validators.minLength(6)]),
    confirm_password: new FormControl<string|null>(null,[Validators.required,Validators.minLength(6)]),
  })

  submitted = false;
  password_matching=false;

  onSubmit() {
    this.submitted = true;
    if(!this.signupForm.valid){
      console.log(this.signupForm.controls);
      return;
    }
    if(this.signupForm.value.password!==this.signupForm.value.confirm_password){
      console.log(this.signupForm.controls);
      return;
    }
    this.password_matching=true;
    // console.log(this.signupForm.value);

    axios.post('http://127.0.0.1:8000/signup',{
      username: this.signupForm.value.username,
      password:this.signupForm.value.password,
      email:this.signupForm.value.email
    }).then((res)=>{
      this.cookieService.set('Token', res.data.token);
      this.userService.setUser(res.data.user);
      // console.log(res.data);
      this.router.navigateByUrl('/')
    }).catch((e)=>{
      console.log(e);
      if(e.response.status===400){
        this.addErrorToast("A user with that username already exists.");
      }
      else{
        this.addErrorToast("Network Error.");
      }
    })
  }

  onInput() {
    this.submitted = false;
  }
}
