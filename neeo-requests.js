'use strict'
const Homey = require('homey');
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');
const neeoBrain = require('./neeo-brain');
const tools = require('./tools');
const neeoSliderChanged = require('./homey-if-neeoSliderChanged');
const neeoSwitchChanged = require('./homey-if-neeoSwitchChanged');
const neeoButtonPressed = require('./homey-if-neeoButtonPressed');


module.exports.db = function db(request){
	let responseData = {
		code: 200,
		Type: {'Content-Type': 'application/json'},
		content: ''
	};
	console.log('[DATABASE]\tReceived request: '+request);
	if (typeof request === 'string' && request.substr(0,9) === 'search?q=') {
		const queery = request.replace('search?q=','');
		const founddevices = neeoDatabase.deviceSearch(queery);
		responseData.content = JSON.stringify(founddevices);
	} else { 
		const founddevice = neeoDatabase.deviceById(request);
		responseData.content = JSON.stringify(founddevice);
	}
	return (responseData);
}


module.exports.device = function device(deviceName, deviceFunction, deviceParameter){
	let responseData = {
		code: 200,
		type: {'Content-Type': 'application/json'},
		content: ''
	};
	const capability = neeoDatabase.capability(deviceName, deviceFunction);
	if (!capability.type){
		capability.type = 'error';
	}
	if (capability.type === 'sensor') {
		if (deviceParameter === 'base64') {
			let buf = Buffer.from(capability.sensor.base64, 'base64');
			responseData = {'code': 200,'Type': {'Content-Type': 'image'}, 'content': buf};
			console.log ('[SENSOR]\tReceived request for sensor: ' + deviceName + ', ' + deviceFunction + '.  Responded with image buffer.');
		} else {
			responseData.content = JSON.stringify({value: capability.sensor.value});
			console.log ('[SENSOR]\tReceived request for sensor: ' + deviceName + ', ' + deviceFunction + '.  Responded: ' + capability.sensor.value);
		}
	}
	else if (capability.type === 'button') {
		console.log ('[EVENTS]\tButton pressed: ' + deviceName + ', ' + deviceFunction + '.');
		neeoButtonPressed.trigger({}, {'adapterName': deviceName, 'capabilitie': deviceFunction});
	}
	else if (capability.type === 'slider') {
		console.log ('[EVENTS]\tSlider state changed: ' + deviceName + ', ' + deviceFunction + '.  Value: ' + deviceParameter);
		deviceParameter = parseInt(deviceParameter, 10);
		const decimalvalue = tools.mathRound(deviceParameter / capability.slider.range[1],2);
		neeoBrain.notifyStateChange(deviceName, deviceFunction + '_SENSOR', deviceParameter, () => { });
		homeyTokens.set(deviceName, deviceFunction, deviceParameter, () => { });
		neeoSliderChanged.trigger({'value': deviceParameter, 'decimalvalue': decimalvalue}, {'adapterName': deviceName, 'capabilitie': deviceFunction});
		responseData.content = neeoDatabase.capabilitySetValue(deviceName, deviceFunction, deviceParameter)
	}
	else if (capability.type === 'switch') {
		console.log ('[EVENTS]\tSwitch state changed: ' + deviceName + ', ' + deviceFunction + '.  Value: ' + deviceParameter);
		if (deviceParameter === 'true') { deviceParameter = true}
		if (deviceParameter === 'false') { deviceParameter = false} 
		neeoSwitchChanged.trigger({'value': deviceParameter}, {'adapterName': deviceName, 'capabilitie': deviceFunction});
		homeyTokens.set(deviceName, deviceFunction, deviceParameter);
		neeoBrain.notifyStateChange(deviceName, deviceFunction + '_SENSOR', deviceParameter)
		responseData.content = neeoDatabase.capabilitySetValue(deviceName, deviceFunction, deviceParameter)
	}
	else {
		console.log (" !! Warning !!");
		console.log (" The folowing request isn't expected:");
		console.log (" - Device:      " + deviceName);
		console.log (" - Function:    " + deviceFunction);
		console.log (" - Value:       " + deviceParameter);
		responseData.code = 400
	}
	return (responseData);
}


module.exports.subscribe = function subscribe(uriparts, brainIP){
	brainIP = brainIP.replace(/^.*:/, '');
	console.log ("[NOTIFICATIONS]\tRequest for subscription from: " +  brainIP);
	const responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': '{"success":true}'};
	return (responseData);
}


module.exports.unsubscribe = function unsubscribe(uriparts, brainIP){
	brainIP = brainIP.replace(/^.*:/, '');
	console.log ("[NOTIFICATIONS]\tRequest for unsubscription from: " +  brainIP);
	const responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': '{"success":true}'};
	return (responseData);
}


module.exports.capabilities = function capabilities(uriparts){
	let responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	const founddevice = neeoDatabase.deviceByAdaptername(uriparts[1]);
	responseData.content = JSON.stringify(founddevice.capabilities);
	return (responseData);
}


module.exports.unknown = function unknown(uriparts){
	console.log ('[ERROR]\tRECEIVED UNKNOWN REQUEST.');
	console.log (uriparts);
	const responseData = {'code': 500,'Type': {'Content-Type': 'application/json'}, 'content': '{"error": "Unknown request."}'};
	return (responseData);
}