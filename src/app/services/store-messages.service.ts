/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { IMessage } from '../models/IMessages';

export interface IChat{
  users: string[];
  messages: IMessage[];
}

@Injectable({
  providedIn: 'root'
})


export class StoreMessagesService {
  chat: IChat;
  storedChats: IChat[] = [];
  messages: IMessage[];
  constructor(

  ){}
  // Salva i messaggi nelle relative chat che possono essere recuperate
  storeMessages(message: IMessage){
    //Crea una nuova chat e pusha il messaggio nella chat
    if(this.storedChats.length === 0){
       this.storedChats.push({
        users:[message.receiver, message.sender],
        messages:[message]
      });

    } else {
      // Fa un controllo per ogni chat presente nell'array
      for(let i = 0; i < this.storedChats.length; i++){

          // Se il sender/receiver sono già presenti in una delle chat, pusha il messaggio
          if(this.storedChats[i].users.includes(message.receiver) && this.storedChats[i].users.includes(message.sender)){
            this.storedChats[i].messages.push(message);
          localStorage.setItem('chats', JSON.stringify(this.storedChats));
          return this.storedChats[i];
          }else {
            // Crea una nuova chat e pusha il messaggio
            this.storedChats.push({
              users:[message.receiver, message.sender],
              messages:[] });

          }
      }
    }
    localStorage.setItem('chats', JSON.stringify(this.storedChats));
    console.log(this.storedChats);
  }
  pushChat( user){

    for(let i = 0; i< this.storedChats.length; i++){
      if(this.storedChats[i].users.includes(user)){
        this.chat = this.storedChats[i];
        this.messages.push(...this.chat.messages);
      }
    }

  }
}

