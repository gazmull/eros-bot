# Command: tag


**Usage**: `@Eros tag <method> [arguments]`

**Aliases**: `tag`

**Brief Description**: Parent command of tag system.

Available Methods:

	- `add`

	- `del`

	- `delete`

	- `edit`

	- `find`

	- `info`

	- `leaderboard`

	- `list`

	- `search`

	- `show`

	- `source`



## Required Bot Permissions

```
Send Messages
Manage Messages
Add Reactions
Embed Links
```

## Warning


You can affect tags created in the server only.

## How It Works


Tags are basically archived text files or messages.

Once you add a tag, you may recall the tag's content anytime with either `?myTagName` or `?tag show myTagName`

When trying to recall a tag with a name that is the same with an existing command, doing `?tag show myTagName` is necessary.

## Examples

```
@Eros tag add myText Content --hoist
@Eros tag add myText Content
@Eros tag delete myText
@Eros tag edit myText --hoist
@Eros tag edit "With Spaces" Content
@Eros tag find with spaces
@Eros tag info myText
@Eros tag leaderboard 5
@Eros tag list nutaku employee impersonator
@Eros tag search stale kh memes
@Eros tag show myText
@Eros tag source burst attack
```


---

##### Contributors


Euni
