# Contributing
Looking for feedbacks, so feel free to file an issue or a pull request!

## Issue
For an issue that is only needed to be addressed instantly (if you feel like it), proceed to the [**Discord server**](http://thegzm.space).

Please make sure your issue isn't reported at all before filing, instead submit a comment in the existing issue thread.
> File an issue [**here**](https://github.com/gazmull/eros-bot/issues)!

If an issue has a vague message, please do add:
  - Recreation steps
  - Screenshots

### Documentation (Issue)
If you cannot afford to do a pull request, you may as well submit documentation contributions via filing an issue, but please make sure it does follow the standards of the documentation.

## Pull Request

### Documentation (Pull Request)
> Since this still involves building the source code, please read [**Code**](#Code) first.

1. Proceed to [`src / commands / general / guide-pages`](/src/commands/general/guide-pages).
    > If you are writing to a general guide (not a command guide), feel free to edit `index.ts` once you're inside the folder mentioned above.

    > If you are writing to a command guide, proceed to [`commands`](/src/commands/general/guide-pages/commands).
    1. Select a category (e.g. `general` or `kamihime`).
    2. Go to `assets` and you should see `.ts` file for each command.
        - Feel free to either edit the file or create a new one— if it's a valid command within the bot.
        - Make sure you're following the syntax (open one file and you'll get the idea).
2. After doing everything above, run `$ yarn run docs:parse` to generate the updated regeneration.
3. Make sure to do `$ git push` to the gh-pages branch!
4. File a [**Pull Request**](https://github.com/gazmull/eros-bot/compare/gh-pages).

### Code
> When adding/updating a command, `guide-pages` must be updated. See [**Documentation**](#Documentation-(Pull-Request))

1. Fork this repository, clone to your machine, and then follow the project's development configuration [e.g. TSLint]
    > `$ yarn --production=false` to install.
2. Run `$ yarn test` to verify if your build is passing.
    > Failing build will be rejected at default.
3. Make sure to do `$ git push` to the master branch!
4. File a [**Pull Request**](https://github.com/gazmull/eros-bot/compare).

## Miscellaneous

### Developing with VSCode
> This is used to automatically hot-reload when there are source code changes.
  1. Run task `tsc: watch`. Default shortcut keys: `ctrl + shift + b + b`
  2. Run `$ yarn run dev:start`
