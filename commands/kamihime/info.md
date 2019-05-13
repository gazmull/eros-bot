# Command: info


**Usage**: `@Eros info <item name> [flags]`

**Aliases**: `info`, `i`, `khinfo`, `khi`, `kh`

**Brief Description**: Looks up for a Kamihime PROJECT Character/Weapon at Kamihime PROJECT EN Fandom.



Min. requirement for input length is 2.

If there are multiple results, you will be prompted to select what exactly you would like to see.

## Required Bot Permissions

```
Send Messages
Manage Messages
Add Reactions
Embed Links
```

## Flags: Options For Narrowing Down Your Search


`-a`, `--accurate` tells the bot that the name is accurate to immediately acquire the character you desire

​

__Each flag is not compatible with *any other flag within this flag type*.__

`-ts`, `--type=soul` souls pool only

`-te`, `--type=eidolon` eidolons pool only

`-tk`, `--type=kamihime` kamihime pool only

`-tw`, `--type=weapon` weapons pool only

## Flags: Options For Requesting Other Info


__Each flag is compatible with *any other flag*.__

`-r`, `--release`, `--releases`, `--releaseweapon` **only for kamihime/weapon**— requests Kamihime's weapon / Kamihime Release instead

`-p`, `--preview` requests to show the item's image

​

__Each flag is only compatible with Souls__

`-m`, `--mex` requests character's Master Extra Abilities (MEX)

​

__Each flag is only compatible with Weapons and Kamihime with FLB-able Weapon__

`-f`, `--flb` requests weapon's Final Limit Break (FLB) values. Will work with or without `--release` flag.

## Emoji Reacts To Interact


🖼 — Toggle image

🔄 — **only for kamihime/weapon/soul**— See Kamihime / Weapon / Soul's MEX

`SSR+ Emoji` — **only for weapons**— Toggle FLB values

## Examples

```
@Eros info eros
@Eros info mars -r
@Eros info masamune -ts
@Eros info ea -tw
@Eros info hell staff -tw -r
@Eros info ea -tk -r
@Eros info arthur -ts -m
@Eros info holy sword ascalon -f
```


---

##### Contributors


Euni
