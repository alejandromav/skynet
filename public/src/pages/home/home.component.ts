import { Component, OnInit } from '@angular/core';

import { UserService } from './../../services/user.service';
import { RobotService } from './../../services/robot.service';
import { Robot } from './../../classes/robot';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: [ './home.component.css', './home-responsive.component.css' ]
})
export class HomeComponent implements OnInit {
	public title = 'Home';
	public loading: Boolean = true;
	public user;
	public robots: Array<Robot> = [];

	constructor(
		private userService: UserService,
		private robotService: RobotService
	) { }

	getRandomDelay() {
		const x = Math.round(Math.min(Math.random(),.3) * 1000)/1000;
		return `${x}s`;
	}

	ngOnInit() {
		const session = this.userService.getSavedSession();
		this.getRobots(session);
	}

	getRobots(session) {
		this.robotService.getAllRobots(session['username'], session['token']).subscribe(
			res => {
				this.loading = false;
				const robots = res['items'];

				this.robots = [
					{ id: 1, name: 'Terminator', model: 'T-800 Model 101', created_at: new Date('2029-02-03 19:33:54') },
					{ id: 2, name: 'Cameron', model: null, created_at: new Date('2029-06-13 21:33:54') },
					{ id: 3, name: 'Rossie', model: null, created_at: new Date('2031-05-21 05:22:35') },
					{ id: 4, name: 'Vick Chamberlain', model: 'T-888', created_at: new Date('2031-04-30 22:01:41') },
					{ id: 5, name: 'Myron Stark', model: 'T-888', created_at: new Date('2031-11-06 11:33:15') },
					{ id: 6, name: 'T-1001', model: 'T-1001', created_at: new Date('2035-12-01 04:12:43') },
				];
			}, err => {
				console.error(err);

				if (err.status === 401) {
					this.userService.deleteSession();
					location.reload();
				}

				this.loading = false;
		});
	}
}
