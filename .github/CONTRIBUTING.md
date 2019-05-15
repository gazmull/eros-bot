# Contributing
Looking for feedbacks, so feel free to file an issue or a pull request!

## Issue
For an issue that is only needed to be addressed instantly (if the issuer feels like it), proceed to the [**Discord server**](http://thegzm.space).

Please make sure the issue isn't reported at all before filing, instead submit a comment in the existing issue thread.
> File an issue [**here**](https://github.com/gazmull/eros-bot/issues)!

If an issue has a vague message, please do add:
- Recreation steps
- Screenshots

### Documentation (Issue)
If one cannot afford to do a pull request, submitting documentation contributions via filing an issue is also fine, but please make sure it does follow the standards of the documentation.

## Pull Request

### Documentation (Pull Request)
> Since this still involves building the source code, please read [**Code**](#Code) first.

1. Proceed to [`src / commands / general / guide-pages`](/src/commands/general/guide-pages).
    > When writing to a general guide (not a command guide), feel free to edit `index.ts` once inside the folder mentioned above.

    > When writing to a command guide, proceed to [`commands`](/src/commands/general/guide-pages/commands).

    1. Select a category (e.g. `general` or `kamihime`).
    2. Go to `assets` and there should be `.ts` file for each command.
        - Feel free to either edit the file or create a new one— if it's a valid command within the bot.
        - Make sure the syntax has been followed (open one file will grant an idea).
2. After doing everything above, run `$ yarn run docs:parse` to generate the updated documentation.
3. Make sure to do `$ git push` to the gh-pages branch!
4. File a [**Pull Request**](https://github.com/gazmull/eros-bot/compare/gh-pages).

### Code
> When adding/updating a command, `guide-pages` must be updated. See [**Documentation**](#Documentation-Pull-Request)

1. Fork this repository, clone to local machine, and then follow the project's development configuration [e.g. TSLint]
    > `$ yarn --production=false` to install.

2. Code x10
    - Make your life easier with `$ yarn dev:watch` and `$ yarn dev:start` for watching changed files and reloading the bot instance respectively.

3. Run `$ yarn test` to verify if the build is passing.
    > Failing build will be rejected at default.

4. Make sure to do `$ git push` to the master branch!
5. File a [**Pull Request**](https://github.com/gazmull/eros-bot/compare).
