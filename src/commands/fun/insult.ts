import { GuildMember, Message, User } from 'discord.js';
import * as fs from 'fs-nextra';
import ErosComamnd from '../../struct/command';

export default class extends ErosComamnd {
  constructor () {
    super('insult', {
      aliases: [ 'insult', 'kbaka' ],
      description: {
        content: 'Lets you insult someone in my stead.',
        usage: '<member>',
        examples: [ 'euni', 'slick', '@Paulo' ]
      },
      channel: 'guild',
      lock: 'channel',
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: 'who would you like me to insult?',
            retry: 'eh, not a valid member... Try again!'
          }
        },
        {
          id: 'stalk',
          match: 'flag',
          flag: [ '-s', '--stalk' ]
        },
        {
          id: 'unstalk',
          match: 'flag',
          flag: [ '-u', '--unstalk' ]
        },
      ]
    });
  }

  protected filename = `${__dirname}/../../../provider/stalks.json`;

  public stalks: string[] = [];

  /* eslint-disable max-len */

  public insults = [
    'May the chocolate chips in your cookies always turn out to be raisins.',
    'May every sock you wear be slightly rotated, just enough for it to be uncomfortable.',
    'May your mother come to talk to you, and then leave your door slightly ajar, so that you have to get up and close it.',
    'May your article load that extra little bit as you\'re about to click a link so you click an ad instead.',
    'May both sides of your pillow be warm.',
    'May you forever feel your cellphone vibrating in the pocket it\'s not even in.',
    'May you always get up from your computer with your headphones still attached.',
    'May your chair produce a sound similar to a fart, but only once, such that you cannot reproduce it to prove that it was just the chair.',
    'I don’t believe in plastic surgery, But in your case, Go ahead.',
    'People like you are the reason we have middle fingers.',
    'Why Don’t You Slip Into Something More Comfortable. Like A Coma?',
    'When your mom dropped you off at the school, she got a ticket for littering.',
    'Tell me… Is being stupid a profession or are you just gifted?',
    'Me pretending to listen should be enough for you.',
    'What’s the point of putting on makeup, a monkey is gonna stay a monkey.',
    'My mom says pigs don’t eat biscuits… So I better take that one out of your hand.',
    'No need for insults, your face says it all.',
    'Wow! You have a huge pimple in between your shoulders! Oh wait that’s your face.',
    'It’s not that you are weird…it’s just that everyone else is normal.',
    'Zombies eat brains. You’re safe.',
    'Scientists are trying to figure out how long human can live without a brain. You can tell them your age.',
    'Roses are red, violets are blue, I have 5 fingers, the 3rd ones for you.',
    'Your birth certificate is an apology letter from the condom factory.',
    'I’m jealous of all the people that haven\'t met you!',
    'I wasn\'t born with enough middle fingers to let you know how I feel about you.',
    'You must have been born on a highway because that\'s where most accidents happen.',
    'If you are going to be two faced, at least make one of them pretty.',
    'Yo\'re so ugly, when your mom dropped you off at school she got a fine for littering.',
    'I bet your brain feels as good as new, seeing that you never use it.',
    'You bring everyone a lot of joy, when you leave the room.',
    'Two wrongs don\'t make a right, take your parents as an example.',
    'I\'d like to see things from your point of view but I can\'t seem to get my head that far up my ass.',
    'If I wanted to kill myself I\'d climb your ego and jump to your IQ.',
    'If laughter is the best medicine, your face must be curing the world.',
    'You\'re so ugly, when you popped out the doctor said Aww what a treasure and your mom said Yeah, lets bury it.',
    'I don\'t exactly hate you, but if you were on fire and I had water, I\'d drink it.',
    'It\'s better to let someone think you are an Idiot than to open your mouth and prove it.',
    'Shut up, you\'ll never be the man your mother is.',
    'You shouldn\'t play hide and seek, no one would look for you.',
    'The last time I saw a face like yours I fed it a banana.',
    'Maybe if you ate some of that makeup you could be pretty on the inside.',
    'Hey, you have somthing on your chin... no, the 3rd one down',
    'If I were to slap you, it would be considered animal abuse!',
    'Why don\'t you slip into something more comfortable -- like a coma.',
    'I have neither the time nor the crayons to explain this to you.',
    'You look like something I\'d draw with my left hand.',
    'If you really want to know about mistakes, you should ask your parents.',
    'What are you doing here? Did someone leave your cage open?',
    'You\'re not funny, but your life, now that\'s a joke.',
    'Oh my God, look at you. Was anyone else hurt in the accident?',
    'You\'re as bright as a black hole, and twice as dense.',
    'You\'re so ugly, when you got robbed, the robbers made you wear their masks.',
    'You are proof that evolution CAN go in reverse.',
    'Do you still love nature, despite what it did to you?',
    'You\'re so ugly, the only dates you get are on a calendar.',
    'Shock me, say something intelligent.',
    'Learn from your parents\' mistakes - use birth control!',
  ];

  /* eslint-enable max-len */

  public async exec (
    message: Message,
    { member, stalk, unstalk }: { member: GuildMember, stalk: boolean, unstalk: boolean }
  ) {
    if (member.user.bot) return message.util.reply('come on, don\'t be anti-social with just insulting us bots!');
    if (message.member.id === member.id) {
      const desperate = 'I get that it is indeed healthy to talk to yourself sometimes... but are you that desperate?';

      return message.author.send(desperate)
        .catch(() => message.util.reply(desperate));
    }

    if (this.authorized(message.author) && stalk) {
      if (this.stalks.includes(member.id))
        return message.util.reply(`I'm already stalking **${member.displayName}**. Don't apply more pressure to me!`);

      this.stalks.push(member.id);
      await this.save();

      return message.util.reply(`alright, stalking **${member.displayName}**. Hopefully I don't get caught...`);
    } else if (this.authorized(message.author) && unstalk) {
      if (!this.stalks.includes(member.id))
        return message.util.reply(
          `stop nagging me. I don't have **${member.displayName}** in my stalking list!`
        );

      this.stalks.splice(this.stalks.indexOf(member.id), 1);
      await this.save();

      return message.util.reply(`eh, that's kind of you... **${member.displayName}** has been removed from my list.`);
    }

    return message.util.send(`${member}: ${this.randomMessage}`);
  }

  protected authorized (user: User) {
    return this.client.config.countdownAuthorized.includes(user.id);
  }

  protected exists (filename: string) {
    return fs.pathExists(filename);
  }

  protected async init () {
    const exists = await this.exists(this.filename);

    if (exists) {
      const ids: string[] = await fs.readJSON(this.filename);

      if (!ids.length) return;

      this.stalks = ids;
    } else this.save();
  }

  protected async save () {
    return fs.outputFile(this.filename, JSON.stringify(this.stalks));
  }

  get randomMessage () {
    return this.insults[Math.floor(Math.random() * this.insults.length)];
  }
}
