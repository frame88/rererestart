/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';
import { IMessage } from '../models/IMessages';
import { IStatus } from '../models/IStatus';
import { EventMqttService } from './event-mqtt.service';
import {StoreMessagesService } from './store-messages.service';

@Injectable({
  providedIn: 'root'
})
export class DataSharedService {
  // private statusArrSubject = new Subject<IStatus[]>();
  private statusSubject = new Subject<IStatus>();
  public messageSubject = new Subject<IMessage>();
  public status$ = this.statusSubject.asObservable();
  // public statusArr =
  public message$ = this.messageSubject.asObservable();


  constructor(
    public mqttService: EventMqttService,
    public store: StoreMessagesService
    ){}


    refreshData(status: IStatus | null, message: IMessage | null){
      if (status != null) {
        this.statusSubject.next(status);
      }
      if (message != null) {
        this.messageSubject.next(message);
      }
    }
}

