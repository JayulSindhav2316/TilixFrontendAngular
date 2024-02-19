export class EnumArray {
  preferredContact: { id: number; value: string; }[]=[];
  constructor() {}

  getPreferredContactValue(value: number)
  {
    if(value) {
      this.preferredContact.push({id:1, value: 'Primary Email'});
      this.preferredContact.push({id:2, value: 'Primary Phone'});
      this.preferredContact.push({id:3, value: 'Primary Address'});

      var selectedValue = this.preferredContact.filter(x => x.id === value);
      console.log(selectedValue);
      return selectedValue[0].value;
    }
    else {
      return 'Not Set';
    }    
  }

}