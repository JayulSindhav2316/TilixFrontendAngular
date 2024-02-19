import * as moment from "moment"

export interface Events {
  allowMultipleRegistration?: boolean,
  allowNonMember?: boolean,
  allowWaitlist?: boolean,
  area?: string,
  city?: string,
  code?: string,
  contactPersonEntityId?: number,
  description?: string,
  eventId?: number,
  eventImageId?: number,
  eventQuestions?: any [],
  eventTypeId?: number,
  fromDate?: string,
  linkedFeeTypes?: any [],
  linkedGroups?: any[],
  location?: string,
  maxCapacity?: number,
  name?: string,
  organizationId?: number,
  sessions?: [],
  showEventCode?: boolean,
  state?: string,
  status?: number,
  summary?: string,
  timeZoneId?: number,
  toDate?: string,
  webinarLiveLink?: string,
  webinarRecordedLink?: string,
  zip?: string,
  eventImage?: File,
  selectedContactPerson? : any
}

export interface EventDetails {
  area?: string,
  city?: string,
  code?: string,
  contactPersonEntityId?: number,
  description?: string,
  eventId?: number,
  eventImageId?: number,
  eventTypeId?: number,
  fromDate?: Date,
  location?: string,
  maxCapacity?: number,
  name?: string,
  organizationId?: number,
  showEventCode?: boolean,
  state?: string,
  status?: number,
  summary?: string,
  timeZoneId?: number,
  toDate?: Date,
  webinarLiveLink?: string,
  webinarRecordedLink?: string,
  zip?: string,
  eventImage?: File,
  selectedContactPerson? : any
}

export interface EventQuestions {
  eventQuestions?: any []
}

export interface EventSettings {
  allowMultipleRegistration?: boolean,
  allowNonMember?: boolean,
  allowWaitlist?: boolean,
  linkedFeeTypes?: any [],
  linkedGroups?: any[],
}