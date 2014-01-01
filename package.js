Package.describe({
    summary: 'Join documents cross collections'
});

Package.on_use(function(api) {
  'use strict';
  api.use(['ejson'], ['client', 'server']);

  api.export && api.export('Join');

  api.add_files('join.common.js', ['client', 'server']);
  api.add_files('join.server.js', 'server');
  api.add_files('join.client.js', 'client');
  api.add_files('join.ejson.js', ['client', 'server']);

});

Package.on_test(function (api) {
  api.use('join', ['client', 'server']);
  api.use('test-helpers', 'server');
  api.use(['tinytest', 'underscore', 'ejson', 'ordered-dict',
           'random', 'deps']);

  api.add_files('join.tests.client.js', 'client');
  api.add_files('join.tests.server.js', 'server');
});
