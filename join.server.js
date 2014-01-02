/** Make sure we dont publish or unpublished joins
  * Overview of the `_sessionJoins` structure:
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
  * We use this object to keep track of join publications making sure they are
  * only active if needed. If count gets to 0 the handle is stopped and the
  * publish reference is removed.
  */
_sessionJoins = {};

/** @method _withEachJoin
  * @param {object} obj The object to scan for `Join` instances
  * @param {function} f The callback function
  * The `Join` elements are passed to the callback.
```js
  _withEachJoin(document, function(join) {
    // do something with this join eg. get its cursor
    var cursor = join.cursor();
  });
```
  */
_withEachJoin = function(obj, f) {
  _.each(obj, function(element) {
    if (element instanceof Join) {
      f(element);
    } else {
      if (_.isObject(element)) {
        _withEachJoin(obj, f);
      }
    }
  });
};

/** Publish the cursors and make sure joined data is also published.
  * @method Join.publish Publish data, supports joins
  * @param {string} name Name of the publish
  * @param {function} f The actual publish function, returning cursor(s)
  * Check out the [Meteor documentation](http://docs.meteor.com/#meteor_publish)
  *
  * > Note: From a security view, the joined document will be published if
  * > present in the published cursors. Only Join.Collection's can be "auto" published
  * > this way. We may add a view option for `allow`/`deny` for `Join.Collection`
  */
Join.publish = function(name, f) {
  console.log('----------------Publish: ' + name);
  Meteor.publish(name, function(/* pass on arguments */) {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    // Get the cursor
    var _cursors = f.apply(self, args);
    // If _cursors are empty then quit - the user could be doing a custom
    // publish like this one
    if (typeof _cursors === 'undefined') {
      return;
    }
    // Make sure all cursors are in array
    _cursors = (_.isArray(_cursors))? _cursors: [_cursors];
    // Get the current session
    var sessionId = this._session.id;
    // Make sure the session container exists
    if (typeof _sessionJoins[sessionId] === 'undefined') {
      _sessionJoins[sessionId] = {};
    }
    if (typeof _sessionJoins[sessionId][name] === 'undefined') {
      _sessionJoins[sessionId][name] = {};
    }

    /** Publish joined documents
      * @method _publishJoin Make sure that the join document is published
      * @param {Join} join The join reference to publish
      * @private
      *
      * > This function will check `_sessionJoins` to make sure that the data
      * > is not allready published.
      *
      * > Note: We could add the `view` (allow/deny) check here to make sure
      * > that the data is allowed to be published.
      */
    _publishJoin = function(join) {
      var joinCursor = join.cursor();

      if (typeof _sessionJoins[sessionId][name][join._id] === 'undefined') {
        // Create handle
        _sessionJoins[sessionId][name][join._id] = { count: 0, handle: null };

        var handle = joinCursor.observeChanges({
          added: function(id, fields) {
            console.log('JOIN: ' + sessionId + ' Added: ' + id);
            self.added(join.collectionName, id, fields);
            _sessionJoins[sessionId][name][id].count++;
          },
          changed: function(id, fields) {
            console.log('JOIN: ' + sessionId + ' Changed: ' + id);
            self.changed(join.collectionName, id, fields);
          },
          removed: function(id) {
            console.log('JOIN: ' + sessionId + ' Removed: ' + id);
            // This is a single id publish - so we stop the publish
            _sessionJoins[sessionId][name][join._id].handle.stop();
            // Clean up
            delete _sessionJoins[sessionId][name][join._id];
            self.removed(join.collectionName, id);
          }        
        });

        // Save handle
        _sessionJoins[sessionId][name][join._id].handle = handle;
      } else {
        _sessionJoins[sessionId][name][join._id].count++;
      }


    };


    /** Unpublish joined documents
      * @method _unPublishJoin Unpublish a joined document
      * @param {[Join](#Join)} join The join to unpublish
      *
      * This function will unpublish the joined document - but only if other
      * documents are not requring the data.
      * 
      * > We keep track of join handle usage via `count`
      * > If count is 0 then we stop the handle and clean up memory
      */
    _unPublishJoin = function(join) {
      if (typeof _sessionJoins[sessionId][name][join._id] !== 'undefined') {
        console.log('unpublish ' + join._id + ' from ' + join.collectionName);
        // decrease the usage counter
        _sessionJoins[sessionId][name][join._id].count--;
        if (_sessionJoins[sessionId][name][join._id].count === 0) {
          // Stop the handle, not used any more...
          _sessionJoins[sessionId][name][join._id].handle.stop();
          // Clean up
          delete _sessionJoins[sessionId][name][join._id];
        }
      }
    };

    // This publish should scan the documents and make sure to publish the joined
    // data if found. Should it go deeper than one level?
    _.each(_cursors, function(cursor) {
      var collectionName = cursor._cursorDescription.collectionName;

      // By oberving the document changes we can keep track of joined documents
      // to publish
      var handle = cursor.observe({
        added: function(doc) {
          // Publish joins
          _withEachJoin(doc, function(join) {
            _publishJoin(join);
          });
        },
        changed: function(newDoc, oldDoc) {
          // Add joins and publish whats missing
          _withEachJoin(newDoc, function(join) {
            _publishJoin(join);
          });
          // We remove later, making a clean merge of joins
          _withEachJoin(oldDoc, function(join) {
            _unPublishJoin(join);
          });
        },
        removed: function(oldDoc) {
          // Unpublish joins
          _withEachJoin(oldDoc, function(join) {
            _unPublishJoin(join);
          });
        }

      }); // EO Observe changes

      // Push stop handle
      self.onStop(function() {
        handle.stop();
      });

      // Publish the cursor
      Meteor.Collection._publishCursor(cursor, self, collectionName);

    });

    // Mark as ready
    self.ready();

    // Stop join observers
    self.onStop(function() {
      // Each join for this session and publish is stopped
      _.each(_sessionJoins[sessionId][name], function(publish) {
        publish.handle.stop();
      });
      
      // Garbage collect
      delete _sessionJoins[sessionId][name];
    });

  }); // EO Meteor.publish
}; // EO Join.publish