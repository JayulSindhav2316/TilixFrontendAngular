export interface EventSession {
    billableEntityId: number;
    entityId: number;
    currentTab?: number;
    eventId? : number;
    eventName : string;
    eventTypeId : number;
    selectedSession : selectedSessions[];
    selectedQuestion : selectedQuestions[];
    invoiceId : number;
    currentUserId:number;
 }

 export class selectedSessions
 {
    sessionId : number;
    price : number;
    session : any;
    checked : boolean;
 }

 export class selectedQuestions
 {
   questionNumber:number;
   sessionId : number;
   eventId : number;
   questionId : number;
   question:string;
   answerType:string;
   answerTypeLookUpId:number;
   answerValue : any;
   isEventLevelQuestion : boolean;
   answerOption : answerOptionList[];
   selectedAnwserOptions : any [];
 }

 export class answerOptionList
 {
   answerOptionId :number;
   questionBankId : number;
   option : string;
 }