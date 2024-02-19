import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { EventSession } from 'src/app/models/event-session';
import { QuestionBankService } from 'src/app/services/question-bank.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-eventquestion',
  templateUrl: './eventquestion.component.html',
  styleUrls: ['./eventquestion.component.scss']
})
export class EventquestionComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  eventSession : EventSession;
  eventQuestions:any;
  showEventQuestions : boolean;
  showSessionQuestions : boolean;
  constructor(private messageService: MessageService,
    private sessionService: SessionService,
    private questionService : QuestionBankService,private router: Router) { 
    this.showEventQuestions = false;
    this.showSessionQuestions = false;
    }

  ngOnInit(): void {
    this.eventSession = JSON.parse(localStorage.getItem('NewEventRegistrationSession'));
    this.getEventQuestions();
    //this.getSessionQuestions();
  }

  getEventQuestions()
  {
    this.eventSession.selectedQuestion = [];
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId', this.eventSession.eventId);
    const opts = { params: searchParams };
    this.questionService.getQuestionsByEventId(opts).subscribe((data: any[]) => {
      var counter = 1;
      data.forEach((d) => {
        const question: any = {}
        question.questionNumber = counter;
        question.eventId = this.eventSession.eventId;
        question.questionId = d.questionBankId;
        question.question = d.question;
        question.answerType = d.answerTypeLookUp.answerType;
        question.answerTypeLookUpId = d.answerTypeLookUp.answerTypeLookUpId;
        question.isEventLevelQuestion = true;
        if(d.answerOptions.length > 0)
        {
          question.answerOption = [];
          d.answerOptions.forEach((a) => {
            const answerOption: any = {}
            answerOption.answerOptionId = a.answerOptionId;
            answerOption.questionBankId = a.questionBankId;
            answerOption.option = a.option;
            question.answerOption.push(answerOption);
          });
        }
        this.eventSession.selectedQuestion.push(question);
        counter++;
      });
      if(this.findEventQuestions().length > 0)
      {
        this.showEventQuestions = true;
      }
      else 
      {
        this.showEventQuestions = false;
      }
      this.getSessionQuestions();
    },
      error => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: error,
          life: 3000,
        });
      });
  }

  getSessionQuestions()
  {
    this.eventSession.selectedSession.forEach((session) =>
    {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('sessionId', session.sessionId);
      const opts = { params: searchParams };
      this.questionService.getQuestionsBySessionId(opts).subscribe((data: any[]) => {
        var counter = 1;
        data.forEach((d) => {
          const question: any = {}
          question.questionNumber = counter;
          question.sessionId = session.sessionId;
          question.questionId = d.questionBankId;
          question.question = d.question;
          question.answerType = d.answerTypeLookUp.answerType;
          question.answerTypeLookUpId = d.answerTypeLookUp.answerTypeLookUpId;
          question.isEventLevelQuestion = false;
          if(d.answerOptions.length > 0)
          {
            question.answerOption = [];
            d.answerOptions.forEach((a) => {
              const answerOption: any = {}
              answerOption.answerOptionId = a.answerOptionId;
              answerOption.questionBankId = a.questionBankId;
              answerOption.option = a.option;
              question.answerOption.push(answerOption);
            });
          }
          this.eventSession.selectedQuestion.push(question);
          counter++;
        });
        if(this.findSessionQuestions().length > 0 && this.findEventQuestions().length == 0)
        {
          this.showSessionQuestions = true;
        }
        else
        {
          this.showSessionQuestions = false;
        }
      },
        error => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 3000,
          });
        });
    });
  }

  findEventQuestions() : any[]
  {
      return this.eventSession.selectedQuestion.filter(s=>s.isEventLevelQuestion);
  }
  
  findSessionQuestions() : any[]
  {
      return this.eventSession.selectedQuestion.filter(s=>s.isEventLevelQuestion == false);
  }

  sessionQuestionPageClick()
  {
    this.showEventQuestions = false;
    this.showSessionQuestions = true;
  }

  eventQuestionPageClick()
  {
    this.showEventQuestions = true;
    this.showSessionQuestions = false;
  }

  selectQuestion()
  {
    const jsonData = JSON.stringify(this.eventSession);
    localStorage.setItem('NewEventRegistrationSession', jsonData);
    console.log(jsonData);
    this.setActiveTab(3);
  }

  goBack(){
    this.setActiveTab(1);
  }

  goToSearch(){ 
    this.router.navigate(['eventregistration/searchMember'], {
      queryParams: {  }
    });
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }

  setDate(event:any,question:any)
  {
    question.answerValue = moment(new Date(event)).format('MM/DD/yyyy');
  }

  
  setTime(event:any,question:any)
  {
    question.answerValue = moment(new Date(event)).format('hh:mm a');
  }

  
  setDateTime(event:any,question:any)
  {
    question.answerValue = moment(new Date(event)).format('MM/DD/yyyy hh:mm a');
  }
}
