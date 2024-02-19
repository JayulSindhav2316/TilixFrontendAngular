import * as internal from "stream";

export interface Report {
    id?:string;
    name?:string;
    description?:string;
    categoryId?:number;
    templateId?:number;
    userId?:number;
    bookmark?:boolean;
    createdDate?:string;
    modifiedDate?:string;
    category?:Category;
    template?:Template;
}

export interface Category{
    id?:number;
    name?:string;
    description?:string;
}

export interface Template{
    id?:number;
    name?:string;    
}