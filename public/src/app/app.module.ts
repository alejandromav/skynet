import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Plugins

// Components
import { appRoutes } from './routes';
import { AppComponent } from './app.component';
import { HomeComponent } from './../pages/home/home.component';
import { LoginComponent } from './../pages/login/login.component';
import { SignupComponent } from './../pages/signup/signup.component';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		LoginComponent,
		SignupComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		RouterModule.forRoot(
			appRoutes
			// { enableTracing: true } // <-- debugging purposes only
		)
	],
	providers: [ ],
	bootstrap: [ AppComponent ]
})
export class AppModule { }
