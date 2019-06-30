import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { IKamihimeDB } from '../../../typings';
import ErosComamnd from '../../struct/command';
import shuffle from '../../util/shuffle';

type PromptType = 'name' | 'element' | 'rarity' | 'tier' | 'type';
type ChoicesSupplier = (isWeapon?: boolean) => string[];
interface IQuestionnaireSupplier {
  text: string;
  type: PromptType;
  choices: ChoicesSupplier;
}

const QUESTIONS: IQuestionnaireSupplier[] = [
  { text: 'What is the name of this {{type}}?', type: 'name', choices: null },
  {
    text: 'What is this {{type}}\'s element?',
    type: 'element',
    choices: () => [ 'Fire', 'Water', 'Wind', 'Thunder', 'Light', 'Dark', 'Phantom', 'Weapon Dependent' ]
  },
  { text: 'What is this {{type}}\'s rarity?', type: 'rarity', choices: () => [ 'SSR+', 'SSR', 'SR', 'R' ] },
  { text: 'What is this {{type}}\'s tier?', type: 'tier', choices: () => [ 'Legendary', 'Elite', 'Standard' ] },
  {
    text: 'What is this {{type}}\'s type?',
    type: 'type',
    choices (isWeapon) {
      return isWeapon
        ? [ 'Hammer', 'Lance', 'Glaive', 'Arcane', 'Staff', 'Axe', 'Gun', 'Bow', 'Sword' ]
        : [ 'Offense', 'Defense', 'Balance', 'Tricky', 'Healer' ];
    }
  },
];

export default class extends ErosComamnd {
  constructor () {
    super('quiz', {
      aliases: [ 'quiz', 'trivia' ],
      description: {
        content: 'Deploys a questionnaire(s) related to Kamhime Project.',
        usage: '[number of questions] [interval in seconds]',
        examples: [ '', '2', '2 30' ]
      },
      lock: 'channel',
      channel: 'guild',
      noTrash: true,
      ratelimit: 1
    });
  }

  public * args () {
    const rotation = yield {
      type: 'integer',
      default: 1
    };

    const interval = rotation >= 2
      ? yield {
        type: 'interval',
        prompt: {
          retry: 'interval can only be **up to 120 seconds**. Try again!'
        }
      }
      : null;

    return { rotation, interval };
  }

  public async exec (message: Message, { rotation, interval }: { rotation: number, interval: number }) {
    if (!message.member.hasPermission('MANAGE_GUILD') && rotation > 5)
      rotation = 5;
    else if (message.member.hasPermission('MANAGE_GUILD') && rotation > 10)
      rotation = 10;

    for (let i = 0; i < rotation; i++) {
      const isNotLast = i !== rotation - 1 ? interval / 1000 : null;

      await this.createQuestionnare(message, { isNotLast, rotation, current: i + 1 });
      if (interval && isNotLast) await this.client.util.sleep(interval);
    }

    return true;
  }

  // isNotLast - If a true number is passed, it'll append a notification to members that there will be another question
  // with the value of isNotLast (interval)
  protected async createQuestionnare (
    message: Message,
    config: { isNotLast: number, rotation: number, current: number }
  ) {
    const { emojis, url } = this.client.config;
    const { isNotLast, rotation, current } = config;
    message.util.setLastResponse(await message.channel.send(`${emojis.loading} Awaiting KamihimeDB's response...`));

    const response = await fetch(url.api + 'random/4/true', { headers: { Accept: 'application/json' } });

    if (!response.ok) return message.util.edit('There was a problem: ' + response.statusText);

    const characters: IKamihimeDB[] = await response.json();
    const seed = Math.floor(Math.random() * characters.length);
    const selected = characters[seed];
    const avatar = url.root + encodeURIComponent(`img/wiki/${selected.avatar}`);
    const name = `shady_pic_${Date.now()}.webp`;
    const filteredQuestions = QUESTIONS.filter(q => selected[q.type] !== null);
    const question = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    const isWeapon = selected.id.charAt(0) === 'w';
    const parsed = {
      text: question.text
        .replace(/\{\{type\}\}/, isWeapon ? 'weapon' : 'character'),
      choices: typeof question.choices === 'function' ? question.choices(isWeapon) : question.choices
    };

    const answer = selected[question.type];
    let exp = Math.abs(Math.floor(Math.random() * 1000));

    if (message.member.hasPermission('MANAGE_GUILD')) exp += 500;
    if (question.type === 'name') parsed.choices = characters.map(c => c.name);

    shuffle(parsed.choices);

    const embed = this.client.embed()
      .setImage(`attachment://${name}`)
      .setAuthor(
        `Questionnaire (${current} of ${rotation}) triggered by ${message.author.tag}`,
        message.author.displayAvatarURL({ format: 'webp' })
      )
      .setTitle(parsed.text)
      .setDescription(parsed.choices.map((v, i) => `**${i + 1}** - \`${v}\`\n`))
      .setFooter(`For ${exp} EXP • Ends within 30 seconds`);
    const attachment = this.client.util.attachment(avatar, name);
    const nextQuestionMsg = isNotLast
      ? `\n***Another question will be sent here within ${isNotLast} second${isNotLast <= 1 ? '' : 's'}. Stay tuned!***`
      : '';

    await message.util.lastResponse.delete();
    await message.util.send(null, {  embed, files: [ attachment ] });

    try {
      const questionResponses = await message.channel.awaitMessages((m: Message) => {
        const content = parseInt(m.content);

        if (isNaN(content)) return false;

        const isAnswer = parsed.choices[content - 1] === answer;

        return isAnswer;
      }, { max: 1, time: 30 * 1000, errors: [ 'time' ] });

      const userResponse = questionResponses.first();
      const [ member ] = await this.client.db.Level.findOrCreate({
        where: {
          user: userResponse.author.id,
          guild: message.guild.id
        }
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
