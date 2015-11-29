'use strict';

describe('webcastApp.version module', function() {
  beforeEach(module('webcastApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
