// #Join
// This package is built for general usage, but main target is to solve some
// features in collectionFS.
// Basicly it lets you join documents cross collections.
//
// ```js
// Example:
//   var foo = new Join.Collection('foo');
//   var bar = new Meteor.Collection('bar');
//   var id = foo.insert({ title: 'hello foo'});
//   bar.insert({ title: 'hello bar', foo: foo.join(id) });
//   // ...
//   var doc = bar.findOne();
//   // Get the joined foo document:
//   var fooDoc = bar.foo.get();
// ```
// Security note:
//
// > Use this with caution, any `Join.Collection` will be auto published as needed
// > This makes the data in a `Join.Collection` viewable to anyone.
//
// > We could solve this by implementing a `view` option to `allow`/`deny` rules
// > for a `Join.Collection`.
//
// ###Contributions
// Ideas, contributions, pull request and more are welcome,
//
// Kind regards Morten

// #Api
// Below is the code documentation *produced by `docmeteor` cli tool*

// `_collections` is a collection pointer object for resolving collectionName
// into a collection. Only these collections are accessible via joins
var _collections = {};

/** Create a join between two collections
  * @method Join
  * @namespace Join
  * @constructor
  * @ejsontype Join This is used when transporting over `ddp` and saving in `db`
  * @param {id} id document `id` or object `{_id, collectionName}`
  * @param {Join.Collection} [collection] Required if first parametre is `id`
  *
  * > `Join` is a custom `EJSON` type meaning that the object is converted
  * > when the data is stored or transported. The reference contains
  * > `{ _id, collectionName }`
  */
Join = function(id, collection /* [{ _id, collectionName }] or [id, collection] */ ) {
  var self = this;
  // Get the id
  self._id = id && id._id || id;
  // Get the collection name
  self.collectionName = collection && collection._name || id && id.collectionName;
  // Get the actual collection
  self.collection = _collections[self.collectionName]
  // Constructor needs `new` Join()
  if (!(self instanceof Join)) {
    throw new Error('Use "new Join()" to construct a new join');
  }
  // We need an id otherwise we cant reference the document
  if (typeof self._id === 'undefined') {
    throw new Error('Join need id as parametre');
  }
  // The collection reference should be an instance of Meteor.Collection
  if (!(self.collection instanceof Meteor.Collection)) {
    throw new Error('Join requires Join.Collection');
  }
};

// Return cursor object
Join.prototype.cursor = function() {
  var self = this;
  return self.collection.find({ _id: self._id });
};

/** @method Join.get
  * Returns the joined document
  * Usage:
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
  */
// Return document from the collection
Join.prototype.get = function() {
  return this.collection.findOne({ _id: this._id });
};

/** Create a Meteor collection add it to lookup register
  * @method Join.Collection
  * @constructor
  * @param {string} name Collection name, may not be `null`
  * @param {object} options As in the [Meteor documentation](http://docs.meteor.com/#meteor_collection)
  *
  * > This is just a wrapper, we need a way to lookup collections via
  * > collectionName. If we could do this in plain Meteor we did not have to
  * > have this code..
  */
Join.Collection = function(name, options) {
  var self = this;
  if (name === null) {
    throw new Error('A join collection cannot be null');
  }
  if (name !== null && !_collections[name]) {
    self = new Meteor.Collection(name, options);
    _collections[name] = self;
  } else {
    throw new Error('Join collection "' + name + '" allready found');
  }

/** @method Join.Collection.join
  * @param {id} id Id of document in collection to join
  * Usage:
```js
  var foo = new Join.Collection('foo');
  var bar = new Meteor.Collection('bar');
  var id = foo.insert({ title: 'hello foo'});

  bar.insert({ title: 'hello bar', foo: foo.join(id) });
```
  */
// Add a helper eg.: bar.insert({ foo: foo.join(id) });
  self.join = function(id) {
    return new Join(id, this);
  };
  
  return self;
};


