/*
 *
 * Copyright 2014 Tony Quetano under the terms of the MIT
 * license found at https://github.com/planttheidea/pledge/MIT_License.txt
 *
 * storage.js - A mini library to provide a simple API to access Web Storage, with cookies as a fallback
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/
(function(window,document){
	var getType = (function(global){
			var toString = ({}).toString,
				re = /^.*\s(\w+).*$/;
		
			return function(obj){
				if(obj === global){
					return 'global';
				}
				
				return toString.call(obj).replace(re,'$1').toLowerCase();
			};
		})(this),
		canUse = {
			localStorage:(function(){
				try {
					window.localStorage.setItem('t','t');
					window.localStorage.removeItem('t');
					
					return true;
				} catch(ex) {
					return false;
				};
			})(),
			sessionStorage:(function(){
				try {
					window.sessionStorage.setItem('t','t');
					window.sessionStorage.removeItem('t');
					
					return true;
				} catch(ex) {
					return false;
				};
			})()
		},
		webStorage = {
			local:(function(){
				var ls = {};
				
				if(canUse.localStorage){
					for(var item in window.localStorage){
						if(item && (item !== null)){
							var val = window.localStorage[item];
							
							try {
								var testJSON = JSON.parse(val);
								
								val = testJSON;
							} catch(ex){}
								
							ls[item] = val;
						}
					}
				} else {
					if(document.cookie){
						var keys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,'').split(/\s*(?:\=[^;]*)?;\s*/);			
						
						for(var i = 0,len = keys.length; i < len; i++) {
							var val;
							
							keys[i] = decodeURIComponent(keys[i]);
							
							val = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(keys[i]).replace(/[\-\.\+\*]/g,'\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'),'$1'));
						
							try {
								var testJSON = JSON.parse(val);
								
								val = testJSON;
							} catch(ex) {}
							
							ls[item] = val;
						}
					}
				}
				
				return ls;
			})(),
			session:(function(){
				var ss = {};
				
				if(canUse.sessionStorage){
					for(var item in window.localStorage){
						switch(getType(item)){
							case 'undefined':
							case 'null':
								break;
							default:
								var val = window.localStorage[item];
								
								try {
									var testJSON = JSON.parse(val);
									
									val = testJSON;
								} catch(ex){}
									
								ss[item] = val;
								
								break;
						}
					}
				}
				
				return ss;
			})()
		},
		setStorage = {
			local:(function(){
				if(canUse.localStorage){
					return function(key,value){
						if(key && key.length){
							webStorage['local'][key] = value;
							window.localStorage.setItem(key,value);
						}
					};
				} else {
					return function(key,value){
						if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
							return false;
						}
						
						webStorage['local'][key] = value;
						document.cookie = (encodeURIComponent(key) + "=" + encodeURIComponent(value) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT');
						
						return true;
					};
				}
			})(),
			session:(function(){
				if(canUse.sessionStorage){
					return function(key,value){						
						if(key && key.length){
							webStorage['session'][key] = value;
							window.sessionStorage.setItem(key,value);
						}
					};
				} else {
					return function(key,value){
						if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
							return false;
						}
						
						webStorage['session'][name] = value;
						document.cookie = (encodeURIComponent(key) + "=" + encodeURIComponent(value));
						
						return true;
					};
				}
			})()
		},
		removeStorage = {
			local:(function(){
				if(canUse.localStorage){
					return function(key){
						if(webStorage['local'][key]){
							delete webStorage['local'][key];
							window.localStorage.removeItem(key);
						}
					};
				} else {
					return function(key){
						if(webStorage['local'][key]){
							delete webStorage['local'][key];
							document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
						}
					};
				}
			})(),
			session:(function(){
				if(canUse.sessionStorage){
					return function(key){
						if(webStorage['session'][key]){
							delete webStorage['session'][key];
							window.sessionStorage.removeItem(key);
						}
					};
				} else {
					return function(key){
						if(webStorage['session'][key]){
							delete webStorage['session'][key];
							document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
						}
					};
				}
			})()
		},
		instance;
		
	function prv_getStorage(name,type){
		if(name){
			if(type){
				return webStorage[type][name];
			} else {
				var ls = webStorage.local[name],
					ss = webStorage.session[name];
				
				if(ls){
					if(ss){
						return {
							local:ls,
							session:ss
						};
					} else {
						return ls;
					}
				} else if(ss){
					return ss;
				} else {
					return undefined;
				}
			}
		} else if(type){
			return webStorage[type];
		} else {
			return webStorage;
		}
	}
	
	function prv_setStorage(name,value,type){
		type = (type || 'session');
		
		if(name && value){
			var jsonVal;
			
			if(getType(value) !== 'string'){
				value = JSON.stringify(value);
			}
			
			if(type === 'local'){
				setStorage.local(name,(jsonVal || value));
			} else if(type === 'session') {
				setStorage.session(name,(jsonVal || value));
			}
		} else {
			throw new Error('Must pass name and value of storage item to assign.');
		}
	}
	
	function prv_removeStorage(name,type){
		if(name){
			if(type){
				if(type === 'local'){
					removeStorage['local'](name);
				} else {
					removeStorage['session'](name);
				}
			} else {
				removeStorage['local'](name);
				removeStorage['session'](name)
			}
		} else {
			if(type){
				if(type === 'local'){
					for(var key in webStorage['local']){
						removeStorage['local'](key);
					}
				} else if(type === 'session'){
					for(var key in webStorage['session']){
						removeStorage['session'](key);
					}
				}
			} else {
				for(var key in webStorage['local']){
					removeStorage['local'](key);
				}
				
				for(var key in webStorage['session']){
					removeStorage['session'](key);
				}
			}
		}
	}
	
	function pub_getStorage(obj,type){
		switch(getType(obj)){
			case 'object':
				switch(getType(obj.data)){
					case 'string':
						return prv_getStorage(obj.data,(obj.type || type));
						
						break;
					case 'array':
						var keyObj = {};
					
						for(var i = 0, len = obj.data.length; i < len; i++){
							keyObj[obj.data[i]] = prv_getStorage(obj.data[i],(obj.type || type));
						}
						
						return keyObj;
						
						break;
					default:
						throw new Error('Invalid type passed to get, must be either an array or a string.');
						
						break;
				}
				
				break;
			case 'array':
				var keyObj = {};
				
				for(var i = 0, len = obj.length; i < len; i++){
					keyObj[obj[i]] = prv_getStorage(obj[i],type);
				}
				
				return keyObj;
				
				break;
			case 'string':
				switch(obj){
					case 'local':
					case 'session':
						return webStorage[obj];
						
						break;
					default:
						return prv_getStorage(obj,type);
						
						break;
				}
						
				break;
			case 'undefined':
				return webStorage;
				
				break;
			default:
				throw new Error('Invalid type passed to get, must be either an array or a string.');
				
				break;
		}
	}
	
	function pub_setStorage(obj,value,type){		
		switch(getType(obj)){
			case 'object':
				if(getType(obj.data) === 'object'){
					for(var key in obj.data){
						return prv_setStorage(key,obj.data[key],obj.type);
					}
				} else {
					throw new Error('Invalid type passed to data, must be an object.');
				}
				
				break;
			case 'string':
				return prv_setStorage(obj,value,type);
				
				break;
			default:
				throw new Error('Invalid type passed to set, must be either an object (for multiple keys) or a string (for a single key).');
				
				break;
				
		}
	}
	
	function pub_removeStorage(obj,type){
		switch(getType(obj)){
			case 'object':
				switch(getType(obj.data)){
					case 'string':
						prv_removeStorage(obj.data,(obj.type || type));
						
						break;
					case 'array':
						for(var i = 0, len = obj.data.length; i < len; i++){
							prv_removeStorage(obj.data[i],(obj.type || type));
						}
						
						break;
					default:
						throw new Error('Invalid type passed to get, must be either an array or a string.');
						
						break;
				}
				
				break;
			case 'array':
				for(var i = 0, len = obj.length; i < len; i++){
					prv_removeStorage(obj[i],type);
				}
				
				break;
			case 'string':
				switch(obj){
					case 'local':
					case 'session':
						for(var key in webStorage[obj]){
							prv_removeStorage(key);
						}
						
						break;
					default:
						prv_removeStorage(obj,type);
						
						break;
				}
				
				break;
			case 'undefined':
				for(var key in webStorage['local']){
					prv_removeStorage(key);
				}
				
				for(var key in webStorage['session']){
					prv_removeStorage(key);
				}
				
				break;
			default:
				throw new Error('Invalid type passed to remove, must be either an object or array (for multiple keys), or a string (for a single key).');
				
				break;
				
		}
	}
	
	window.Storage = {
		get:pub_getStorage,
		remove:pub_removeStorage,
		set:pub_setStorage
	};
})(window,document);
