import { Control } from 'discord-akairo';
import fetch from 'node-fetch';
import ErosComamnd from '../../struct/command';
import shuffle from '../../util/shuffle';

type PromptType = 'name' | 'element' | 'rarity' | 'tier' | 'loli' | 'type';

const QUESTIONS: Array<{ text: string, type: PromptType, choices: string[] }> = [
  { text: 'Who is this character?', type: 'name', choices: null },
  {
    text: 'What is this character\'s element?',
    type: 'element',
    choices: [ 'Fire', 'Water', 'Wind', 'Thunder', 'Light', 'Dark', 'Phantom', 'Weapon Dependent' ]
  },
  { text: 'What is this character\'s rarity?', type: 'rarity', choices: [ 'SSR+', 'SSR', 'SR', 'R' ] },
  { text: 'What is this character\'s tier?', type: 'tier', choices: [ 'Legendary', 'Elite', 'Standard' ] },
  {
    text: 'What is this character\'s type?',
    type: 'type',
    choices: [ 'Offense', 'Defense', 'Balance', 'Tricky', 'Healer' ]
  },
];

export default class extends ErosComamnd {
  constructor () {
    super('quiz', {
      aliases: [ 'quiz', 'trivia' ],
      description: {
        content: 'Deploys a questionnaire(s) related to Kamhime Project.',
        usage: '[number of questions] [interval in minutes]',
        examples: [ '', '2', '2 1' ]
      },
      lock: 'channel',
      channel: 'guild',
      noTrash: true,
      ratelimit: 1,
      args: [
        {
          id: 'rotation',
          type: 'integer',
          default: 1
        },
        Control.if((_, { rotation }) => rotation >= 2, [
          {
            id: 'interval',
            type: 'interval',
            prompt: {
              retry: 'interval can only be **up to 30 minutes**. Try again!'
            }
          },
        ], []),
      ]
    });
  }

  public async exec (message: Message, { rotation, interval }: { rotation: number, interval: number }) {
    if (!message.member.hasPermission('MANAGE_GUILD') && rotation > 3)
      rotation = 3;
    else if (message.member.hasPermission('MANAGE_GUILD') && rotation > 5)
      rotation = 5;

    for (let i = 0; i < rotation; i++) {
      const isLast = i === rotation - 1 ? null : interval / 1000 / 60;

      try {
        await this.createQuestionnare(message, { isLast, rotation, current: i + 1 });
        if (interval) await this.sleep(interval);
      }
      catch (err) {
        this.emitError(err, message, this);

        break;
      }
    }

    return true;
  }

  protected sleep (interval: number) {
    return new Promise(resolve => {
      this.client.setTimeout(resolve, interval);
    });
  }

  // isLast - If a true number is passed, it'll append a notification to members that there will be another question
  // with the value of isLast (interval)
  protected async createQuestionnare (message: Message, config: { isLast: number, rotation: number, current: number }) {
    const { emojis, url } = this.client.config;
    const { isLast, rotation, current } = config;
    message.util.setLastResponse(await message.channel.send(`${emojis.loading} Awaiting KamihimeDB's response...`));

    const response = await fetch(url.api + 'random/4', { headers: { Accept: 'application/json' } });

    if (!response.ok) return message.util.edit('There was a problem: ' + response.statusText);

    const characters: IKamihimeDB[] = await response.json();
    const seed = Math.floor(Math.random() * characters.length);
    const selected = characters[seed];
    const avatar = url.root + encodeURIComponent(`img/wiki/${selected.avatar}`);
    const name = `shady_pic_${Date.now()}.webp`;
    const filteredQuestions = QUESTIONS.filter(q => selected[q.type] !== null);
    const question = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    const answer = selected[question.type];
    let exp = Math.abs(Math.floor(Math.random() * 1000));

    if (message.member.hasPermission('MANAGE_GUILD')) exp += 500;
    if (question.type === 'name') question.choices = characters.map(c => c.name);

    shuffle(question.choices);

    const embed = this.util.embed()
      .setImage(`attachment://${name}`)
      .setAuthor(
        `Questionnaire (${current} of ${rotation}) triggered by ${message.author.tag}`,
        message.author.displayAvatarURL({ format: 'webp' })
      )
      .setTitle(question.text)
      .setDescription(question.choices.map((v, i) => `**${i + 1}** - \`${v}\`\n`))
      .setFooter(`For ${exp} EXP • Ends within 30 seconds`);
    const attachment = this.client.util.attachment(avatar, name);
    const nextQuestionMsg = isLast
    ? `\n***Another question will be sent here within ${isLast} minute${isLast <= 1 ? '' : 's'}. Stay tuned!***`
    : '';

    await message.util.lastResponse.delete();
    await message.util.send(null, {  embed, files: [ attachment ] });

    try {
      const questionResponses = await message.channel.awaitMessages((m: Message) => {
        const content = parseInt(m.content);

        if (isNaN(content)) return false;

        const isAnswer = question.choices[content - 1] === answer;

        return isAnswer;
      }, { max: 1, time: 30 * 1000, errors: [ 'time' ] });

      const userResponse = questionResponses.first();
      const [ member ] = await this.client.db.Level.findOrCreate({
        where: {
          user: userResponse.author.id,
          guild: message.guild.id
        },
        attributes: [ 'id' ]
      });

      await member.increment('exp', { by: exp });

      return message.util.send([
        `For **${exp} EXP**, **${userResponse.author.tag}** got the correct answer: **${answer}**`,
        nextQuestionMsg,
      ]);
    } catch (err) {
      if (err instanceof Error) throw err;

      return message.util.send([
          `Question expired. For **${exp} EXP**, the answer was **${answer}**`,
          nextQuestionMsg,
        ],
        { embed: null }
      );
    }
  }
}
