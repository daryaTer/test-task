import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { BehaviorSubject, Observable, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly TOKEN_EXPIRATION_KEY = 'tokenExpiration';
  private tokenSubject: BehaviorSubject<string | null>;

  constructor(private apiService: ApiService) {
    this.tokenSubject = new BehaviorSubject<string | null>(this.getTokenFromStorage());

    window.addEventListener('storage', (event) => {
      if (event.key === AuthService.TOKEN_KEY) {
        this.tokenSubject.next(this.getTokenFromStorage());
      }
    });
  }

  login(form: { username: string; password: string }): Observable<any> {
    const body = new FormData();
    body.append('username', form.username);
    body.append('password', form.password);
    return this.apiService.post('login', body)
      .pipe(tap(response => {
        if (response.status === "ok") {
          this.saveToken(response.message.token);
        }
        if (response.status === "error") {
          this.clearToken();
        }
      }));
  }

  saveToken(token: string): void {
    const now = new Date().getTime();
    const expiration = now + 24 * 60 * 60 * 1000;
    localStorage.setItem(AuthService.TOKEN_KEY, token);
    localStorage.setItem(AuthService.TOKEN_EXPIRATION_KEY, expiration.toString());
    this.tokenSubject.next(token);
  }

  getToken(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  getTokenFromStorage(): string | null {
    const expiration = localStorage.getItem(AuthService.TOKEN_EXPIRATION_KEY);
    const now = new Date().getTime();

    if (!expiration || now > Number(expiration)) {
      this.clearToken();
      return null;
    }

    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.TOKEN_EXPIRATION_KEY);
    if (this.tokenSubject) {
      this.tokenSubject.next(null);
    }
  }

  hasToken(): boolean {
    return this.getTokenFromStorage() !== null;
  }
}
