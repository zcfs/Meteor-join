#Join
This package is built for general usage, but main target is to solve some
features in collectionFS.
Basicly it lets you join documents cross collections.

```js
Example:
var foo = new Join.Collection('foo');
var bar = new Meteor.Collection('bar');
var id = foo.insert({ title: 'hello foo'});
bar.insert({ title: 'hello bar', foo: foo.join(id) });
...
var doc = bar.findOne();
Get the joined foo document:
var fooDoc = bar.foo.get();
```
Security note:

> Use this with caution, any `Join.Collection` will be auto published as needed
> This makes the data in a `Join.Collection` viewable to anyone.

> We could solve this by implementing a `view` option to `allow`/`deny` rules
> for a `Join.Collection`.

###Contributions
Ideas, contributions, pull request and more are welcome,

Kind regards Morten
#Api
Below is the code documentation *produced by `docmeteor` cli tool*
´_collections´ is a collection pointer object for resolving collectionName
into a collection. Only these collections are accessible via joins

## <a name="Join"></a>new Join(id, [collection])&nbsp;&nbsp;<sub><i>Anywhere</i></sub> ##
Create a join between two collections
Adds custom EJSON-type: `Join` This is used when transporting over `ddp` and saving in `db`

__Arguments__

* __id__ *{id}*  
document `id` or object `{_id, collectionName}`
* __collection__ *{Join.Collection}*    (Optional)
Required if first parametre is `id`

-
> `Join` is a custom `EJSON` type meaning that the object is converted
> when the data is stored or transported. The reference contains
> `{ _id, collectionName }`

> ```Join = function(id, collection ``` [join.common.js:49](join.common.js#L49)

## <a name="Join.get"></a>Join.get()&nbsp;&nbsp;<sub><i>Anywhere</i></sub> ##
Returns the joined document
Usage:
```js
var foo = new Join.Collection('foo');
var bar = new Meteor.Collection('bar');
var id = foo.insert({ title: 'hello foo'});
bar.insert({ title: 'hello bar', foo: foo.join(id) });
// ...
var doc = bar.findOne();
// Get the joined foo document:
var fooDoc = bar.foo.get();
```

> ```Join.prototype.get = function() { ...``` [join.common.js:92](join.common.js#L92)

## <a name="Join.Collection"></a>new Join.Collection(name, options)&nbsp;&nbsp;<sub><i>Anywhere</i></sub> ##
Create a Meteor collection add it to lookup register

__Arguments__

* __name__ *{string}*  
Collection name, may not be `null`
* __options__ *{object}*  
As in the [Meteor documentation](http://docs.meteor.com/#meteor_collection)

-
> This is just a wrapper, we need a way to lookup collections via
> collectionName. If we could do this in plain Meteor we did not have to
> have this code..

> ```Join.Collection = function(name, options) { ...``` [join.common.js:106](join.common.js#L106)

## <a name="Join.Collection.join"></a>Join.Collection.join(id)&nbsp;&nbsp;<sub><i>Anywhere</i></sub> ##

__Arguments__

* __id__ *{id}*  
Id of document in collection to join

-
Usage:
```js
var foo = new Join.Collection('foo');
var bar = new Meteor.Collection('bar');
var id = foo.insert({ title: 'hello foo'});
bar.insert({ title: 'hello bar', foo: foo.join(id) });
```

> ```self.join = function(id) { ...``` [join.common.js:130](join.common.js#L130)


---

## <a name="Join.publish"></a>Join.publish(name, f)&nbsp;&nbsp;<sub><i>Server</i></sub> ##
Publish the cursors and make sure joined data is also published.

__Arguments__

* __name__ *{string}*  
Name of the publish
* __f__ *{function}*  
The actual publish function, returning cursor(s)

-
Check out the [Meteor documentation](http://docs.meteor.com/#meteor_publish)
> Note: From a security view, the joined document will be published if
> present in the published cursors. Only `Join.Collection's` can be "auto"
 * > published this way. We may add a `view` option for `allow`/`deny` for
 * > `Join.Collection`
 

> ```Join.publish = function(name, f) { ...``` [join.server.js:55](join.server.js#L55)


---

## <a name="Join.subscribe"></a>Join.subscribe(name, [arg1,arg2-argn], [callback])&nbsp;&nbsp;<sub><i>Client</i></sub> ##
Wrapper for `Meteor.subscribe` - Mostly for API consistency

__Arguments__

* __name__ *{string}*  
Name of subscription
* __arg1,arg2-argn__ *{any}*    (Optional)
Data to pass on to the publish
* __callback__ *{function|object}*    (Optional)
`{onError, onReady}` or `onReady` callback

-
For more info checkout the [Meteor documentation](http://docs.meteor.com/#meteor_subscribe)

> ```Join.subscribe = function(``` [join.client.js:10](join.client.js#L10)
