// Generated by CoffeeScript 1.6.1
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/*
Resolvers are used internally by Deferreds and Promises to capture and notify
 callbacks, process callback return values and propogate resolution or 
rejection to chained Resolvers.

Developers never directly interact with a Resolver.

A Resolver captures a pair of optional onResolved and onRejected callbacks and 
has an associated Promise. That Promise delegates its then() calls to the 
Resolver's then() method, which creates a new Resolver and schedules its 
delayed addition as a chained Resolver.

Each Deferred has an associated Resolver. A Deferred delegates resolve() and 
reject() calls to that Resolver's resolve() and reject() methods. The Resolver 
processes the resolution value and rejection reason, and propogates the 
processed resolution value or rejection reason to any chained Resolvers it may 
have created in response to then() calls. Once a chained Resolver has been 
notified, it is cleared out of the set of chained Resolvers and will not be 
notified again.
@private
*/

Ext.define('Deft.promise.Resolver', {
  alternateClassName: ['Deft.Resolver'],
  constructor: function(onResolved, onRejected) {
    var complete, completeRejected, completeResolved, completed, completionAction, completionValue, nextTick, pendingResolvers, process, processed, propagate, schedule;
    this.promise = Ext.create('Deft.promise.Promise', this);
    pendingResolvers = [];
    processed = false;
    completed = false;
    completionValue = null;
    completionAction = null;
    nextTick = typeof setImmediate !== "undefined" && setImmediate !== null ? setImmediate : function(task) {
      return setTimeout(task, 0);
    };
    if (!Ext.isFunction(onRejected)) {
      onRejected = function(error) {
        throw error;
      };
    }
    propagate = function() {
      var pendingResolver, _i, _len;
      for (_i = 0, _len = pendingResolvers.length; _i < _len; _i++) {
        pendingResolver = pendingResolvers[_i];
        pendingResolver[completionAction](completionValue);
      }
      pendingResolvers = [];
    };
    schedule = function(pendingResolver) {
      pendingResolvers.push(pendingResolver);
      if (completed) {
        propagate();
      }
    };
    complete = function(action, value) {
      onResolved = onRejected = null;
      completionAction = action;
      completionValue = value;
      completed = true;
      propagate();
    };
    completeResolved = function(result) {
      complete('resolve', result);
    };
    completeRejected = function(reason) {
      complete('reject', reason);
    };
    process = function(callback, value) {
      processed = true;
      try {
        if (Ext.isFunction(callback)) {
          value = callback(value);
        }
        if (value && Ext.isFunction(value.then)) {
          value.then(completeResolved, completeRejected);
        } else {
          completeResolved(value);
        }
      } catch (error) {
        completeRejected(error);
      }
    };
    this.resolve = function(result) {
      if (!processed) {
        process(onResolved, result);
      }
    };
    this.reject = function(error) {
      if (!processed) {
        process(onRejected, error);
      }
    };
    this.then = function(onResolved, onRejected) {
      var pendingResolver;
      if (Ext.isFunction(onResolved) || Ext.isFunction(onRejected)) {
        pendingResolver = Ext.create('Deft.promise.Resolver', onResolved, onRejected);
        nextTick(function() {
          return schedule(pendingResolver);
        });
        return pendingResolver.promise;
      }
      return this.promise;
    };
    return this;
  }
});
