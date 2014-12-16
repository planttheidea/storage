storage
=======

A microlibrary API to use Web Storage, with a fallback to cookies when not supported

### Purpose

While localStorage and sessionStorage come a long way towards a more workable in-browser storage environment, they have some limitations as a nature of their type. They only store strings, they are separate entities, and worst of all ... they aren't universally supported! IE7 and below, and certain mobile browsers (-cough- Opera Mini -cough-) don't use them. So this API was built with the idea that you could have one, unified interface for all forms of storage. Plus, all the items you are working with are object-based, which makes them much easier to add / remove / modify (especially in cookieland).

There are two versions available, the standard version (which is library-agnostic, and vastly preferred) and a jQuery plugin. The sizes below refer to the standard version.

### Size

+ Uncompressed: 8.24KB
+ Minified: 4.09KB
+ Minified and gzipped: 1.37KB

### Use

**Standard version**

The instantiation of the plugin creates a global window variable named *Storage*, which has three methods:
+ get
+ remove
+ set

These (shockingly) will *get* any assigned values based on keys passed, *set* values for keys passed, or *remove* values for keys passed.

*get*
```html
Storage.get();

Storage.get('local');

Storage.get('stringKey','session');

Storage.get(['arrayKey','available','asWell'],'local');

Storage.get({
  data:'objectsCan',
  type:'session'
});

Storage.get({
  data:['beUsed','asWell']
},'local');
```

The examples above will, in order, return:
+ Object with all key:value pairs, segregated by type (*local* and *session*)
+ Object of all key:value pairs specific to type *local* 
+ Return the value for the *stringKey* key in *session* storage
+ Return an object of key:value pairs for the *arrayKey*, *available*, and *asWell* keys in *local* storage
+ Return the value for the *objectsCan* key in *session* storage
+ Return an object of key:value pairs for the *beUsed* and *asWell* keys in *local* storage

Explicitly declaring the *type* is not required; if you leave it off, the value (or an object of key:value pairs, if multiple are requested) will be pulled from both *local* and *session* storage. If the same key is used for items in both *local* and *session* storage, the value in that key:value pair will be another object calling out the *local* and *session* values. Also, when using the object method, you can specify the *type* either in the object, or as a string following the object.

*set*
```html
Storage.set('stringValues','canWork','local');

Storage.set({
  data:{
    orObject:'values',
    canBe:'usedToo'
  },
  type:'session'
});

Storage.set({
  data:{
    ifYou:'want'
  }
},'local');
```

The examples above will, in order, perform the action of:
+ setting the *stringValues* key in *local* storage with the value of *canWork*
+ setting the *orObject* and *usedToo* keys in *session* storage with the values of *values* and *usedToo*, respectively
+ setting the *ifYou* key in *local* storage with the value of *want*

As with the get method, you can place the *type* either in the object or as a string following the object. You also do not need to specify the *type*, however if you don't then it will default to using *session* storage. The choice of that over *local* was really driven by minimizing long-term footprint.

*remove*
```html
Storage.remove();

Storage.remove('local');

Storage.remove('stringKey','session');

Storage.remove({
  data:'asBefore',
  type:'local'
});

Storage.remove({
  data:['objectsCan','beUsed','asWell']
},'session');
```

The examples above will, in order, perform the following actions:
+ Remove all *local* and *session* storage
+ Remove all *local* storage
+ Remove the *stringKey* key from *session* storage
+ Remove the *asBefore* key from *local* storage
+ Remove the *objectsCan*, *beUsed*, and *asWell* keys from *session* storage

As with the other methods, if the object method is used then the *type* can be placed inside the object or following it as a string, and it is optional. If you do not specify the *type*, then the key(s) you pass in will be removed from both *local* and *session* storage.

The standard version is recommended over using the jQuery plugin version, both because it is library agnostic, but also because (in my humble opinion) the API is clearer and more extensible. If you really want to use this as a jQuery plugin, though ... here ya go.

**jQuery plugin version**

Much like the .ajax() method in jQuery, everything passed here is through an object. Here are the components:
+ action (string, optional)
+ type (string, optional)
+ data (string / array / object, optional)

Notice everything is optional ... if you pass nothing in, it defaults to the *get* action, returning an object of all items.

**action**

This will define what you are going to do to storage. For simplicity of explanation, I'll give examples with all options provided, and explain what happens if you leave those options out.

*get*
```html
$.storage({
  action:'get',
  //data:'foo'
  data:['foo','bar'],
  type:'local'
});
```

In this example, you are *get*ting the values of both *foo* and *bar* that is stored in *local* storage, and it will return an array of values matching the order you passed into data. If you leave off the *type*, it will look in both *local* and *session* storage for the keys passed in to *data*. If you pass a single string instead of the array (what is commented out), then the value of that item will get returned (not as an array, as whatever it is). If you leave out *get*, it will actually do the same thing ... the *get* value is the default *action*.

*set*
```html
$.storage({
  action:'set',
  data:{
    foo:1,
    bar:2,
    nested:{
      whatever:'youWant'
    }
  },
  type:'session'
});
```

In this example, you are *set*ting the values of *foo*, *bar*, and *nested*. Internally, because *nested* is not a string, it will be stored as a JSON object, but otherwise it does exactly what it looks like ... sets those values. If you leave off the *type*, it will default to use *local*, and if you leave off the *data*, well ... it will just fail haha. In this case, *data* will only accept an object of key:value pairs. In this case, *set* is required for this action, because otherwise it will try to *get* and error out because *data* is an object.

*remove*
```html
$.storage({
  action:'set',
  //data:'foo'
  data:['foo','bar'],
  type:'session'
});
```

In this example, you are *remove*ing (I know) the values of *foo* and *bar*. If you leave off the *type*, then it will try to remove those objects from both *local* and *session* storage if they exist. If you leave off the *data*, then it will clear everything out of either the type specified or everything!

Pretty straightforward stuff. Coming soon, the pure JS version.
