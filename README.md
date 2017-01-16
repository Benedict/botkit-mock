# README #

Botkit-Mock - Write tests for Botkit.

### Setup ###

1. Clone repo
2. Run `npm install`
3. Run `npm run test_mocha` or `npm run test_jasmine`
4. Copy `mocks` into your project root

### Flags ###
`first` - indicates which user spoke first in multi-user testing.

`deep` - indicates the index of the conversation response to return in `.then()`. 0 is the last response, 1 is the second-to-last, etc..

`isAssertion` - indicates the conversation response array to return in `.then()` in multi-user testing. 

### How To Use ###

BotMock works by intercepting your normal Botkit instance.

```
var bot;
if(env !== 'test'){
    // your normal bot instance
    bot = require('app/bots/bot');
}

else{
    // your mock bot instance
    var botMock =  require('mocks/botMock');
    bot = new botMock.controller('userSlackId', 'userName').bot;
}
```

Normal botkit function

```
controller.hears(['help'], 'direct_message', function(bot, message){
    bot.reply(message, 'help message');
});
```

Normal botkit function test

```
const assert = require('assert');
const botMock = require('../mocks/botMock'); // require botmock
const testedFile = require("../bot/indexController"); // require file you are testing

describe("controller tests",()=>{
    beforeEach((done)=>{
        var self = this;
        self.slackId = 'test'
        self.userName = 'test'
        self.controller = new botMock.controller(self.slackId,self.userName) //instantiate botMock
        testedFile(self.controller.bot, self.controller) // inject botMock into the file being tested
        done();
    });
    it('should return `help message` if user types `help`', ()=>{
    	var self = this;
    	return self.controller.usersInput([{
                first:true,
                user: self.slackId,
                messages:[{text: 'help', isAssertion:true}]
            }]).catch((err)=>{
                return Promise.reject(err);
            }).then((text)=>{
                assert.equal(text, 'help message')
            })
    });
});
```

Built by the team at https://www.gratify.chat.
