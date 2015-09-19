define([
	'util/localStorage',
	'util/log',
	'util/roll',
	'util/dcopy',
	'util/JSON'
], function(localStorage, log, roll, dcopy, JSON){
	var storagePrefix = 'wa_';
	var reg = new RegExp('^' + storagePrefix + '\\d+$');
	
	//return object
	function getStorage(key){
		var r;
		try{
			r = JSON.parse(localStorage.getItem(key));
		}catch(e){
			log(e);
			r = null;
		}
		return r;
	};
	
	// return all wa stored objects in an Array.like below
	// [
		// {
			// key:key,
			// value:object
		// }
	// ]
	function getAllStorages(){
		var i,
				tmp1,
				r = [],
				storage = localStorage;
		i = storage.length;
		if(i === 0){
			return r;
		}
		// try{
			while(i--){
				tmp1 = {};
			  tmp1.key = storage.key(i);
			  reg.lastIndex = 0;
				// console.log(key);
			  if(reg.test(tmp1.key)){
			  	tmp1.value = JSON.parse(storage.getItem(tmp1.key));
					r.push(tmp1);
			  }
			}
		// }catch(e){
			// log(e);
			// r = [];
		// }
		return r;
	};
	
	// add value to localStorage with prefix.
	// return the key, with prefix
	function setStorage(value){
		var key,
				v,
				storage = localStorage;
		key = storagePrefix + roll(0, 999999);
		if(getStorage(key)){
			// remove the key before set it.
			storage.removeItem(key);
		}
		
		// create a new obj to make this function can be cycle
		v = dcopy(value);
		//v.storageKey = key;
		storage.setItem(key, JSON.stringify(v));
		
		return key;
	};
	
	// key can be an Array(multiple) or a string(single)
	function removeStorage(key){
		var i,
				keys = [],
				storage = localStorage;
		// support for single or multiple remove
		if(typeof key === 'string'){
			keys.push(key);
		}else{
			keys = keys.concat(key);
		}
		i = keys.length;
		while(i--){
			// console.log(keys[i]);
			storage.removeItem(keys[i]);
		}
	};
	// clear all storages with prefix 'wa_'.
	function clear(){
		var i,
				key,
				storage = localStorage;
		// console.log('l:'+storage.length);
		i = storage.length;
		if(i === 0){
			return;
		}
		while(i--){
		  // storage.getItem(storage.key(i));
		  key = storage.key(i);
		  reg.lastIndex = 0;
		  // console.log(reg.test(key));
		  if(reg.test(key)){
				storage.removeItem(key);
		  }
		}
	}
	
	return {
		get: getStorage,
		all: getAllStorages,
		set: setStorage,
		remove: removeStorage,
		clear: clear
	};
});