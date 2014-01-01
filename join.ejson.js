// EJSON custom type
Join.prototype.typeName = function() {
  return 'Join';
};

// EJSON equals type
Join.prototype.equals = function(other) {
  return (other instanceof Join && this._id === other._id && this.collectionName === other.collectionName);
};

// EJSON custom clone
Join.prototype.clone = function() {
  return new Join(this);
};

// EJSON toJSONValue
Join.prototype.toJSONValue = function() {
  return { _id: this._id, collectionName: this.collectionName };
};

// EJSON fromJSONValue
Join.fromJSONValue = function(value) {
  return new Join(value);
};

// Add the custom EJSON type
EJSON.addType('Join', Join.fromJSONValue);