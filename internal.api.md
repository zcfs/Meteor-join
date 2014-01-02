> File: ["join.common.js"](join.common.js)
> Where: {client|server}

-
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

## <a name="Join"></a>new Join(id|options, [collection])&nbsp;&nbsp;<sub><i>Anywhere</i></sub> ##
Create a join between two collections
Adds custom EJSON-type: `Join` This is used when transporting over `ddp` and saving in `db`

__Arguments__

* __id|options__ *{id|object}*  
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
> File: ["join.server.js"](join.server.js)
> Where: {server}

-

## <a name="_sessionJoins"></a>_sessionJoins {any}&nbsp;&nbsp;<sub><i>Server</i></sub> ##
Make sure we dont publish or unpublished joins
Overview of the `_sessionJoins` structure:
```js
_sessionJoins = {
'74LKuDFQLr3gauqXn': {
  'foo': { // Collection foo
    'jQBNeWrwC54RE63wf': {
      handle: Handle to document,
      count: 0 // number of count
    }
  }
}
}
```
We use this object to keep track of join publications making sure they are
only active if needed. If count gets to 0 the handle is stopped and the
publish reference is removed.

> ```_sessionJoins = { ...``` [join.server.js:19](join.server.js#L19)

## <a name="_withEachJoin"></a>_withEachJoin(obj, f)&nbsp;&nbsp;<sub><i>Server</i></sub> ##

__Arguments__

* __obj__ *{object}*  
The object to scan for `Join` instances
* __f__ *{function}*  
The callback function

-
The `Join` elements are passed to the callback.
```js
_withEachJoin(document, function(join) {
  // do something with this join eg. get its cursor
  var cursor = join.cursor();
});
```

> ```_withEachJoin = function(obj, f) { ...``` [join.server.js:32](join.server.js#L32)

## <a name="Join.publish"></a>Join.publish(name, f)&nbsp;&nbsp;<sub><i>Server</i></sub> ##
Publish the cursors and make sure joined data is also published.
@Join.publish Publish data, supports joins

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

> ```Join.publish = function(name, f) { ...``` [join.server.js:56](join.server.js#L56)

## <a name="    _publishJoin"></a>    _publishJoin {any}&nbsp;&nbsp;<sub><i>Server</i></sub> ##
@method _publishJoin Make sure that the join document is published
    * @param {Join} join The join reference to publish
    * @private
    *
    * > This function will check `_sessionJoins` to make sure that the data
    * > is not allready published.
    *
    * > Note: We could add the `view` (allow/deny) check here to make sure
    * > that the data is allowed to be published.
    

> ```    _publishJoin = function(join) { ...``` [join.server.js:90](join.server.js#L90)

## <a name="    _unPublishJoin"></a>    _unPublishJoin {any}&nbsp;&nbsp;<sub><i>Server</i></sub> ##
@method _unPublishJoin Unpublish a joined document
    * @param {[Join](#Join)} join The join to unpublish
    * This function will unpublish the joined document - but only if other
    * documents are not requring the data.
    * 
    * > We keep track of join handle usage via `count`
    * > If count is 0 then we stop the handle and clean up memory
    

> ```    _unPublishJoin = function(join) { ...``` [join.server.js:135](join.server.js#L135)


---
> File: ["join.client.js"](join.client.js)
> Where: {client}

-

## <a name="Join.subscribe"></a>Join.subscribe(name, arg1, arg2 , [callback])&nbsp;&nbsp;<sub><i>Client</i></sub> ##
Wrapper for `Meteor.subscribe` - Mostly for API consistency

__Arguments__

* __name__ *{string}*  
Name of subscription
* __arg1, arg2 __ *{object}*  * __callback__ *{function|object}*    (Optional)
`{onError, onReady}` or `onReady` callback

-
For more info checkout the [Meteor documentation](http://docs.meteor.com/#meteor_subscribe)

> ```Join.subscribe = function(``` [join.client.js:10](join.client.js#L10)
