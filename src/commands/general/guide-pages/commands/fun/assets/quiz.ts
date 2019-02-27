/* tslint:disable:max-line-length */

export default {
  contributors: [ 'Euni' ],
  command: 'quiz',
  description: [
    'The deployed questionnaire can be answered by everyone in the channel.',
    'Maximum questions in one trigger: **5** for **normal user** | **10** for **user with `Manage Server` permission**',
    'Maximum interval: 120 seconds',
  ],
  fields: [
    {
      name: 'This command is featured by Leveling System',
      value: 'Gain EXP rewards by using this command!'
    },
    {
      name: 'Warning',
      value: 'This command will be locked to the server channel until someone gets the correct answer or when the current queue of questions is done.'
    },
  ]
} as IDialog;
