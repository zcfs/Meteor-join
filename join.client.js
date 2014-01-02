/** Wrapper for `Meteor.subscribe` - Mostly for API consistency
  * @method Join.subscribe
  * @param {string} name Name of subscription
  * @param {any} [arg1,arg2-argn] Data to pass on to the publish
  * @param {function|object} [callback] `{onError, onReady}` or `onReady` callback
  * @where {client}
  * For more info checkout the [Meteor documentation](http://docs.meteor.com/#meteor_subscribe)
  */
// Wrapper for Meteor collection
Join.subscribe = function(/* name [, arg1 .. argn] [, callback] */) {
  var args = Array.prototype.slice.call(arguments);
  return Meteor.subscribe.apply(this, args);
};