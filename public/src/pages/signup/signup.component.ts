import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';


import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: [
		'./signup.component.css',
		'../common/login.css',
		'../common/form.css',
		'../common/form-responsive.css',
		'../common/login-responsive.css'
	]
})
export class SignupComponent {
	public loading: Boolean = false;
	public error: String;
	public signupForm: FormGroup;
	public user = {
		name: null,
		username: null,
		password: null,
		email: null
	}

	constructor(public router: Router, private userService: UserService) {
		this.userService.deleteSession();
	}

	// Getters
	get name() { return this.signupForm.get('name'); }
	get username() { return this.signupForm.get('username'); }
	get password() { return this.signupForm.get('password'); }
	get email() { return this.signupForm.get('email'); }

	ngOnInit(): void {
		this.signupForm = new FormGroup({
			'name': new FormControl(this.user.name, [ Validators.required ]),
			'username': new FormControl(this.user.username, [ Validators.required ]),
			'password': new FormControl(this.user.password, [ Validators.required ]),
			'email': new FormControl(this.user.email, [ Validators.required, Validators.email ]),
		});
	}

	// Form submit controller
	async onSubmit() {
		if (!this.signupForm.invalid) {
			console.log('Form submitted', this.user);

			this.signupForm.disable();
			this.loading = true;
			this.error = null;

			this.userService.signupUser(this.name.value, this.username.value, this.password.value, this.email.value)
				.subscribe(
					user => {
						this.loading = false;
						this.signupForm.enable();

						this.router.navigate(['login']);
					}, err => {
						this.loading = false;
						this.signupForm.enable();
						this.error = err['error']['err'] || 'Internal server error';
				});
		}
	}
}
