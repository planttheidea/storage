storage
=======

A microlibrary API to use Web Storage, with a fallback to cookies when not supported

### Purpose

While localStorage and sessionStorage come a long way towards a more workable in-browser storage environment, they have some limitations as a nature of their type. They only store strings, they are separate entities, and worst of all ... they aren't universally supported! IE7 and below, and certain mobile browsers (-cough- Opera Mini -cough-) don't use them. So this API was built with the idea that you could have one, unified interface for all forms of storage.

### Size

+ Uncompressed: 7.08KB
+ Minified: 2.19KB
+ Minified and gzipped: 1.2KB

### Use

*Note: this is just for the jQuery version right now. A vanilla JS version is coming soon, though.*

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
