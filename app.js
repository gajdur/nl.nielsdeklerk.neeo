/* global Homey */
'use strict'

const neeoServer = require('./neeo-server');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');
const tools = require('./tools');


module.exports = {
	apiDiscover: function(callback) {
		neeoBrain.discover();
	},
	init: function () {
		// Button pressed.
		Homey.manager('flow').on('trigger.button_pressed.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('trigger.button_pressed.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "button"));
		});
		Homey.manager('flow').on('trigger.button_pressed', function (callback, args, state) {
			if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
				Homey.log  ('[HOMEY] \tA flow is triggered by card "button_pressed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
				callback(null, true);
			} else {
				callback(null, false);
			}
		});
		//switch_changed
		Homey.manager('flow').on('trigger.switch_changed.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('trigger.switch_changed.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "switch"));
		});
		Homey.manager('flow').on('trigger.switch_changed', function (callback, args, state) {
			if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
				Homey.log ('[HOMEY] \tA flow is triggered by card "switch_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
				callback(null, true);
			} else {
				callback(null, false);
			}
		});
		//slider_changed
		Homey.manager('flow').on('trigger.slider_changed.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('trigger.slider_changed.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "slider"));
		});
		Homey.manager('flow').on('trigger.slider_changed', function (callback, args, state) {
			if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
				Homey.log  ('[HOMEY] \tA flow is triggered by card "slider_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
				callback(null, true);
			}  else {
				callback(null, false);
			}
		});
		//activate_recipe
		Homey.manager('flow').on('action.activate_recipe.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.activate_recipe.recipe.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.recepies(args, 'launch'));
		});
		Homey.manager('flow').on('action.activate_recipe', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tActivating recipe ' + args.recipe.name + '.'); 
			tools.httpGetAndForget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/recipes/' + args.recipe.key + '/execute');  // move to neeo-brain
			callback( null, true ); 
		});
		//poweroff_recipe
		Homey.manager('flow').on('action.poweroff_recipe.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.poweroff_recipe.recipe.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.recepies(args, 'poweroff'));
		});
		Homey.manager('flow').on('action.poweroff_recipe', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tPowering off recipe ' + args.recipe.name + '.'); 
			tools.httpGetAndForget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/recipes/' + args.recipe.key + '/execute') // move to neeo-brain
			callback( null, true ); 
		});
		//Poweroff_all
		Homey.manager('flow').on('action.poweroff_all_recipes', function (callback) {
			 // move to neeo-brain
			Homey.log  ('[HOMEY] \tPowering off all recipes.'); 
			const neeoBrains = Homey.manager('settings').get( 'neeoBrains' );
			for (const neeoBrain of neeoBrains){
				tools.httpRequestJson ('GET', neeoBrain.host, 3000, '/v1/api/Recipes', null, function(res, recipies){
					if (typeof recipies !== 'undefined'){
						recipies = JSON.parse(recipies);
						const url=require('url');
						for (const recipie of recipies) {
							if (recipie.isPoweredOn === true){
								Homey.log  (' - Powering off '+recipie.detail.devicename)
								const a = url.parse(recipie.url.setPowerOff)
								tools.httpGetAndForget('GET', a.hostname, a.port, a.pathname)
							}
						}
					}
					callback( null, true );
				});
			} 
		});
		//command_button
		Homey.manager('flow').on('action.command_button.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.command_button.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.roomDevices(args));
		});
		Homey.manager('flow').on('action.command_button.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.macros(args));
		});
		Homey.manager('flow').on('action.command_button', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tPressing the "' + args.capabilitie.name + '" button of ' + args.device.name); 
			tools.httpGetAndForget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/macros/' + args.capabilitie.key + '/trigger');
			callback( null, true ); 
		});
		//command_switch
		Homey.manager('flow').on('action.command_switch.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});	
		Homey.manager('flow').on('action.command_switch.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.roomDevices(args));
		});
		Homey.manager('flow').on('action.command_switch.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.switches(args));
		});
		Homey.manager('flow').on('action.command_switch', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tFlip switch "' + args.capabilitie.name + '" of ' + args.device.name); 
			tools.httpGetAndForget('PUT', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/switches/' + args.capabilitie.key + '/' + args.value);
			callback( null, true ); 
		});
		//command_slider
		Homey.manager('flow').on('action.command_slider.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.command_slider.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.roomDevices(args));
		});
		Homey.manager('flow').on('action.command_slider.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.sliders(args));
		});
		Homey.manager('flow').on('action.command_slider', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tDragging slider "' + args.capabilitie.name + '" of ' + args.device.name + ' to ' + args.value); 
			tools.httpGetAndForget('PUT', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/sliders/' + args.capabilitie.key, {value: args.value});
			callback( null, true ); 
		});
		//inform_slider
		Homey.manager('flow').on('action.inform_slider.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_slider.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "range"));
		});
		Homey.manager('flow').on('action.inform_slider', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_slider');
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		});
		//inform_slider_value
		Homey.manager('flow').on('action.inform_slider_value.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_slider_value.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "range"));
		});
		Homey.manager('flow').on('action.inform_slider_value', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_slider_value');
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		});
		//inform_switch
		Homey.manager('flow').on('action.inform_switch.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_switch.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "binary"));
		});
		Homey.manager('flow').on('action.inform_switch', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_switch');
			if (args.value === "true") {args.value = true};
			if (args.value === "false") {args.value = false};
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value)
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		});
		//inform_textlabel
		Homey.manager('flow').on('action.inform_textlabel.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_textlabel.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "custom"));
		});
		Homey.manager('flow').on('action.inform_textlabel', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_textlabel');
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		});
	}
};