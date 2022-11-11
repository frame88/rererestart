import { IRefreshToken } from './models/IRefreshToken';
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './core/login/auth.service';
import { IUser } from './models/IUser';
import { StoreMessagesService } from './services/store-messages.service';

import { IStatusUser } from './models/IStatusUser';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { IUserMe } from './models/IUserMe';
import { environment } from 'src/environments/environment';
import { IAssociateSearch } from './models/IAssociateSearch';
import { IContactsLists } from './models/IContactsLists';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  statusUser: IStatusUser;
  associate: IAssociateSearch;
  userme: IUserMe;
  result: any;

  constructor(
    public auth: AuthService,
    private store: StoreMessagesService,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private menuCtrl: MenuController

  ){

   }
  ngOnInit(): void {
    if (localStorage.getItem('user') && this.auth.isLogged()){
      // this.auth.user = JSON.parse(localStorage.getItem('user')).username;
      this.auth.mqttSub();
      this.auth.publishStatus(JSON.parse(localStorage.getItem('user')).username);

      if(localStorage.getItem('menuUsers') && localStorage.getItem('usersOnline')){
        this.auth.sideMenuUsers = JSON.parse(localStorage.getItem('menuUsers'));
        this.auth.users = JSON.parse(localStorage.getItem('usersOnline'));
      }
      if(localStorage.getItem('chats')){
        this.store.storedChats = JSON.parse(localStorage.getItem('chats'));
      }
   }
  }

  clearNotifications(user: IUser){
    user.notifications = 0;

    localStorage.setItem('menuUsers', JSON.stringify(this.auth.sideMenuUsers));

  }


  // AGGIORNA LO STATO
  add(status) {
    // console.log(typeof(status));
    // console.log(status);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
    });
    this.http.post<IStatusUser>(`${environment.API.backend}/api/User/Status`, {status}, {headers})
    .subscribe(( result: IStatusUser ) => {
      this.statusUser = status;
      //console.log(status); //ritorna l'oggetto con success: true
      localStorage.setItem('statusUser', JSON.stringify(status));
    });
  }


  //RICERCA COLLEGA
  searchAsso(associate) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
    });
    if (associate !== null) {
      // console.log(`${associate}`);
      this.http.get<IAssociateSearch>(`${environment.API.backend}/api/User/Search?filter=${associate}`, {headers})
      .subscribe(( result: IAssociateSearch ) => {
        associate = result;
        console.log(associate);
    });
  }
}

//RITORNA INFORMAZIONI PERSONALI
  returnMe() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
    });

    let myinfo: any;
    this.http.get<IUserMe>(`${environment.API.backend}/api/User/Me`, {headers})
    .subscribe(( res: IUserMe) => {
      myinfo = res;
      console.log(myinfo.data.email);
      console.log(myinfo);
      // console.log(myinfo);
    });
  }


  /*
  mySquad() {
    let colleghi: any;
    this.http.get<IContactsList>(`${environment.API.backend}/api/Contact`, {headers: this.headers})
    .subscribe(( res: IContactsList) => {
      colleghi = res;
      console.log(colleghi);
    });
  }



} //chiude l'OnInit

*/
}
