'use strict';
const {Botkit} = require('botkit');
const {TurnContext} = require('botbuilder');
const {setTimeoutAsync} = require('./utils');


class Botmock extends Botkit {
	constructor(config) {
		super(config);
		this.detailed_answers = {};
		this.adapter._originSendActivities = this.adapter.sendActivities;
		this.adapter.sendActivities = this._sendActivities.bind(this);
	}

	async _sendActivities(context, activities) {
		for (let activity of activities) {
			if (Array.isArray(this.detailed_answers[activity.conversation.id])) {
				this.detailed_answers[activity.conversation.id].push(activity);
			} else {
				this.detailed_answers[activity.conversation.id] = [activity];
			}
		}
	}

	async usersInput(userSequences) {
		for (let userSequence of userSequences) {
			for (let message of userSequence.messages) {
				const activity = {
					id: message.id || null,
					timestamp: new Date(),
					channelId: 'slack',
					conversation: {
						id: message.channel || userSequence.channel,
						thread_ts: message.thread_ts || null
					},
					from: {id: userSequence.user || message.user || null},
					recipient: {id: message.recipient},
					channelData: {
						botkitEventType: message.type || userSequence.type || 'direct_message',
						...message
					},
					text: message.text,
					type: 'event'
				};

				const context = new TurnContext(this.adapter, activity);

				if (message.waitBefore && message.waitBefore > 0) {
					await setTimeoutAsync(message.waitBefore);
				}

				await this.adapter.runMiddleware(context, this.handleTurn.bind(this));

				if (message.waitAfter && message.waitAfter > 0) {
					await setTimeoutAsync(message.waitAfter);
				}

				if (message.isAssertion) {
					const messagesLog = this.detailed_answers[activity.conversation.id];
					let result = {};
					if (messagesLog) {
						const deepIndex = messagesLog.length - 1 - (message.deep || 0);
						result = messagesLog[deepIndex];
					}
					return result;
				}
			}
		}

		throw new Error("isAssert is missed in message sequence");
		// /*
		//
		//  */
		// const questions = [];
		//
		// sequence.forEach(function (userMessage) {
		// 	userMessage.messages.forEach(function (message) {
		// 		questions.push(function (cb) {
		// 			var logic = function () {
		// 				message.channel = message.channel || userMessage.channel;
		// 				message.user = message.user || userMessage.user;
		// 				message.type = (message.type || userMessage.type || 'direct_message');
		//
		// 				bot.receive(message);
		//
		// 				setTimeout(function () {
		// 					if (message.isAssertion) {
		// 						cb({payload: {isAssertion: true, deep: message.deep, channel: message.channel}});
		// 					} else {
		// 						cb(null);
		// 					}
		// 				}, message.waitAfter || config.afterProcessingUserMessageTimeout);
		// 			};
		//
		// 			//add default timeout for async workflow
		// 			setTimeout(logic, message.waitBefore || message.timeout || config.beforeProcessingUserMessageTimeout);
		// 		});
		// 	});
		// });
		//
		// botkit.startTicking();
		//
		// return new Promise(function (resolve) {
		// 	async.series(questions, function (err) {
		// 		var payload = err.payload;
		// 		if (!payload) {
		// 			throw new Error();
		// 		}
		// 		if (payload.isAssertion) {
		// 			var entity = bot.detailed_answers[payload.channel];
		// 			var result = {};
		// 			if (entity) {
		// 				var index = bot.detailed_answers[payload.channel].length - 1 - (payload.deep || 0);
		// 				result = bot.detailed_answers[payload.channel][index];
		// 			}
		// 			resolve(result);
		// 		}
		// 	});
		// });
	}
}

module.exports = Botmock;