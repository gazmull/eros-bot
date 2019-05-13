/* tslint:disable:max-line-length */

export default {
  contributors: [ 'Euni' ],
  command: 'tag',
  fields: [
    {
      name: 'Warning',
      value: 'You can affect tags created in the server only.'
    },
    {
      name: 'How It Works',
      value: [
        'Tags are basically archived text files or messages.',
        'Once you add a tag, you may recall the tag\'s content anytime with either `?myTagName` or `?tag show myTagName`',
        'When trying to recall a tag with a name that is the same with an existing command, doing `?tag show myTagName` is necessary.',
      ]
    },
  ]
} as IDialog;
