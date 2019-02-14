/* tslint:disable:max-line-length */

export default {
  contributors: [ 'Euni' ],
  command: 'countdown-add',
  fields: [
    {
      name: 'For Server Manager Only',
      value: 'Normal users cannot use this command.'
    },
    {
      name: 'Adding a Countdown',
      value: [
        'Existing countdown with the same name from your input must be removed first.',
        '❯ Date Format: [YYYY]-[MM]-[DD]T[HH]:[mm]',
        '❯ Note: Date has to be provided in PDT. https://time.is/PDT',
        '❯ Note: Naming can also affect the countdown notifications, so be careful when to append `- End`!',
      ]
    },
  ]
} as IDialog;
