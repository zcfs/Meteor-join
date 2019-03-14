
~~Looking for maintainers - please reach out!~~
This package is to be archived due to inability to find contributors, thanks to everyone who helped make it possible.

**If you're looking for an alternative, we highly recommend [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files) by [VeliovGroup](https://github.com/VeliovGroup)**

---

#Join
This package is built for general usage, but main target is to solve some
features in collectionFS.
Basicly it lets you join documents cross collections. [api](api.md)

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

> We could solve this by implementing a `join` option to `allow`/`deny` rules
> for a `Join.Collection`.

###Contributions
Ideas, contributions, pull request and more are welcome,
[Complete api](internal.api.md)

Kind regards Morten
