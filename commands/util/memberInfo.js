const { Command } = require('discord-akairo');

class MemberInfoCommand extends Command {
	constructor() {
		super('memberinfo', {
			aliases: ['memberinfo', 'minfo', 'mi', 'userinfo', 'uinfo', 'ui'],
			description: {
				content: 'Displays a guild member information. No arguments will display yours instead.',
				usage: '<optional member resolvable>',
				examples: ['A Binary Large OBject', 'Euni', 'Euni#0011', '319102712383799296']
			},
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			args: [
				{
					id: 'member',
					type: 'member',
					default: message => message.member
				}
			]
		});
	}

	exec(message, { member }) {
		return this.displayInfo(message, member);
	}

	async displayInfo(message, member) {
		try {
			const fetchedMember = member || await message.guild.members.fetch(member.id);
			if (!fetchedMember) throw new Error('Member cache missing');

			const embed = this.client.util.embed()
				.setColor(0xFF00AE)
				.setTitle(`${fetchedMember.user.tag} | ${this.memberStatus(member)}`)
				.setDescription(`**ID**: ${fetchedMember.id}${
					member.nickname ? `, also known as **\`${member.nickname}\`**` : ''}`
				)
				.setThumbnail(member.user.displayAvatarURL())
				.setFooter(`Executed by ${message.author.tag}`)
				.setTimestamp(new Date())
				.addField('Roles',
					member.roles.map(r => member.roles.array().indexOf(r) % 3 === 0 ? `\n${r}` : `${r}`).join(', ')
				)
				.addField('Creation Date', member.user.createdAt.toUTCString(), true)
				.addField('Join Date (This guild)', member.joinedAt.toUTCString(), true);

			if (member.user.presence.activity) {
				const activity = member.user.presence.activity;
				embed.addField('Activity',
					`${
						activity.type === 'PLAYING'
							? `Playing **${activity.name}**`
							: activity.type === 'STREAMING'
								? `Streaming **${activity.name}**`
								: activity.type === 'WATCHING'
									? `Watching **${activity.name}**`
									: `Listening to **${activity.name}**`
					}`
				);
			}

			return message.util.send({ embed });
		} catch (err) {
			return message.reply('I cannot retrieve that member\'s information.');
		}
	}

	memberStatus(member) {
		const status = member.user.presence.status;

		return status === 'online'
			? 'Online'
			: status === 'idle'
				? 'Idle'
				: status === 'dnd'
					? 'Do Not Disturb'
					: 'Offline';
	}
}

module.exports = MemberInfoCommand;