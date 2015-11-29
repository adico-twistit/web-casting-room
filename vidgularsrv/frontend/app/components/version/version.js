'use strict';

angular.module('webcastApp.version', [
  'webcastApp.version.interpolate-filter',
  'webcastApp.version.version-directive'
])

.value('version', '0.1');
