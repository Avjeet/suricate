/*
 *  /*
 *  * Copyright 2012-2018 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {SidenavService} from '../../core/sidenav/sidenav.service';
import {WebsocketService} from '../../../shared/services/websocket.service';
import {takeWhile} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {Project} from '../../../shared/model/dto/Project';
import {Observable} from 'rxjs/Observable';
import {DashboardService} from '../dashboard.service';
import {WSUpdateEvent} from '../../../shared/model/websocket/WSUpdateEvent';
import {WSUpdateType} from '../../../shared/model/websocket/enums/WSUpdateType';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import * as Stomp from '@stomp/stompjs';

/**
 * Dashboard TV Management
 */
@Component({
  selector: 'app-code-view',
  templateUrl: './dashboard-tv.component.html',
  styleUrls: ['./dashboard-tv.component.css']
})
export class DashboardTvComponent implements OnInit, OnDestroy {

  /**
   * Tell if the component is displayed
   *
   * @type {boolean}
   */
  isAlive = true;

  /**
   * The project as observable
   */
  project$: Observable<Project>;

  /**
   * The screen code to display
   */
  screenCode: number;

  /**
   * The screen subscription (Code View)
   */
  screenSubscription: Subscription;

  /**
   * The constructor
   *
   * @param {SidenavService} sidenavService The sidenav service to inject
   * @param {DashboardService} dashboardService The dashboard service to inject
   * @param {WebsocketService} websocketService The websocket service to inject
   * @param {ActivatedRoute} activatedRoute The activated route service
   * @param {Router} router The router service
   */
  constructor(private sidenavService: SidenavService,
              private dashboardService: DashboardService,
              private websocketService: WebsocketService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  /**
   * Init of the component
   */
  ngOnInit() {
    this.sidenavService.closeSidenav();
    this.screenCode = this.websocketService.getscreenCode();

    this.dashboardService
        .currendDashbordSubject
        .pipe(takeWhile(() => this.isAlive))
        .subscribe(project => this.project$ = of(project));

    this.activatedRoute.queryParams.subscribe( params => {
      if (params['token']) {
        this.dashboardService.getOneByToken(params['token']).subscribe(project => {
          this.dashboardService.currendDashbordSubject.next(project);
        });

      } else {
        this.dashboardService.currendDashbordSubject.next(null);
        this.listenForConnection();
      }
    });

  }

  /**
   * When on code view screen we wait for new connection
   */
  listenForConnection() {
    this.websocketService.startConnection();
    this.screenSubscription = this
        .websocketService
        .subscribeToDestination(`/user/${this.screenCode}/queue/connect`)
        .pipe( takeWhile( () => this.isAlive ) )
        .subscribe((stompMessage: Stomp.Message) => {
          this.handleConnectEvent(JSON.parse(stompMessage.body));
        });
  }

  /**
   * Handle the connection event
   *
   * @param {WSUpdateEvent} updateEvent Update event
   */
  handleConnectEvent(updateEvent: WSUpdateEvent) {
    if (updateEvent.type === WSUpdateType.CONNECT) {
      const project: Project = updateEvent.content;

      if (project) {
        this.unsubscribeListening();
        this.websocketService.disconnect();
        this.router.navigate(['/tv'], {queryParams: {token: project.token} });
      }
    }
  }

  /**
   * Unsubscribe to the listening event
   */
  unsubscribeListening() {
    if (this.screenSubscription) {
      this.screenSubscription.unsubscribe();
    }
  }

  /**
   * When the component is destroyed
   */
  ngOnDestroy() {
    this.isAlive = false;
    this.sidenavService.openSidenav();

    this.unsubscribeListening();
    this.websocketService.disconnect();
  }
}
