/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, OnDestroy, ElementRef, AfterViewChecked, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMessage } from 'src/app/models/IMessages';
import {  MqttService } from 'ngx-mqtt';
import { blankSpaceValidator } from 'src/app/validators/blankSpace.validator';

import { EventMqttService } from 'src/app/services/event-mqtt.service';

import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IChat, StoreMessagesService } from 'src/app/services/store-messages.service';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { AuthService } from 'src/app/core/login/auth.service';
import { IUser } from 'src/app/models/IUser';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit, OnDestroy, AfterViewChecked{
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  subscriptions: Subscription[] = [] ;
  chatUserName: string;
  myUser = this.auth.user;

  messages: IMessage[]= [];
  chat: IChat;
  messageForm: FormGroup = this.fb.group({
    msg: ['',[ Validators.required, blankSpaceValidator()]],

  });
  chatUserInfo: IUser;

  constructor(private activatedRoute: ActivatedRoute,
    private _mqtt: MqttService,
    private fb: FormBuilder,
    private mqttService: EventMqttService,
    public data: DataSharedService,
    public store: StoreMessagesService,
    public auth: AuthService,
    private menuCtrl: MenuController

    ) {
      this.chatUserName = this.activatedRoute.snapshot.paramMap.get('id');
      this.chatUserInfo = this.auth.sideMenuUsers.find(user=> user.user === this.chatUserName);
      this.auth.idUser = this.chatUserName;
    }

    ngOnInit() {
      this.menuCtrl.enable(true);
      this.messages = [];
      for(let i = 0; i< this.store.storedChats.length; i++){
        if(this.store.storedChats[i].users.includes(this.chatUserName)){
          this.messages.push(...this.store.storedChats[i].messages) ;
        }
      }
      // Sottoscrizione al messaggio, che viene smistato nelle chat e pushato
      this.subscriptions.push(
        this.data.message$.subscribe(r =>{
          this.messages = [];
          this.store.storeMessages(r);
          for(let i = 0; i< this.store.storedChats.length; i++){
            if(this.store.storedChats[i].users.includes(this.chatUserName)){
              this.chat = this.store.storedChats[i];
              this.messages.push(...this.chat.messages);
            }
          }
        })
        );
      }

      // Invia il messaggio e smista il messaggio inviato nella relativa chat
  sendmsg(msg): void {
    const par = {
      text: msg,
      sender : this.myUser,
      receiver: this.chatUserName,
      timestamp: new Date(),
    };
    this._mqtt.unsafePublish(`stagechat/message/${this.chatUserName.replace('.', '_')}`, JSON.stringify(par));
    this.store.storeMessages(par);
    this.messages = [];
    for(let i = 0; i< this.store.storedChats.length; i++){
      if(this.store.storedChats[i].users.includes(this.chatUserName)){
        this.chat = this.store.storedChats[i];
        this.messages.push(...this.chat.messages);
      }
    }
    this.messageForm.reset();
  }

  // Annulla sottoscrizioni
  ngOnDestroy(){
    if(this.subscriptions){
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }

  }

  // Inverte il movimento della scrollbar nella chat
  ngAfterViewChecked() {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  }

}
