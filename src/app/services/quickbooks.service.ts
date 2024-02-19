
import { Injectable } from '@angular/core';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class QuickbooksService {

  constructor() { }

  exportGeneralLedgerQuickBook(glReportData: any){
    const currentDate = new Date();
    console.log(glReportData);
    let data = "!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tDOCNUM\tMEMO\n";
    data = data.concat("!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tDOCNUM\tMEMO\n");
    data = data.concat("!ENDTRNS\n");
    let i = 0;

    glReportData.forEach(glTransaction => {

      let newLinestring = "";
      if(i === 0){
        newLinestring = "TRNS\t" + glTransaction.receiptId + "\tGENERAL JOURNAL" + "\t" + glTransaction.transactionDate + "\t" + glTransaction.glAccount + "\t" + glTransaction.amount + "\t \t \n";      
      }
      else{
        newLinestring = "SPL\t" + glTransaction.receiptId + "\tGENERAL JOURNAL" + "\t" + glTransaction.transactionDate + "\t" + glTransaction.glAccount + "\t" + glTransaction.amount + "\t \t \n";      
      }
      data = data.concat(newLinestring);
      i++; 
    });

    data = data.concat("ENDTRNS\n");

    let blob = new Blob([data], { type: 'text/iif' });
    const fileName = "Quickbooks_" + (currentDate.getMonth() + 1).toString() + "" + currentDate.getDate().toString() + "" + currentDate.getFullYear().toString() + "" + currentDate.getHours().toString() + "" + currentDate.getMinutes().toString() +  "" + currentDate.getSeconds().toString();
    fs.saveAs(blob, fileName + '.iif');

  }
}
