/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { IAuth } from 'src/app/models/IAuth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { IToken } from 'src/app/models/IToken';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { IUserInfo } from 'src/app/models/IUserInfo';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Subscription, interval } from 'rxjs';
import { IMessage } from 'src/app/models/IMessages';
import { IStatus } from 'src/app/models/IStatus';
import { EventMqttService } from 'src/app/services/event-mqtt.service';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { StoreMessagesService } from 'src/app/services/store-messages.service';
import { NavController } from '@ionic/angular';
import { IUser } from 'src/app/models/IUser';
import { IUserResponse } from 'src/app/models/IUserResponse';
import { ToastController } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})
export class AuthService {


// Variabili User
  data: IAuth | undefined ;
  token: string;
  userData: IUserInfo = {
    token: '',
    expDate: null,
    username: '',
    name: '',
    surname: '',
    email:''
  };
  expirationDate: Date;
  user = '';

// Variabili lista Utenti
  idUser: string;
  onlineUser: IUser;
  users: string[]= [];
  sideMenuUsers: IUser[] = [];

// Variabili Errore
  error = false;
  errorMessage = '';

  subscriptions: Subscription[] = [];
  statusTopic = environment.MQTT.subscriptions.status;

  now: number;
  date$ = interval(1000).pipe(
    map(() => new Date())).subscribe(
      (r) => {
        this.now = r.getTime() - 7500;  // get Date - 7500 = orario attuale
      }
      );


 statusInterval;

  constructor(
    private http: HttpClient,
    private router: Router,
    private mqtt: MqttService,
    private mqttService: EventMqttService,
    public dataShared: DataSharedService,
    private store: StoreMessagesService,
    private navCtrl: NavController,
    private toastController: ToastController,


    ){}

  login({user, pass }: {user: string; pass: string}) {

    const user64 = btoa(user);
    const pass64 = btoa(pass);

    this.data = {
      username: user64,
      password: pass64,
    };

    // Autenticazione e creazione del token
    this.http.post<IToken>(`${environment.API.backend}/api/Auth/Login`, this.data)
    .subscribe((res: IToken ) => {
      console.log(res);
      if(res.success){

        this.error = false;

        this.token = res.data.token;

        this.expirationDate = res.data.expirationDate;

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${res.data.token}`
        });

        this.http.get<IUserResponse>(`${environment.API.backend}/api/User/Me`, {headers})
        .subscribe( (r: IUserResponse) => {

          this.userData = {
            token: this.token,
            username: r.data.username,
            expDate: this.expirationDate,
            name: r.data.name,
            surname: r.data.surname,
            email: r.data.email
          };

          localStorage.setItem('user', JSON.stringify(this.userData));

          this.user = JSON.parse(localStorage.getItem('user')).username;

          this.publishStatus(this.user);

          this.mqttSub();                  // sottoscrizioni MQTT

          this.router.navigateByUrl('chat/', {replaceUrl: true});

        });

      }
      else if(res.errorMessage){
          this.error = true;

          this.errorMessage = res.errorMessage;
      }

    });

  }

  mqttSub(){

    this.userData = JSON.parse(localStorage.getItem('user'));

    // Sottoscrizione STATUS
    this.subscriptions.push(
      this.mqttService.topic('stagechat/status').subscribe((resp: IMqttMessage) => {

        const rtn = resp.payload.toString();
        if(rtn !== ''){

          const dataStatus: IStatus = JSON.parse(rtn);

          if (!this.users.includes(dataStatus.user) && dataStatus.user !== this.user){

            const onlineAt= new Date(dataStatus.timestamp).getTime();

            this.users.push(dataStatus.user);

            this.sideMenuUsers.push({
              user: dataStatus.user,
              url:`/chat/${dataStatus.user}`,
              icon: 'mail',
              timestamp: onlineAt,
              notifications: null
            });

            localStorage.setItem('usersOnline', JSON.stringify(this.users));

            localStorage.setItem('menuUsers', JSON.stringify(this.sideMenuUsers));

            // this.dataShared.refreshData(dataStatus, null);

          }
          else if (this.users.includes(dataStatus.user) ){

            const time = new Date(dataStatus.timestamp);

            for(const element of this.sideMenuUsers){

              if(element.user === dataStatus.user){
                element.timestamp = time.getTime();
              }
            }
          }
        }

        // Sottoscrizione MESSAGGI
        if ( this.user !== '' && this.subscriptions.length < 2){

          this.subscriptions.push(
            this.mqttService.topic(`stagechat/message/${this.user.replace('.','_')}`).subscribe((rs: IMqttMessage) => {

              const msgRtn = rs.payload.toString();

              if(msgRtn !== ''){
                const messageObj: IMessage = JSON.parse(msgRtn);

                this.dataShared.refreshData(null , messageObj);

                this.notifications(messageObj.sender);
              }
            })
            );
        }
      })
    );
  }

  isLogged(){
    if(localStorage.getItem('user')){

      this.user = JSON.parse(localStorage.getItem('user')).username;
      const boh = JSON.parse(localStorage.getItem('user')).expDate;

      return !!(localStorage.getItem('user') && new Date(boh) < new Date() === false);
    }
  }

  // Pubblicazione Status Online
  publishStatus(user){

    this.mqtt.unsafePublish('stagechat/status',
    `{"user": "${user}",
    "timestamp": "${ new Date().toISOString()}"}`);

    this.statusInterval = setInterval(()=>{
      this.mqtt.unsafePublish('stagechat/status',
      `{"user": "${user}",
      "timestamp": "${new Date().toISOString()}"}`
      );
    },1000);
  }

  // Notifiche Messaggi
  async notifications(sender: string,){
    if (sender !== this.idUser){

      this.onlineUser = this.sideMenuUsers.find(user => user.user === sender);

      this.onlineUser.notifications += 1;

      localStorage.setItem('menuUsers', JSON.stringify(this.sideMenuUsers));

      const toast = this.toastController.create({

        message: 'Nuovo messaggio da ' + sender,

        duration: 2000,

        translucent: true,

        cssClass: 'toast',

        buttons:[
          {

            handler: () => {
              this.router.navigateByUrl(`chat/${sender}`);
              this.onlineUser.notifications = 0;
              localStorage.setItem('menuUsers', JSON.stringify(this.sideMenuUsers));

            }
          }
        ]

      });
      (await toast).present();

    }
  }

  logout() {

    this.subscriptions.forEach((sub) =>sub.unsubscribe());
    this.subscriptions = [];
    clearInterval(this.statusInterval);

    this.users =[];
    this.sideMenuUsers = [];
    this.store.storedChats = [];

    this.data = null;
    this.user = '';
    localStorage.clear();

    this.navCtrl.navigateRoot('/login', { animated: true, animationDirection: 'forward' });
  }
}
