# We really love to have you and your awesome (intention) contributions here. 🎉🎉🎉 Thanks 🎉🎉🎉

## To run the application in development

### Step 1 👍 : install [yeoman](https://yeoman.io/)

`npm install -g yo | yarn global add yo`

### Step 2 👍 : to setup JHipster locally

`git clone https://github.com/jhipster/generator-jhipster`

`cd generator-jhipster`

`npm install | yarn`

`npm link | yarn link`

( 🏁 Kudos, you just setup JHipster and linked to it locally )

### Step 3 ✌️ : to setup JHipster-nodejs generator

`git clone https://github.com/jhipster/generator-jhipster-nodejs`

`cd generator-jhipster-nodejs`

`npm link generator-jhipster | yarn link generator-jhipster`

`npm install | yarn`

`npm link | yarn link`

( 🏁 Kudos, you just setup JHipster-nodejs and linked to it locally )
( 📝 Note: you are linking the JHipster to JHipster-nodejs with the final command)

### Step 4 🤟 : before generating your application, go to your application folder

`yarn link "generator-jhipster" && yarn link "generator-jhipster-nodejs"`

or

`npm link "generator-jhipster" && npm link "generator-jhipster-nodejs"`

( 🏁 Kudos, you have done it. It is the time to generate the application `jhipster --blueprints nodejs` )

✨✨✨✨ You are rocking ✨✨✨✨

Fix / Code / Document and create a pull request 💯
