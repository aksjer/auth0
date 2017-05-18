import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import auth0 from 'auth0-js';
import { AuthToken } from './AuthToken';
import { BehaviorSubject } from 'rxjs/behaviorsubject';

@Injectable()
export class AuthService implements OnInit {

  userProfile: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  auth0 = new auth0.WebAuth({
    clientID: 'Ikt83YHEdl6RuYv6lRkJb3XPvneRr0f5',
    domain: 'aksjer.eu.auth0.com',
    responseType: 'token id_token',
    audience: 'https://aksjer.eu.auth0.com/userinfo',
    redirectUri: 'http://localhost:4200/home',
    scope: 'openid profile',
    leeway: 60
  });

  constructor(public router: Router) {
    this.getProfile();
  }

  ngOnInit(): void {

  }

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        // this.router.navigate(['/callback']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.error(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    localStorage.setItem('rememberMe', JSON.stringify(
      {
        'access_token': authResult.accessToken,
        'id_token': authResult.idToken,
        'expires_at': authResult.expiresIn + new Date().getTime()
      }
    ));
  }

  public logout(): void {
    localStorage.removeItem('rememberMe');
    this.router.navigate(['/home']);
  }

  public isAuthenticated(): boolean {
    const token: AuthToken = JSON.parse(localStorage.getItem('rememberMe'));
    return new Date().getTime() < token.expires_at;
  }

  public getProfile(): void {
    const token: AuthToken = JSON.parse(localStorage.getItem('rememberMe'));
    // if (!token) {
    //   throw new Error('Token must exist');
    // }
    this.auth0.client.userInfo(token.access_token, (err, profile) => {
      profile ? this.userProfile.next(profile) : this.userProfile.error(err);
    });
  }



}
