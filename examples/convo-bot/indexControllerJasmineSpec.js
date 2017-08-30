'use strict';
const Botmock = require('../../lib/Botmock');
const fileBeingTested = require('./indexController');

describe('controller tests', () => {
	afterEach(() => {
		//clean up botkit tick interval
		this.controller.shutdown();
	});
	
	beforeEach((done) => {
		this.userInfo = {
			slackId: 'user123',
			channel: 'channel123',
		};
		
		this.controller = Botmock({
			debug: false,
		});
		
		this.bot = this.controller.spawn({
			type: 'slack',
		});
		
		fileBeingTested(this.controller);
		done();
	});
	
	it('should return `help message` if user types `help`', (done) => {
		let sequence = [
			{
				//type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'help',
						isAssertion: true,
					}
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('help message');
			done();
		}).catch(done);
	});
	
	it('should return `hey there` if a user types `hi`', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hi',
						isAssertion: true,
					}
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hey there');
			done();
		}).catch(done);
	});
	
	it('should return question `here a question` if user type any text after `hi`', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hi',
					},
					{
						text: 'its true',
						isAssertion: true,
					}
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('here a question');
			done();
		}).catch(done);
	});
	
	it('should return `..user typed any text after `hi`` if user types any text after `hi`', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hi',
					},
					{
						text: 'its true',
						// deep indicates which message to return in then .then()
						// ie deep: 1, text => its true. deep:2, text => hi
						deep: 1,
						isAssertion: true,
					}
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('..user typed any text after `hi`');
			done();
		}).catch(done);
	});
	
	it('should return `here a question` if user type any text after bot says `..user typed any text after `hi``', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hi',
					},
					{
						text: 'random user message 1',
					},
					{
						text: 'random user message 2',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('here an answer');
			done();
		}).catch(done);
	});
	
	it('should return `hello bot reply` (through bot.reply) in channel if user types `hello bot` in channel', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'newbies',
					},
					{
						text: 'hello bot reply',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(this.bot.detailed_answers[this.userInfo.channel][0].text).toBe('hello bot reply');
			done();
		}).catch(done);
		
	});
	
	it('should return `hello bot say` (through bot.say) in channel if user types `hello bot` in channel', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'newbies',
					},
					{
						text: 'hello bot say',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(this.bot.detailed_answers[this.userInfo.channel][0].text).toBe('hello bot say');
			done();
		}).catch(done);
	});
	
	it('should return `hello bot direct_mention` if user types `hello bot direct` as direct_mention', (done) => {
		let sequence = [
			{
				type: 'direct_mention', //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hello bot direct',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hello bot direct_mention');
			done();
		}).catch(done);
	});
	
	it('should return `hello bot direct_message` if user types `hello bot direct_message` as direct_message', (done) => {
		let sequence = [
			{
				type: 'direct_message', //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hello bot direct',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hello bot direct_message');
			done();
		}).catch(done);
	});
	
	it('should return `hello bot multiple` if user types `hello bot multiple` as direct_message', (done) => {
		let sequence = [
			{
				type: 'direct_message', //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hello bot multiple',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hello bot multiple');
			done();
		}).catch(done);
	});
	
	it('should return `hello bot multiple` if user types `hello bot multiple` as ambient', (done) => {
		let sequence = [
			{
				type: 'ambient', //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hello bot multiple',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hello bot multiple');
			done();
		}).catch(done);
	});
	
	it('should return `hello bot multiple` if user types `hello bot multiple` as mention', (done) => {
		let sequence = [
			{
				type: 'mention', //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'hello bot multiple',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hello bot multiple');
			done();
		}).catch(done);
	});
	
	it('should return `hello reply with typing` if user types `reply with typing`', (done) => {
		let sequence = [
			{
				type: null, //if type null, default to direct_message
				user: this.userInfo.slackId, //user required for each direct message
				channel: this.userInfo.channel, // user channel required for direct message
				messages: [
					{
						text: 'reply with typing',
						isAssertion: true,
					},
				]
			}
		];
		
		return this.bot.usersInput(sequence).then((message) => {
			expect(message.text).toBe('hello reply with typing');
			done();
		}).catch(done);
	});
});
