[
    '{{repeat(10, 7)}}',
    {
      membershipId: '{{objectId()}}',
      name: '{{firstName()}}',
      code: '{{surname()}}',
      description: '{{email()}}',
      period: '{{firstName()}}',
      status: '{{integer(0, 1)}}',
      GlAccount: '{{random("Membership", "Back Office", "Accounting")}}',
      fee: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
      type: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}'
    }
]