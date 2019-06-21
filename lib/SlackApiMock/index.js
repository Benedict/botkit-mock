const AxiosMockAdapter = require('axios-mock-adapter');
const {defaultSlackEndpoints} = require('./api');

/**
 * Bind mock api to botkit controller.
 * @param controller {Botkit}
 * @returns {MockAdapter}
 */
module.exports.bindMockApi = function (controller) {
	const axios = require('axios');
	const axiosMockAdapter = new AxiosMockAdapter(axios);
	const originAxiosAdapter = axios.defaults.adapter;

	const logByKey = {};
	logByKey.logData = function (url, data){
		if(Array.isArray(logByKey[url])){
			this[url].push(data);
		}else{
			this[url] = [data];
		}
	};

	/*
	* monkey patch of axios mock adapter
	* axios mock does not return request and headers objects for response
	* */
	axios.defaults.adapter = async function (...params) {
		const config = params[0];
		logByKey.logData(config.url, JSON.parse(config.data));

		const response = await originAxiosAdapter(...params);
		response.request = {};
		response.headers = {};
		return response;
	};

	/**
	 * bind default slack api endpoints to axios mock
	 */
	for (const endpointKey of Object.keys(defaultSlackEndpoints)) {
		axiosMockAdapter.onPost(`${endpointKey}`).reply(
			200,
			{
				ok: true,
				...defaultSlackEndpoints[endpointKey]
			}
		)
	}

	controller.axiosMockAdapter = axiosMockAdapter;
	controller.apiLogByKey = logByKey;
	controller.adapter.slack.axios = axios;
	/**
	 * mock replace
	 */
	controller.middleware.spawn.use((bot) => {
		bot.api.axios = axios;

		bot.replyInteractive = (async function(src, res){
			if (!src.incoming_message.channelData.response_url) {
				throw Error('No response_url found in incoming message');
			} else {
				logByKey.logData(src.incoming_message.channelData.response_url, this.ensureMessageFormat(res));
			}
		}).bind(bot)
	});

	return axiosMockAdapter;
};