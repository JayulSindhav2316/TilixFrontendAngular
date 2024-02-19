import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { EventQuestions, Events } from 'src/app/models/event';
import { QuestionBankService } from 'src/app/services/question-bank.service';

@Component({
  selector: 'app-event-questions',
  templateUrl: './event-questions.component.html',
  styleUrls: ['./event-questions.component.scss']
})
export class EventQuestionsComponent implements OnInit { 
  @Input() addNewEventRecord: boolean;
  @Input() eventId: number;
  @Output() activeTabEvent = new EventEmitter<number>();
  @Output() tabValueChangedEvent = new EventEmitter<number>();
  @Input() futureIndex:number;
  
  questionList: any[]=[];
  selectedQuestionList: any[] = [];
  selectedQuestionId: number;
  formValueChanged: boolean = false;

  constructor(private http: HttpClient,
    private questionBankService: QuestionBankService, 
    private messageService: MessageService,
    private breadcrumbService: AppBreadcrumbService,
    private confirmationService: ConfirmationService,
    private router: Router,)
    {
      this.breadcrumbService.setItems([
        { label: 'Home', routerLink: ['/'] },
        {label: 'Events', routerLink: ['/events/events']},
        {label: 'Questions'}
      ]);    
    }

  ngOnInit(): void
  {
    let eventQuestions = JSON.parse(sessionStorage.getItem("EventQuestions"));
    if (eventQuestions)
    {
      this.selectedQuestionList = eventQuestions.linkedQuestions;
      this.questionList = eventQuestions.sourceQuestions;
      this.formValueChanged = true;
      this.continue();
    }
    else
    {
      this.getQuestionsByEventId();    
    }
  }
  
  getQuestionOptionsListHTML(questionId: number) {
    let optionsHTML = "<ul>";
    let option = this.questionList.find(x => x.questionBankId == questionId).answerOptions;
    option.forEach((q) =>{
      optionsHTML += "<li>" + q.option + "</li>"
    });
    optionsHTML += "</ul>";
    return optionsHTML;
  }
  
  setActiveRow(questionId: number) {
    this.selectedQuestionId = questionId;
  }
  
  continue()
  {
    this.linkQuestions();
  }
  
  goBack()
  {
    if (this.formValueChanged)
    {      
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to continue?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
        {
          sessionStorage.removeItem("EventQuestions");
          this.setActiveTab(0);
          this.formValueChanged = false;
        }
      });
    }
    else
    { 
      sessionStorage.removeItem("EventQuestions");      
      this.setActiveTab(0);
      this.formValueChanged = false;
    }
  }
  
  cancel()
  {
    if (this.formValueChanged)
    {      
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to exit?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
        {
          sessionStorage.removeItem("EventQuestions");
          this.router.navigate(['events/events']);
          this.formValueChanged = false;
        }
      });
    }
    else
    { 
      sessionStorage.removeItem("EventQuestions");      
      this.router.navigate(['events/events']);
      this.formValueChanged = false;
    }
  }
  
  setActiveTab(value: number)
  {
    this.activeTabEvent.emit(value);
    console.log("Set Active Tab ->:" + value);
  }
  
  removeLinkedFromAvailableQuestions()
  {
    if (this.selectedQuestionList.length > 0)
    {    
      this.selectedQuestionList.forEach((question) => {
        var index = this.questionList.findIndex(x => x.questionBankId == question.questionBankId);
        this.questionList.splice(index, 1);      
      });
    }
  }
  
  getQuestionsByEventId()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId',  this.eventId);
    const opts = {params: searchParams};
    this.questionBankService.getQuestionsByEventId(opts).subscribe((data: any[]) =>{
      console.log(data);
      this.selectedQuestionList = data;
      this.getQuestionList();
    });
  }
  
  getQuestionList() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('status',  1);
    const opts = {params: searchParams};
    this.questionBankService.getAllQuestions(opts).subscribe((data: any[]) =>{
      console.log(data);
      this.questionList = data;
      this.removeLinkedFromAvailableQuestions();
    });
  }
  
  linkQuestions()
  {
    if (this.formValueChanged)
    {
      if (this.selectedQuestionList.length > 0)
      var questionLinkModelList = [];
      {
        this.selectedQuestionList.forEach((question) =>
        {
          const questionLinkModel = {
            eventId: this.eventId,
            questionBankId: question.questionBankId
          }
          questionLinkModelList.push(questionLinkModel);
        });
      }
      const body = {
        eventId: this.eventId,
        EventQuestions: questionLinkModelList
      }
      this.questionBankService.linkQuestionsByEventId(body).subscribe((data: any[]) =>{
        console.log(data);
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Questions linked successfully.",
          life: 3000,
        });
        sessionStorage.removeItem("EventQuestions");
        if(this.futureIndex>=0)
        {
          this.setActiveTab(this.futureIndex);
        }
        else
        {
          this.setActiveTab(2);
        }
        
      });    
    }
    else
    {
      sessionStorage.removeItem("EventQuestions");
      this.setActiveTab(2);
    }
    
  
  }
  
  formValueChangedEvent()
  {
    this.formValueChanged = true;
    let eventQuestions = {
      sourceQuestions: this.questionList,
      linkedQuestions: this.selectedQuestionList
    }
    sessionStorage.setItem("EventQuestions", JSON.stringify(eventQuestions));
    this.tabValueChangedEvent.emit(1);
  }

}
