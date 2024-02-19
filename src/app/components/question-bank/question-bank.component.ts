import { Time } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { randomInt } from 'crypto';
import { AnyNaptrRecord } from 'dns';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { AnswerOptionService } from 'src/app/services/answer-option.service';
import { LookupService } from 'src/app/services/lookup.service';
import { QuestionBankService } from 'src/app/services/question-bank.service';

@Component({
  selector: 'app-question-bank',
  templateUrl: './question-bank.component.html',
  styleUrls: ['./question-bank.component.scss'],
  providers: [MessageService]
})
export class QuestionBankComponent implements OnInit {
  @ViewChild('dt') table: Table;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key=="Escape"){
      this.resetActiveRow();
    }
  }
  @HostListener('document:mousedown', ['$event'])
  handleMouseEvent(event: MouseEvent) {
    // this.resetActiveRow();
  }

  questionList: any[] = [];
  clonedProducts: { [s: string]: any; } = {};
  addNewQuestionRecord: boolean;
  addNewOptionRecord: boolean;
  selectedQuestionRowIndex: number = -1;
  selectedOptionRowIndex: number = -1;
  answerTypeLookUpList: any[];
  expandedRows:any[] = [];
  expandOptions: boolean = false;
  selectedQuestion: any;
  selectedOption: any;
  clonedQuestionList: { [s: string]: any; } = {};
  currentDate: Date = new Date();
  includeInactive: boolean = false;
  searchText: string;
  currentFirstRow: number = 0;
  submitted: boolean = false;

  constructor(
    private messageService: MessageService,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private lookUpService: LookupService,
    private questionBankService: QuestionBankService,
    private answerOptionService: AnswerOptionService,
    private breadcrumbService: AppBreadcrumbService) {
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Set Up'},
      {label: 'Questions'},
    ]);
    }

  ngOnInit(): void {
    this.getQuestions();
    this.getAnswerTypeLookup();
  }

  addNewQuestion(){
    this.searchText = "";
    this.addNewQuestionRecord = true; 
    let question = {
      questionBankId: 0,
      question : "",
      answerTypeLookUpId : 0,
      status : 1,
      answerOptions: []
    };
    this.questionList.unshift(question);
    let elementId = "question_" + question.questionBankId.toString();
    setTimeout(() => this.focusOnControl(elementId), 1000);
    this.setActiveRow(question, this.questionList.length - 1);
  }

  getQuestions() {
    let status = this.includeInactive ? 0 : 1;
    let searchParams = new HttpParams();
    searchParams = searchParams.append('status',  status);
    const opts = {params: searchParams};
    this.questionBankService.getAllQuestions(opts).subscribe((data: any[]) =>{
      console.log(data);
      this.questionList = data;
    });
  }

  includeInactiveQuestions(event: any){
    this.includeInactive = event.checked;
    this.getQuestions();
  }

  focusOnControl(elementId: string){    
    let inputElement: HTMLElement = document.getElementById(elementId) as HTMLElement;
    inputElement.focus();
  }

  answertTypeChanged(event: any, question: any, index: number){
    console.log(event);
    this.setActiveRow(question, index);
    
    if(question.questionBankId == 0 && question.answerOptions.length == 0){
      this.addNewOption(question);
    }

    if(question.questionBankId > 0 &&  question.answerOptions.length > 0 && (question.answerTypeLookUpId != 3 && question.answerTypeLookUpId != 4)) {      

      this.confirmationService.confirm({
        message: 'All your options will be deleted. Are you sure you want to change the answer type ?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
        {
          question.answerOptions = [];
          this.updateQuestion(question, index, false);
        },
        reject:() =>
        {
          this.getQuestions();
        }
      });
    }
    else{
      this.updateQuestion(question, index, false);
    }
  }

  deleteQuestion(questionModel: any, index: number){
    this.setActiveRow(questionModel, index);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this question ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.questionBankService.deleteQuestion(questionModel.questionBankId).subscribe(response => 
        { 
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Question deleted successfully.", life: 3000 });
          this.resetActiveRow();
        },
        error => {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
    });
  }

  setActiveRow(question: any, index: number){
    this.selectedQuestionRowIndex = question.questionBankId;
    this.selectedOptionRowIndex = -1;
    this.selectedQuestion = question;

    const thisRef = this;
    thisRef.expandedRows =[];
    this.questionList.forEach(function(q) {
      if(q.questionBankId == question.questionBankId){
        thisRef.expandedRows[q.questionBankId] = true;
      }
    });
  }

  resetActiveRow(){    
    this.selectedQuestionRowIndex = -1;
    this.selectedQuestion = {};
    this.addNewQuestionRecord = false;
    this.addNewOptionRecord = false;
    this.getQuestions();
    const thisRef = this;
    thisRef.expandedRows =[];
  }

  getAnswerTypeLookup(){
    this.lookUpService.getAnswerTypeLookup().subscribe((data: any[]) =>{
      console.log(data);
      this.answerTypeLookUpList = data;
    });
  }

  toggleStatus(event: any, question: any, index: number){
    this.setActiveRow(question, index);
    question.status = event.checked ? 1 : 0;
    if(question.question.trim().length == 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Question cannot be blank.', life: 3000 });
    }
    else if(question.questionBankId > 0){
      this.updateQuestion(question, index, false);      
    }
  }

  saveQuestion(questionModel: any, index: number){
    let isValid = this.validateQuestion(questionModel);
    if (isValid)
    {  
      this.submitted = true;    
      if(questionModel.questionBankId > 0){
        this.updateQuestion(questionModel, index, false);
      }
      else if (questionModel.questionBankId == 0) { 
        this.questionBankService.addQuestion(questionModel).subscribe(response => 
        {          
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Question added successfully.', life: 3000 });        
          this.getQuestions();  
          this.selectedQuestionRowIndex = -1;
          this.addNewQuestionRecord = false;
          setTimeout(() => this.submitted = false, 1000);
        },
        error => {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });     
          this.submitted = false;
        }); 
      }
    }
    else
    {
      this.submitted = false;
    }
  }

  updateQuestion(questionModel: any, index: number, calledFormAddOption: boolean){
    let isValid = this.validateQuestion(questionModel);
    if (isValid)
    {
      this.submitted = true;          
      if (questionModel.questionBankId > 0 && isValid) { 
        this.questionBankService.updateQuestion(questionModel).subscribe(response => 
        {
          if(calledFormAddOption){          
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Option added successfully.', life: 3000 });
          }
          else{         
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Question updated successfully.', life: 3000 });      
          }  
          this.getAnswerOptionsByQuestionId();
          this.selectedOptionRowIndex = -1;
          setTimeout(() => this.submitted = false, 1000);
        },
        error => {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          this.submitted = false;
        });
      }
      else
      {
        this.submitted = false;
      }
    }
    else
    {
      this.submitted = false;
    }
  }

  validateQuestion(questionModel: any) : boolean{
    let isvalid = true;
    if(questionModel.question.trim().length == 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Question cannot be blank.', life: 3000 });
      let elementId = "question_" + questionModel.questionBankId.toString();
      setTimeout(() => this.focusOnControl(elementId), 1000);
      isvalid = false;
    }
    else if(questionModel.answerTypeLookUpId == 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a answer type.', life: 3000 });
      isvalid = false;
    }    
    if(questionModel.answerTypeLookUpId == 3 || questionModel.answerTypeLookUpId == 4){
      if((questionModel.answerOptions.length == 0)){
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You need to have atleast one option.', life: 3000 });
        this.addNewOption(questionModel);
        isvalid = false;
      }
      else{
        questionModel.answerOptions.forEach(option => {
           if(option.option.trim().length == 0){
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Option cannot be blank.', life: 3000 });
              let elementId = "option_" + option.answerOptionId.toString();
              setTimeout(() => this.focusOnControl(elementId), 1000);
              isvalid = false;
            }
        });
      }
    }
    return isvalid;
  }

  addNewOption(question: any){
    this.selectedQuestionRowIndex = question.questionBankId;
    this.selectedOptionRowIndex = -1;
    this.selectedQuestion = question;
    this.addNewOptionRecord = true; 
    let answerOptionId = (this.selectedQuestion.answerOptions.length + 2) * -1;
    let option = {
      answerOptionId: answerOptionId,
      questionBankId : this.selectedQuestionRowIndex,
      option: ""
    };
    this.selectedQuestion.answerOptions.unshift(option);
    console.log(this.selectedQuestion);
    let optionControlId = "option_" + option.answerOptionId.toString();
    setTimeout(() => this.focusOnControl(optionControlId), 1000);
    this.setActiveOptionRow(option, this.selectedQuestion.answerOptions.length - 1);
  }

  setActiveOptionRow(option: any, index: number){
    console.log(index);
    this.selectedOptionRowIndex = option.answerOptionId;
    this.selectedOption = option;
  }

  async resetOptionRow(option: any, index: number){
    // this.getAnswerOptionsByQuestionId();
    // this.addNewQuestionRecord = false;
    // this.addNewOptionRecord = false;
    if (option.answerOptionId < 0){
      option.option = "";
    }
    else if (option.answerOptionId > 0){
      let currentOption = await this.answerOptionService.getAnswerOptionById(option.answerOptionId).toPromise();
      option.option = currentOption.option;
      this.selectedOptionRowIndex = -1;
    }
  }

  deleteOption(option: any, index: number){
    this.setActiveOptionRow(option, index);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this option ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        if(this.selectedQuestion.answerOptions.length == 1){        
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You need to have atleast one option.', life: 3000 });
        }
        else if(option.answerOptionId > 0){        
          this.answerOptionService.deleteAnswerOption(option.answerOptionId).subscribe(response => 
          {  
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Option deleted successfully.", life: 3000 });
            this.getAnswerOptionsByQuestionId();
            this.selectedOptionRowIndex = -1;
          },
          error => {            
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
        }
        else{
          this.selectedQuestion.answerOptions.splice(index, 1);
          this.selectedOptionRowIndex = -1;
        }
      }
    });
  }

  addUpdateOption(option: any, index: number){
    if(option.option.trim().length == 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Option cannot be blank.', life: 3000 });
      let elementId = "option_" + option.answerOptionId.toString();
      setTimeout(() => this.focusOnControl(elementId), 1000);
    }
    else if(option.answerOptionId > 0 ) {
      this.answerOptionService.updateAnswerOption(option).subscribe(response => 
      {          
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Option updated successfully.', life: 3000 }); 
        // this.getAnswerOptionsByQuestionId();
      },
      error => {            
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
    }
    else if(option.answerOptionId < 0 &&  this.selectedQuestion.questionBankId > 0) {
      this.updateQuestion(this.selectedQuestion, index, true);
    }
  }

  getAnswerOptionsByQuestionId(){
    this.answerOptionService.getAnswerOptionsByQuestionBankId(this.selectedQuestion.questionBankId).subscribe(response => 
    {          
      console.log(response);
      this.selectedQuestion.answerOptions = response;
      // this.selectedOptionRowIndex = -1;
    },
    error => {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  getAnswerOptionById(answerOptionId: number) : any{
    this.answerOptionService.getAnswerOptionById(answerOptionId).subscribe(response => 
    {          
      return response;
    },
    error => {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }
  
  applyClass(controlType: string, value: any){
    if(controlType == "text"){
      if(value.trim().length == 0){
        return "invalid";
      }
    }
    else if(controlType == "list"){
      if(value == 0){
        return "invalid";
      }
    }
    return "valid";
  }

  cloneQuestion(question: any, index: number){
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to clone this question ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        let searchParams = new HttpParams();
        searchParams = searchParams.append('questionBankId',  question.questionBankId);
        const opts = { params: searchParams };
        this.questionBankService.cloneQuestion(opts).subscribe((data: any[]) =>
        {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Question cloned successfully.', life: 3000 });
          this.resetActiveRow();
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
    });
  }
  
}
