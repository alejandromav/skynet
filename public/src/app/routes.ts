import { Routes } from '@angular/router';

import { HomeComponent } from '../pages/home/home.component';
import { LoginComponent } from '../pages/login/login.component';
import { SignupComponent } from '../pages/signup/signup.component';
import { AuthGuardService as AuthGuard } from './../services/auth-guard.service';

export const appRoutes: Routes = [
	{
		path: '',
		component: HomeComponent,
		data: { title: 'Dashboard' },
		canActivate: [ AuthGuard ]
	},
	{
		path: 'login',
		component: LoginComponent,
		data: { title: 'Login' }
	},
	{
		path: 'signup',
		component: SignupComponent,
		data: { title: 'Sign up' }
	},
	{ path: '**', redirectTo: '' } // not found
];
