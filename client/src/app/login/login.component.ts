import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import axios from 'axios';
import {CookieService} from 'ngx-cookie-service';
import { ToastService } from 'angular-toastify';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive, RouterOutlet, NgIf],
  providers: [CookieService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private cookieService: CookieService,private _toastService: ToastService, private router: Router, private userService: UserService) {

  }

  addErrorToast(message: string) {
    this._toastService.error(message);
  }

  loginForm=new FormGroup({
    username: new FormControl<string|null>(null,[Validators.required]),
    password: new FormControl<string|null>(null,[Validators.required,Validators.minLength(6)]),
  })

  submitted = false;

  onSubmit() {
    this.submitted = true;
    if(!this.loginForm.valid){
      console.log(this.loginForm.controls);
      return;
    }
    // console.log(this.loginForm.value);

    axios.post('http://127.0.0.1:8000/login',{
      username: this.loginForm.value.username,
      password:this.loginForm.value.password
    }).then((res)=>{
      this.cookieService.set('Token', res.data.token);
      this.userService.setUser(res.data.user);
      // console.log(res.data);
      this.router.navigateByUrl('/');
    }).catch((e)=>{
      if(e.response.status===400){
        this.addErrorToast("Please enter correct password");
      }
      else{
        this.addErrorToast("Username does not exist.");
      }
    })
  }

  onInput() {
    this.submitted = false;
  }
}
