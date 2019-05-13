# Command: tag delete


**Usage**: `@Eros tag delete <tag name> [--purge]`

**Aliases**: None

**Brief Description**: Deletes a tag.

Append `--purge` to delete all tags based on the REGEX provided (<tag name> as REGEX).

The provided REGEX must be on [PCRE](https://mariadb.com/kb/en/library/pcre) flavour.



## Required Bot Permissions

```
Send Messages
Manage Messages
Add Reactions
Embed Links
```

## For Server Manager Only


Normal users cannot use this command against non-self-created tags.

## Examples

```
@Eros tag delete myText
@Eros tag delete ^my(?!Text) --purge
```


---

##### Contributors


Euni
