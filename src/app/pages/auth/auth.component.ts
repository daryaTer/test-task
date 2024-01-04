import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, MatInputModule, ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {

  form: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  errorMessage: {
    username?: string;
    password?: string;
  } = {};

  destroy$: Subject<boolean> = new Subject();

  token: string = '';

  constructor(private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authService.login(this.form.value)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.router.navigate(['/tasks']);
          }
          if (res.status === "error") {
            this.errorMessage = res.message
            if (res.message.password) {
              this.form.controls['password'].setErrors({ customError: res.message.password });
            }
            if (res.message.username) {
              this.form.controls['username'].setErrors({ customError: res.message.username });
            }
            this.form.markAllAsTouched();
          }
        },
        error: (err) => {
          this.authService.clearToken();
          alert("Smth went wrong.")
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}