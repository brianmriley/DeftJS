// Generated by CoffeeScript 1.6.1
/*
Copyright (c) 2013 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

describe('Deft.promise.Promise', function() {
  var formatValue;
  formatValue = function(value) {
    var formattedValues;
    if (value instanceof Deft.promise.Promise) {
      return 'Deft.Promise';
    }
    if (value instanceof Deft.promise.Deferred) {
      return 'Deft.Deferred';
    }
    if (value instanceof Ext.ClassManager.get('Ext.Base')) {
      return Ext.ClassManager.getName(value);
    }
    if (Ext.isArray(value)) {
      formattedValues = Ext.Array.map(value, formatValue);
      return "[" + (formattedValues.join(', ')) + "]";
    }
    if (Ext.isObject(value)) {
      return 'Object';
    }
    if (Ext.isString(value)) {
      return "\"" + value + "\"";
    }
    return '' + value;
  };
  chai.use(function(chai, utils) {
    Assertion.addMethod('memberOf', function(array) {
      var value;
      value = utils.flag(this, 'object');
      this.assert(Ext.Array.contains(array, value), 'expected #{this} to be a member of ' + utils.inspect(array), 'expected #{this} to not be a member of ' + +utils.inspect(array));
    });
    Assertion.addMethod('membersOf', function(array) {
      var values;
      values = utils.flag(this, 'object');
      expect(values).to.be.an.Array;
      this.assert(Ext.Array.filter(values, function(value) {
        return !Ext.Array.contains(array, value);
      }).length === 0, 'expected #{this} to be members of ' + utils.inspect(array), 'expected #{this} to not be members of ' + +utils.inspect(array));
    });
    Assertion.addProperty('unique', function() {
      var values;
      values = utils.flag(this, 'object');
      expect(values).to.be.an.instanceOf(Array);
      this.assert(Ext.Array.unique(values).length === values.length, 'expected #{this} to be comprised of unique values', 'expected #{this} not to be comprised of unique values');
    });
  });
  describe('Custom Assertions', function() {
    specify('memberOf', function() {
      expect(1).to.be.memberOf([1, 2, 3]);
      expect(0).not.to.be.memberOf([1, 2, 3]);
    });
    specify('membersOf', function() {
      expect([1]).to.be.membersOf([1, 2, 3]);
      expect([1, 2]).to.be.membersOf([1, 2, 3]);
      expect([0]).not.to.be.membersOf([1, 2, 3]);
      expect([0, 5]).not.to.be.membersOf([1, 2, 3]);
    });
    specify('unique', function() {
      expect([1, 2, 3]).to.be.unique;
      expect([1, 2, 1]).not.to.be.unique;
    });
  });
  describe('when()', function() {
    var values;
    values = [void 0, null, false, 0, 1, 'expected value', [1, 2, 3], {}, new Error('error message')];
    describe('returns a Promise that eventually resolves with the specified value', function() {
      var value, _fn, _i, _len;
      _fn = function(value) {
        return specify(formatValue(value), function() {
          var promise;
          promise = Deft.Promise.when(value);
          promise.should.be.an["instanceof"](Deft.Promise);
          return promise.should.eventually.equal(value);
        });
      };
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        _fn(value);
      }
    });
    describe('returns a Promise that eventually resolves when the specified Promise is resolved', function() {
      var value, _fn, _i, _len;
      _fn = function(value) {
        return specify(formatValue(value), function() {
          var deferred, promise;
          deferred = Ext.create('Deft.Deferred');
          deferred.resolve(value);
          promise = Deft.Promise.when(deferred.promise);
          promise.should.not.be.equal(deferred.promise);
          promise.should.be.an["instanceof"](Deft.Promise);
          return promise.should.eventually.equal(value);
        });
      };
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        _fn(value);
      }
    });
    describe('returns a Promise that eventually rejects when the specified Promise is rejected', function() {
      specify('Error: error message', function() {
        var deferred, promise;
        deferred = Ext.create('Deft.Deferred');
        deferred.reject(new Error('error message'));
        promise = Deft.Promise.when(deferred.promise);
        promise.should.not.be.equal(deferred.promise);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
    describe('returns a new Promise that adapts the specified untrusted (aka third-party) then-able', function() {
      var MockThirdPartyPromise;
      MockThirdPartyPromise = (function() {

        function MockThirdPartyPromise() {}

        MockThirdPartyPromise.prototype.then = function(successCallback, failureCallback) {
          this.successCallback = successCallback;
          this.failureCallback = failureCallback;
          switch (this.state) {
            case 'resolved':
              this.successCallback(this.value);
              break;
            case 'rejected':
              this.failureCallback(this.value);
          }
        };

        MockThirdPartyPromise.prototype.resolve = function(value) {
          this.value = value;
          this.state = 'resolved';
          if (this.successCallback != null) {
            this.successCallback(this.value);
          }
        };

        MockThirdPartyPromise.prototype.reject = function(value) {
          this.value = value;
          this.state = 'rejected';
          if (this.failureCallback != null) {
            this.failureCallback(this.value);
          }
        };

        return MockThirdPartyPromise;

      })();
      specify('resolves when resolved', function() {
        var mockThirdPartyPromise, promise;
        mockThirdPartyPromise = new MockThirdPartyPromise();
        mockThirdPartyPromise.resolve('expected value');
        promise = Deft.Promise.when(mockThirdPartyPromise);
        promise.should.not.be.equal(mockThirdPartyPromise);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('rejects when rejected', function() {
        var mockThirdPartyPromise, promise;
        mockThirdPartyPromise = new MockThirdPartyPromise();
        mockThirdPartyPromise.resolve('expected value');
        promise = Deft.Promise.when(mockThirdPartyPromise);
        promise.should.not.be.equal(mockThirdPartyPromise);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
    });
  });
  describe('isPromise()', function() {
    describe('returns true for a Deft.Promise', function() {
      specify('Deft.Promise', function() {
        var promise;
        promise = Ext.create('Deft.Deferred').promise;
        expect(Deft.Promise.isPromise(promise)).to.be["true"];
      });
      specify('returns true for any then()-able', function() {
        var promise;
        promise = {
          then: function() {}
        };
        expect(Deft.Promise.isPromise(promise)).to.be["true"];
      });
    });
    return describe('returns false for non-promises', function() {
      var value, values, _fn, _i, _len;
      values = [void 0, null, false, 0, 1, 'value', [1, 2, 3], {}, new Error('error message')];
      _fn = function(value) {
        return specify(formatValue(value), function() {
          expect(Deft.Promise.isPromise(value)).to.be["false"];
        });
      };
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        _fn(value);
      }
    });
  });
  describe('all()', function() {
    describe('returns a new Promise that resolves with the resolved values for the specified Array of Promises(s) or values.', function() {
      specify('Empty Array', function() {
        var promise;
        promise = Deft.Promise.all([]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([]);
      });
      specify('Array with one value', function() {
        var promise;
        promise = Deft.Promise.all(['expected value']);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Array of values', function() {
        var promise;
        promise = Deft.Promise.all([1, 2, 3]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([1, 2, 3]);
      });
      specify('Sparse Array', function() {
        var promise;
        promise = Deft.Promise.all([,2,,4,5]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([,2,,4,5]);
      });
      specify('Array with one resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.all([Deft.Deferred.resolve('expected value')]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Array of resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.all([Deft.Deferred.resolve(1), Deft.Deferred.resolve(2), Deft.Deferred.resolve(3)]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([1, 2, 3]);
      });
    });
    describe('returns a new Promise that resolves with the resolved values for the specified resolved Promise of an Array of Promises(s) or values.', function() {
      specify('Promise of an empty Array', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([]);
      });
      specify('Promise of an Array with one value', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve(['expected value']));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Promise of an Array of values', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([1, 2, 3]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([1, 2, 3]);
      });
      specify('Promise of a sparse Array', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([,2,,4,5]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([,2,,4,5]);
      });
      specify('Promise of an Array with one resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([Deft.Deferred.resolve('expected value')]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Promise of an Array of resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([Deft.Deferred.resolve(1), Deft.Deferred.resolve(2), Deft.Deferred.resolve(3)]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal([1, 2, 3]);
      });
    });
    describe('returns a new Promise that rejects with the error associated with the first Promise in the specified Array of Promise(s) or values that rejects', function() {
      specify('Array with one rejected Promise', function() {
        var promise;
        promise = Deft.Promise.all([Deft.Deferred.reject(new Error('error message'))]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
      specify('Array of resolved Promises and a rejected Promise', function() {
        var promise;
        promise = Deft.Promise.all([Deft.Deferred.resolve(1), Deft.Deferred.reject(new Error('error message')), Deft.Deferred.resolve(3)]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
      specify('Array of values, resolved Promises and a rejected Promise', function() {
        var promise;
        promise = Deft.Promise.all([1, Deft.Deferred.reject(new Error('error message')), Deft.Deferred.resolve(3)]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
    describe('returns a new Promise that rejects with the error associated with the first Promise in the specified resolved Promise of an Array of Promise(s) or values that rejects', function() {
      specify('Promise of an Array with one rejected Promise', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([Deft.Deferred.reject(new Error('error message'))]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
      specify('Promise of an Array of resolved Promises and a rejected Promise', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([Deft.Deferred.resolve(1), Deft.Deferred.reject(new Error('error message')), Deft.Deferred.resolve(3)]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
      specify('Promise of an Array of values, resolved Promises and a rejected Promise', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.resolve([1, Deft.Deferred.reject(new Error('error message')), Deft.Deferred.resolve(3)]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
    describe('returns a new Promise that rejects with the error associated with the rejected Promise of an Array of Promise(s) or values', function() {
      specify('Error: error message', function() {
        var promise;
        promise = Deft.Promise.all(Deft.Deferred.reject(new Error('error message')));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
    describe('throws an Error if anything other than Array or Promise of an Array is specified', function() {
      specify('no parameters', function() {
        expect(function() {
          return Deft.Promise.all();
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('a single non-Array parameter', function() {
        expect(function() {
          return Deft.Promise.all(1);
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('multiple non-Array parameters', function() {
        expect(function() {
          return Deft.Promise.all(1, 2, 3);
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
    });
  });
  describe('any()', function() {
    describe('returns a new Promise that will resolve once any one of the specified Array of Promises(s) or values have resolved.', function() {
      specify('Array with one value', function() {
        var promise;
        promise = Deft.Promise.any(['expected value']);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Array of values', function() {
        var promise;
        promise = Deft.Promise.any([1, 2, 3]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([1, 2, 3]);
      });
      specify('Sparse Array', function() {
        var promise;
        promise = Deft.Promise.any([,2,,4,5]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([2, 4, 5]);
      });
      specify('Array with one resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.any([Deft.Deferred.resolve('expected value')]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Array of resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.any([Deft.Deferred.resolve(1), Deft.Deferred.resolve(2), Deft.Deferred.resolve(3)]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([1, 2, 3]);
      });
      specify('Array of rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.any([Deft.Deferred.reject('error message'), Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Array of pending and rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.any([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Array of pending and rejected Promise(s) and multiple resolved Promises', function() {
        var promise;
        promise = Deft.Promise.any([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve(1), Deft.Deferred.reject('error message'), Deft.Deferred.resolve(2)]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([1, 2]);
      });
    });
    describe('returns a new Promise that will resolve once any one of the specified resolved Promise of an Array of Promises(s) or values have resolved.', function() {
      specify('Promise of an Array with one value', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve(['expected value']));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Promise of an Array of values', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([1, 2, 3]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([1, 2, 3]);
      });
      specify('Promise of a sparse Array', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([,2,,4,5]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([2, 4, 5]);
      });
      specify('Promise of an Array with one resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([Deft.Deferred.resolve('expected value')]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Promise of an Array of resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([Deft.Deferred.resolve(1), Deft.Deferred.resolve(2), Deft.Deferred.resolve(3)]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.to.be.a.memberOf([1, 2, 3]);
      });
      specify('Promise of an Array of rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([Deft.Deferred.reject('error message'), Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Promise of an Array of pending and rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('Promise of an Array of pending and rejected Promise(s) and multiple resolved Promises', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.resolve([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve(1), Deft.Deferred.reject('error message'), Deft.Deferred.resolve(2)]));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.be.a.memberOf([1, 2]);
      });
    });
    describe('returns a new Promise that will reject if none of the specified Array of Promises(s) or values resolves.', function() {
      specify('Empty Array', function() {
        var promise;
        promise = Deft.Promise.any([]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'No Promises were resolved.');
      });
      specify('Array with one rejected Promise(s)', function() {
        var promise;
        promise = Deft.Promise.any([Deft.Deferred.reject('error message')]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'No Promises were resolved.');
      });
      specify('Array of rejected Promise(s)', function() {
        var promise;
        promise = Deft.Promise.any([Deft.Deferred.reject('error message'), Deft.Deferred.reject('error message'), Deft.Deferred.reject('error message')]);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'No Promises were resolved.');
      });
    });
    describe('returns a new Promise that rejects with the error associated with the rejected Promise of an Array of Promise(s) or values', function() {
      specify('Error: error message', function() {
        var promise;
        promise = Deft.Promise.any(Deft.Deferred.reject(new Error('error message')));
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
    return describe('throws an Error if anything other than Array or Promise of an Array is specified', function() {
      specify('no parameters', function() {
        expect(function() {
          return Deft.Promise.any();
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('a single non-Array parameter', function() {
        expect(function() {
          return Deft.Promise.any(1);
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('multiple non-Array parameters', function() {
        expect(function() {
          return Deft.Promise.any(1, 2, 3);
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
    });
  });
  describe('some()', function() {
    describe('returns a new Promise that will resolve once the specified number of the specified Array of Promises(s) or values have resolved.', function() {
      specify('Array with one value', function() {
        var promise;
        promise = Deft.Promise.some(['expected value'], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Array of values', function() {
        var promise;
        promise = Deft.Promise.some([1, 2, 3], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2, 3]);
      });
      specify('Sparse Array', function() {
        var promise;
        promise = Deft.Promise.some([,2,,4,5], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([2, 4, 5]);
      });
      specify('Array with one resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.resolve('expected value')], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Array of resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.resolve(1), Deft.Deferred.resolve(2), Deft.Deferred.resolve(3)], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2, 3]);
      });
      specify('Array of rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.reject('error message'), Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Array of pending and rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.some([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Array of rejected Promise(s) and multiple resolved Promises', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.reject('error message'), Deft.Deferred.resolve(1), Deft.Deferred.reject('error message'), Deft.Deferred.resolve(2)], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2]);
      });
      specify('Array of pending and rejected Promise(s) and multiple resolved Promises', function() {
        var promise;
        promise = Deft.Promise.some([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve(1), Deft.Deferred.reject('error message'), Deft.Deferred.resolve(2)], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2]);
      });
    });
    describe('returns a new Promise that will resolve once the specified number of the specified resolved Promise of an Array of Promises(s) or values have resolved.', function() {
      specify('Promise of an Array with one value', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when(['expected value']), 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Promise of an Array of values', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([1, 2, 3]), 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2, 3]);
      });
      specify('Promise of a sparse Array', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([,2,,4,5]), 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([2, 4, 5]);
      });
      specify('Promise of an Array with one resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([Deft.Deferred.resolve('expected value')]), 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Promise of an Array of resolved Promise(s)', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([Deft.Deferred.resolve(1), Deft.Deferred.resolve(2), Deft.Deferred.resolve(3)]), 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2, 3]);
      });
      specify('Promise of an Array of rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([Deft.Deferred.reject('error message'), Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')]), 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Promise of an Array of pending and rejected Promise(s) and one resolved Promise', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve('expected value'), Deft.Deferred.reject('error message')]), 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.deep.equal(['expected value']);
      });
      specify('Promise of an Array of rejected Promise(s) and multiple resolved Promises', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([Deft.Deferred.reject('error message'), Deft.Deferred.resolve(1), Deft.Deferred.reject('error message'), Deft.Deferred.resolve(2)]), 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2]);
      });
      specify('Promise of an Array of pending and rejected Promise(s) and multiple resolved Promises', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Promise.when([Ext.create('Deft.Deferred').promise, Deft.Deferred.resolve(1), Deft.Deferred.reject('error message'), Deft.Deferred.resolve(2)]), 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.have.a.lengthOf(2).and.be.membersOf([1, 2]);
      });
    });
    describe('returns a new Promise that will reject if too few of the specified Array of Promises(s) or values resolves.', function() {
      specify('Empty Array with one resolved value requested', function() {
        var promise;
        promise = Deft.Promise.some([], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'Too few Promises were resolved.');
      });
      specify('Empty Array with multiple resolved values requested', function() {
        var promise;
        promise = Deft.Promise.some([], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'Too few Promises were resolved.');
      });
      specify('Array with one rejected Promise(s) with one resolved value requested', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.reject('error message')], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'Too few Promises were resolved.');
      });
      specify('Array with one rejected Promise(s) with multiple resolved values requested', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.reject('error message')], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'Too few Promises were resolved.');
      });
      specify('Array of rejected Promise(s) with one resolved value requested', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.reject('error message'), Deft.Deferred.reject('error message'), Deft.Deferred.reject('error message')], 1);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'Too few Promises were resolved.');
      });
      specify('Array of rejected Promise(s) with multiple resolved values requested', function() {
        var promise;
        promise = Deft.Promise.some([Deft.Deferred.reject('error message'), Deft.Deferred.reject('error message'), Deft.Deferred.reject('error message')], 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'Too few Promises were resolved.');
      });
    });
    describe('returns a new Promise that rejects with the error associated with the rejected Promise of an Array of Promise(s) or values', function() {
      specify('Error: error message', function() {
        var promise;
        promise = Deft.Promise.some(Deft.Deferred.reject(new Error('error message')), 2);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
    return describe('throws an Error if anything other than Array or Promise of an Array is specified', function() {
      specify('no parameters', function() {
        expect(function() {
          return Deft.Promise.some();
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('a single non-Array parameter', function() {
        expect(function() {
          return Deft.Promise.some(1);
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('multiple non-Array parameters', function() {
        expect(function() {
          return Deft.Promise.some(1, 2, 3);
        }).to["throw"](Error, 'Invalid parameter: expected an Array or Promise of an Array.');
      });
      specify('a single Array parameter', function() {
        expect(function() {
          return Deft.Promise.some([1, 2, 3]);
        }).to["throw"](Error, 'Invalid parameter: expected a positive integer.');
      });
      specify('a single Array parameter and a non-numeric value', function() {
        expect(function() {
          return Deft.Promise.some([1, 2, 3], 'value');
        }).to["throw"](Error, 'Invalid parameter: expected a positive integer.');
      });
    });
  });
  describe('delay()', function() {
    var now;
    now = function() {
      return new Date().getTime();
    };
    describe('should return a new Promise that resolves after the specified delay', function() {
      specify('0 ms delay', function() {
        var promise;
        promise = Deft.Promise.delay(0);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal(void 0);
      });
      specify('value with 100 ms delay', function() {
        var promise, start;
        this.slow(250);
        promise = Deft.Promise.delay(100);
        start = now();
        promise.should.be.an["instanceof"](Deft.Promise);
        promise = promise.then(function(value) {
          expect(now() - start).to.be.closeTo(100, 10);
          return value;
        });
        return promise.should.eventually.equal(void 0);
      });
    });
    describe('should return a new Promise that resolves with the specified Promise or value after the specified delay', function() {
      specify('value with 0 ms delay', function() {
        var promise;
        promise = Deft.Promise.delay('expected value', 0);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('resolved Promise with 0 delay', function() {
        var promise;
        promise = Deft.Promise.delay(Deft.Deferred.resolve('expected value'), 0);
        promise.should.be.an["instanceof"](Deft.Promise);
        return promise.should.eventually.equal('expected value');
      });
      specify('value with 100 ms delay', function() {
        var promise, start;
        this.slow(250);
        promise = Deft.Promise.delay('expected value', 100);
        start = now();
        promise.should.be.an["instanceof"](Deft.Promise);
        promise = promise.then(function(value) {
          expect(now() - start).to.be.closeTo(100, 10);
          return value;
        });
        return promise.should.eventually.equal('expected value');
      });
      specify('resolved Promise with 100 ms delay', function() {
        var promise, start;
        this.slow(250);
        promise = Deft.Promise.delay(Deft.Deferred.resolve('expected value'), 100);
        start = now();
        promise.should.be.an["instanceof"](Deft.Promise);
        promise = promise.then(function(value) {
          expect(now() - start).to.be.closeTo(100, 10);
          return value;
        });
        return promise.should.eventually.equal('expected value');
      });
      specify('rejected Promise with 100 ms delay', function() {
        var promise, start;
        this.slow(250);
        promise = Deft.Promise.delay(Deft.Deferred.reject(new Error('error message')), 100);
        start = now();
        promise.should.be.an["instanceof"](Deft.Promise);
        promise = promise.then(function(value) {
          return value;
        }, function(error) {
          expect(now() - start).to.be.closeTo(100, 10);
          throw error;
        });
        return promise.should.be.rejected["with"](Error, 'error message');
      });
    });
  });
  describe('timeout()', function() {});
  describe('memoize()', function() {});
  describe('map()', function() {});
  return describe('reduce()', function() {});
});
