

(function($,window,document){
				var canUse = {
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
									switch($.type(item)){
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
										webStorage['local'][name] = value;
										window.localStorage.setItem(key,value);
									}
								};
							} else {
								return function(key,value){
									if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
										return false;
									}
									
									webStorage['local'][name] = value;
									document.cookie = (encodeURIComponent(key) + "=" + encodeURIComponent(value) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT');
									
									return true;
								};
							}
						})(),
						session:(function(){
							if(canUse.sessionStorage){
								return function(key,value){
									if(key & key.length){
										webStorage['session'][name] = value;
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
					};
					
				function prv_getStorage(name,type){
					if(name){
						if(type){
							return webStorage[type][name];
						} else {
							var ls = webStorage.local[name],
								ss = webStorage.session[name];
							
							if(ls){
								if(ss){
									return [ls,ss];
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
						
						if($.type(value) !== 'string'){
							value = JSON.stringify(value);
						}
						
						if(type === 'local'){
							setStorage.local(name,(jsonVal || value));
						} else {
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
				
				function prv_useStorage(storageObj){
					if(storageObj){
						if(storageObj.action){
							switch(storageObj.action){
								case 'get':
									switch($.type(storageObj.data)){
										case 'array':
											var keyArr = [];
											
											for(var i = 0, len = storageObj.data.length; i < len; i++){
												keyArr.push(prv_getStorage(storageObj.data[i],storageObj.type));
											}
											
											return keyArr;
											
											break;
										case 'string':
											return prv_getStorage(storageObj.data,storageObj.type);
											
											break;
										case 'undefined':
											if(storageObj.type){
												return webStorage[storageObj.type];
											} else {
												return webStorage;
											}
											
											break;
										default:
											throw new Error('Invalid type passed to get, must be either an array or a string.');
											
											break;
									}
									
									break;
								case 'set':
									if($.type(storageObj.data) === 'object'){
										for(var key in storageObj.data){
											prv_setStorage(key,storageObj.data[key],storageObj.type);
										}
									} else {
										throw new Error('Invalid type passed to set, must be an object.');
									}
									
									break;
								case 'remove':
									prv_removeStorage(storageObj.name,storageObj.type);
									
									break;
							}
						} else if(storageObj.name) {
							if(storageObj.value){
								
							} else {
								prv_getStorage(storageObj.name,storageObj.type);
							}
						} else if(storageObj.type){
							return webStorage[storageObj.type];
						}
					} else {
						return webStorage;
					}
				}
				
				function pub_useStorage(storageObj){
					return prv_useStorage(storageObj);
				}
				
				$.extend({
					storage:function(storageObj){
						return pub_useStorage(storageObj);
					}
				});
			})(jQuery,window,document);
