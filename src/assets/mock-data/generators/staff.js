[
    '{{repeat(10, 7)}}',
    {
      staffId: '{{objectId()}}',
      firstName: '{{firstName()}}',
      lastName: '{{surname()}}',
      email: '{{email()}}',
      userName: '{{firstName()}}',
      password: 'PASSWORD',
      status: '{{integer(0, 1)}}',
      department: '{{random("Membership", "Back Office", "Accounting")}}',
      lastAccessed: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
      createDate: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
      roles: [
        '{{repeat(3)}}',
        {
          roleId: '{{index()}}',
          name: '{{random("Administrator", "Contact  Manager", "Accounting","Front Desk")}}'
        }
      ]
    }
  ]