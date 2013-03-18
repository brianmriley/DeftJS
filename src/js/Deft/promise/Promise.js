// Generated by CoffeeScript 1.6.1
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/*
Promises represent a future value; i.e., a value that may not yet be available.

A Promise's then() method is used to specify onFulfilled and onRejected 
callbacks that will be notified when the future value becomes available. Those 
callbacks can subsequently transform the value that was resolved or the reason 
that was rejected. Each call to then() returns a new Promise of that 
transformed value; i.e., a Promise that is resolved with the callback return 
value or rejected with any error thrown by the callback.
*/

Ext.define('Deft.promise.Promise', {
  alternateClassName: ['Deft.Promise'],
  requires: ['Deft.promise.Resolver'],
  statics: {
    /**
    		* Returns a new {@link Deft.promise.Promise} that:
    		* - resolves immediately for the specified value, or
    		* - resolves or rejects when the specified {@link Deft.promise.Promise} is
    		* resolved or rejected.
    */

    when: function(promiseOrValue) {
      var deferred;
      deferred = Ext.create('Deft.promise.Deferred');
      deferred.resolve(promiseOrValue);
      return deferred.promise;
    },
    /**
    		* Determines whether the specified value is a Promise (including third-party
    		* untrusted Promises), based on the Promises/A specification feature test.
    */

    isPromise: function(value) {
      return (value && Ext.isFunction(value.then)) === true;
    },
    /**
    		* Returns a new {@link Deft.promise.Promise} that will only resolve
    		* once all the specified `promisesOrValues` have resolved.
    		* 
    		* The resolution value will be an Array containing the resolution
    		* value of each of the `promisesOrValues`.
    */

    all: function(promisesOrValues) {
      if (!(Ext.isArray(promisesOrValues) || Deft.Promise.isPromise(promisesOrValues))) {
        throw new Error('Invalid parameter: expected an Array or Promise of an Array.');
      }
      return Deft.Promise.map(promisesOrValues, function(x) {
        return x;
      });
    },
    /**
    		* Initiates a competitive race, returning a new {@link Deft.promise.Promise}
    		* that will resolve when any one of the specified `promisesOrValues`
    		* have resolved, or will reject when all `promisesOrValues` have
    		* rejected or cancelled.
    		* 
    		* The resolution value will the first value of `promisesOrValues` to resolve.
    */

    any: function(promisesOrValues) {
      if (!(Ext.isArray(promisesOrValues) || Deft.Promise.isPromise(promisesOrValues))) {
        throw new Error('Invalid parameter: expected an Array or Promise of an Array.');
      }
      return Deft.Promise.some(promisesOrValues, 1).then(function(array) {
        return array[0];
      }, function(error) {
        if (error.message === 'Too few Promises were resolved.') {
          throw new Error('No Promises were resolved.');
        } else {
          throw error;
        }
      });
    },
    /**
    		* Initiates a competitive race, returning a new {@link Deft.promise.Promise}
    		* that will resolve when `howMany` of the specified `promisesOrValues`
    		* have resolved, or will reject when it becomes impossible for
    		* `howMany` to resolve.
    		* 
    		* The resolution value will be an Array of the first `howMany` values
    		* of `promisesOrValues` to resolve.
    */

    some: function(promisesOrValues, howMany) {
      if (!(Ext.isArray(promisesOrValues) || Deft.Promise.isPromise(promisesOrValues))) {
        throw new Error('Invalid parameter: expected an Array or Promise of an Array.');
      }
      if (!Ext.isNumeric(howMany) || howMany <= 0) {
        throw new Error('Invalid parameter: expected a positive integer.');
      }
      return Deft.Promise.when(promisesOrValues).then(function(promisesOrValues) {
        var complete, deferred, index, onReject, onResolve, promiseOrValue, rejecter, remainingToReject, remainingToResolve, resolver, values, _i, _len;
        values = [];
        remainingToResolve = howMany;
        remainingToReject = (promisesOrValues.length - remainingToResolve) + 1;
        deferred = Ext.create('Deft.promise.Deferred');
        if (promisesOrValues.length < howMany) {
          deferred.reject(new Error('Too few Promises were resolved.'));
        } else {
          resolver = function(value) {
            values.push(value);
            remainingToResolve--;
            if (remainingToResolve === 0) {
              complete();
              deferred.resolve(values);
            }
            return value;
          };
          rejecter = function(error) {
            remainingToReject--;
            if (remainingToReject === 0) {
              complete();
              deferred.reject(new Error('Too few Promises were resolved.'));
            }
            return error;
          };
          complete = function() {
            return resolver = rejecter = Ext.emptyFn;
          };
          onResolve = function(value) {
            return resolver(value);
          };
          onReject = function(value) {
            return rejecter(value);
          };
          for (index = _i = 0, _len = promisesOrValues.length; _i < _len; index = ++_i) {
            promiseOrValue = promisesOrValues[index];
            if (index in promisesOrValues) {
              Deft.Promise.when(promiseOrValue).then(onResolve, onReject);
            }
          }
        }
        return deferred.promise;
      });
    },
    /**
    		* Returns a new {@link Deft.promise.Promise} that will automatically
    		* resolve with the specified Promise or value after the specified
    		* delay (in milliseconds).
    */

    delay: function(promiseOrValue, milliseconds) {
      var deferred;
      deferred = Ext.create('Deft.promise.Deferred');
      setTimeout(function() {
        deferred.resolve(promiseOrValue);
      }, milliseconds);
      return deferred.promise;
    },
    /**
    		* Returns a new {@link Deft.promise.Promise} that will automatically
    		* reject after the specified timeout (in milliseconds) if the specified 
    		* promise has not resolved or rejected.
    */

    timeout: function(promiseOrValue, milliseconds) {
      var cancelTimeout, deferred, timeoutId;
      deferred = Ext.create('Deft.promise.Deferred');
      timeoutId = setTimeout(function() {
        if (timeoutId) {
          return deferred.reject(new Error('Promise timed out.'));
        }
      });
      cancelTimeout = function() {
        clearTimeout(timeoutId);
        return timeoutId = null;
      };
      Deft.Promise.when(promise).then(function(value) {
        cancelTimeout();
        deferred.resolve(value);
      }, function(reason) {
        cancelTimeout();
        deferred.reject(reason);
      });
      return deferred.promise;
    },
    /**
    		* Returns a new function that wraps the specified function and caches
    		* the results for previously processed inputs.
    		* 
    		* Similar to `Deft.util.Function::memoize()`, except it allows for
    		* parameters that are {@link Deft.promise.Promise}s and/or values.
    */

    memoize: function(fn, scope, hashFn) {
      var memoizedFn;
      memoizedFn = Deft.util.Function.memoize(fn, scope, hashFn);
      return function() {
        return Deft.Promise.all(Ext.Array.toArray(arguments)).then(function(values) {
          return memoizedFn.apply(scope, values);
        });
      };
    },
    /**
    		* Traditional map function, similar to `Array.prototype.map()`, that
    		* allows input to contain promises and/or values.
    		* 
    		* The specified map function may return either a value or a promise.
    */

    map: function(promisesOrValues, mapFn) {
      return Deft.Promise.when(promisesOrValues).then(function(promisesOrValues) {
        var deferred, index, promiseOrValue, remainingToResolve, resolve, results, _i, _len;
        remainingToResolve = promisesOrValues.length;
        results = new Array(promisesOrValues.length);
        deferred = Ext.create('Deft.promise.Deferred');
        if (!remainingToResolve) {
          deferred.resolve(results);
        } else {
          resolve = function(item, index) {
            return Deft.Promise.when(item, mapFn).then(function(value) {
              results[index] = value;
              if (!--remainingToResolve) {
                deferred.resolve(results);
              }
              return value;
            }, deferred.reject);
          };
          for (index = _i = 0, _len = promisesOrValues.length; _i < _len; index = ++_i) {
            promiseOrValue = promisesOrValues[index];
            if (index in promisesOrValues) {
              resolve(promisesOrValues[index], index);
            } else {
              remainingToResolve--;
            }
          }
        }
        return deferred.promise;
      });
    },
    /**
    		* Traditional reduce function, similar to `Array.reduce()`, that allows
    		* input to contain promises and/or values.
    */

    reduce: function(promisesOrValues, reduceFn, initialValue) {
      var initialValueSpecified;
      initialValueSpecified = arguments.length === 3;
      return Deft.Promise.when(promisesOrValues).then(function(promisesOrValues) {
        var reduceArguments;
        reduceArguments = [
          function(previousValueOrPromise, currentValueOrPromise, currentIndex) {
            return Deft.Promise.when(previousValueOrPromise).then(function(previousValue) {
              return Deft.Promise.when(currentValueOrPromise).then(function(currentValue) {
                return reduceFn(previousValue, currentValue, currentIndex, promisesOrValues);
              });
            });
          }
        ];
        if (initialValueSpecified) {
          reduceArguments.push(initialValue);
        }
        return Deft.Promise.reduceArray.apply(promisesOrValues, reduceArguments);
      });
    },
    /**
    		* Fallback implementation when Array.reduce is not available.
    		* @private
    */

    reduceArray: function(reduceFn, initialValue) {
      var args, array, index, length, reduced;
      index = 0;
      array = Object(this);
      length = array.length >>> 0;
      args = arguments;
      if (args.length <= 1) {
        while (true) {
          if (index in array) {
            reduced = array[index++];
            break;
          }
          if (++index >= length) {
            throw new TypeError();
          }
        }
      } else {
        reduced = args[1];
      }
      while (index < length) {
        if (index in array) {
          reduced = reduceFn(reduced, array[index], index, array);
        }
        index++;
      }
      return reduced;
    }
  },
  constructor: function(resolver) {
    this.then = function(onFulfilled, onRejected, scope) {
      if (scope != null) {
        onFulfilled = Ext.Function.bind(onFulfilled, scope);
        onRejected = Ext.Function.bind(onRejected, scope);
      }
      return resolver.then(onFulfilled, onRejected);
    };
    this.otherwise = function(onRejected, scope) {
      if (scope != null) {
        onRejected = Ext.Function.bind(onRejected, scope);
      }
      return resolver.then(null, onRejected);
    };
    this.always = function(fn, scope) {
      if (scope != null) {
        fn = Ext.Function.bind(fn, scope);
      }
      return resolver.then(fn, fn);
    };
    return this;
  }
}, function() {
  if (Array.prototype.reduce != null) {
    this.reduceArray = Array.prototype.reduce;
  }
});
