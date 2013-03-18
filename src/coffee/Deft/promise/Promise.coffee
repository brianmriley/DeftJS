###
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
###

###
Promises represent a future value; i.e., a value that may not yet be available.

A Promise's then() method is used to specify onFulfilled and onRejected 
callbacks that will be notified when the future value becomes available. Those 
callbacks can subsequently transform the value that was resolved or the reason 
that was rejected. Each call to then() returns a new Promise of that 
transformed value; i.e., a Promise that is resolved with the callback return 
value or rejected with any error thrown by the callback.
###
Ext.define( 'Deft.promise.Promise',
	alternateClassName: [ 'Deft.Promise' ]
	requires: [ 'Deft.promise.Resolver' ]
	
	statics:
		###*
		* Returns a new {@link Deft.promise.Promise} that:
		* - resolves immediately for the specified value, or
		* - resolves or rejects when the specified {@link Deft.promise.Promise} is
		* resolved or rejected.
		###
		when: ( promiseOrValue ) ->
			deferred = Ext.create( 'Deft.promise.Deferred' )
			deferred.resolve( promiseOrValue )
			return deferred.promise
		
		###*
		* Determines whether the specified value is a Promise (including third-party
		* untrusted Promises), based on the Promises/A specification feature test.
		###
		isPromise: ( value ) ->
			return ( value and Ext.isFunction( value.then ) ) is true
		
		###*
		* Returns a new {@link Deft.promise.Promise} that will only resolve
		* once all the specified `promisesOrValues` have resolved.
		* 
		* The resolution value will be an Array containing the resolution
		* value of each of the `promisesOrValues`.
		###
		all: ( promisesOrValues ) ->
			if not ( Ext.isArray( promisesOrValues ) or Deft.Promise.isPromise( promisesOrValues ) )
				throw new Error( 'Invalid parameter: expected an Array or Promise of an Array.' )
			return Deft.Promise.map( promisesOrValues, ( x ) -> x )
		
		###*
		* Initiates a competitive race, returning a new {@link Deft.promise.Promise}
		* that will resolve when any one of the specified `promisesOrValues`
		* have resolved, or will reject when all `promisesOrValues` have
		* rejected or cancelled.
		* 
		* The resolution value will the first value of `promisesOrValues` to resolve.
		###
		any: ( promisesOrValues ) ->
			if not ( Ext.isArray( promisesOrValues ) or Deft.Promise.isPromise( promisesOrValues ) )
				throw new Error( 'Invalid parameter: expected an Array or Promise of an Array.' )
			return Deft.Promise.some( promisesOrValues, 1 )
				.then( 
					( array ) -> 
						return array[ 0 ]
					( error ) ->
						if error.message is 'Too few Promises were resolved.'
							throw new Error( 'No Promises were resolved.' )
						else
							throw error
				)
		
		###*
		* Initiates a competitive race, returning a new {@link Deft.promise.Promise}
		* that will resolve when `howMany` of the specified `promisesOrValues`
		* have resolved, or will reject when it becomes impossible for
		* `howMany` to resolve.
		* 
		* The resolution value will be an Array of the first `howMany` values
		* of `promisesOrValues` to resolve.
		###
		some: ( promisesOrValues, howMany ) ->
			if not ( Ext.isArray( promisesOrValues ) or Deft.Promise.isPromise( promisesOrValues ) )
				throw new Error( 'Invalid parameter: expected an Array or Promise of an Array.' )
			if not Ext.isNumeric( howMany ) or howMany <= 0
				throw new Error( 'Invalid parameter: expected a positive integer.' )
			return Deft.Promise.when( promisesOrValues ).then(
				( promisesOrValues ) ->
					values = []
					remainingToResolve = howMany
					remainingToReject = ( promisesOrValues.length - remainingToResolve ) + 1
					
					deferred = Ext.create( 'Deft.promise.Deferred' )
					
					if promisesOrValues.length < howMany
						deferred.reject( new Error( 'Too few Promises were resolved.' ) )
					else
						
						resolver = ( value ) ->
							values.push( value )
							remainingToResolve--
							if remainingToResolve is 0
								complete()
								deferred.resolve( values )
							return value
						rejecter = ( error ) ->
							remainingToReject--
							if remainingToReject is 0
								complete()
								deferred.reject( new Error( 'Too few Promises were resolved.' ) )
							return error
						
						complete = ->
							resolver = rejecter = Ext.emptyFn
						
						onResolve = ( value ) -> resolver( value )
						onReject = ( value ) -> rejecter( value )
						
						for promiseOrValue, index in promisesOrValues
							if index of promisesOrValues
								Deft.Promise.when( promiseOrValue ).then( onResolve, onReject )
					
					return deferred.promise
			)
		
		###*
		* Returns a new {@link Deft.promise.Promise} that will automatically
		* resolve with the specified Promise or value after the specified
		* delay (in milliseconds).
		###
		delay: ( promiseOrValue, milliseconds ) ->
			if arguments.length is 1
				milliseconds = promiseOrValue
				promiseOrValue = undefined
			milliseconds = Math.max( milliseconds, 0 )
			
			deferred = Ext.create( 'Deft.promise.Deferred' )
			setTimeout( 
				->
					deferred.resolve( promiseOrValue )
					return
				milliseconds
			)
			return deferred.promise
		
		###*
		* Returns a new {@link Deft.promise.Promise} that will automatically
		* reject after the specified timeout (in milliseconds) if the specified 
		* promise has not resolved or rejected.
		###
		timeout: ( promiseOrValue, milliseconds ) ->
			deferred = Ext.create( 'Deft.promise.Deferred' )
			timeoutId = setTimeout( ->
				if timeoutId
					deferred.reject( new Error( 'Promise timed out.' ) )
			)
			
			cancelTimeout = ->
				clearTimeout( timeoutId )
				timeoutId = null
			
			Deft.Promise.when( promise ).then(
				( value ) ->
					cancelTimeout()
					deferred.resolve( value )
					return
				( reason ) ->
					cancelTimeout()
					deferred.reject( reason )
					return
			)
			
			return deferred.promise
		
		###*
		* Returns a new function that wraps the specified function and caches
		* the results for previously processed inputs.
		* 
		* Similar to `Deft.util.Function::memoize()`, except it allows for
		* parameters that are {@link Deft.promise.Promise}s and/or values.
		###
		memoize: ( fn, scope, hashFn ) ->
			memoizedFn = Deft.util.Function.memoize( fn, scope, hashFn )
			return ->
				return Deft.Promise.all( Ext.Array.toArray( arguments ) ).then( ( values ) ->
					return memoizedFn.apply( scope, values )
				)
		
		###*
		* Traditional map function, similar to `Array.prototype.map()`, that
		* allows input to contain promises and/or values.
		* 
		* The specified map function may return either a value or a promise.
		###
		map: ( promisesOrValues, mapFn ) ->
			return Deft.Promise.when( promisesOrValues ).then(
				( promisesOrValues ) ->
					remainingToResolve = promisesOrValues.length
					results = new Array( promisesOrValues.length )
					
					deferred = Ext.create( 'Deft.promise.Deferred' )
					
					if not remainingToResolve
						deferred.resolve( results )
					else
						resolve = ( item, index ) ->
							Deft.Promise.when( item, mapFn ).then(
								( value ) ->
									results[ index ] = value
									if not --remainingToResolve
										deferred.resolve( results )
									return value
								deferred.reject
							)
						
						for promiseOrValue, index in promisesOrValues
							if index of promisesOrValues
								resolve( promisesOrValues[ index ], index )
							else
								remainingToResolve--
					
					return deferred.promise
			)
		
		###*
		* Traditional reduce function, similar to `Array.reduce()`, that allows
		* input to contain promises and/or values.
		###
		reduce: ( promisesOrValues, reduceFn, initialValue ) ->
			initialValueSpecified = arguments.length is 3
			return Deft.Promise.when( promisesOrValues ).then( 
				( promisesOrValues ) ->
					# Wrap the reduce function with one that handles promises and then delegates to it.
					reduceArguments = [
						( previousValueOrPromise, currentValueOrPromise, currentIndex ) ->
							return Deft.Promise.when( previousValueOrPromise ).then( ( previousValue ) ->
								return Deft.Promise.when( currentValueOrPromise ).then( ( currentValue ) ->
										return reduceFn( previousValue, currentValue, currentIndex, promisesOrValues )
								)
							)
					]
					
					if initialValueSpecified
						reduceArguments.push( initialValue )
					
					return Deft.Promise.reduceArray.apply( promisesOrValues, reduceArguments )
			)
		
		###*
		* Fallback implementation when Array.reduce is not available.
		* @private
		###
		reduceArray: ( reduceFn, initialValue ) ->
			# ES5 reduce implementation if native not available
			# See: http://es5.github.com/#x15.4.4.21 as there are many specifics and edge cases.
			# ES5 dictates that reduce.length === 1
			# This implementation deviates from ES5 spec in the following ways:
			# 1. It does not check if reduceFunc is a Callable
			index = 0
			array = Object( @ )
			length = array.length >>> 0
			args = arguments
			
			# If no initialValue, use first item of array (we know length !== 0 here) and adjust index to start at second item
			if args.length <= 1
				# Skip to the first real element in the array
				loop
					if index of array
						reduced = array[ index++ ]
						break
					# If we reached the end of the array without finding any real elements, it's a TypeError
					if ++index >= length
						throw new TypeError()
			else
				# If initialValue provided, use it
				reduced = args[ 1 ]
			
			# Do the actual reduce
			while index < length
				# Skip holes
				if index of array
					reduced = reduceFn( reduced, array[ index ], index, array )
				index++
			
			return reduced
	
	constructor: ( resolver ) ->
		@then = ( onFulfilled, onRejected, scope ) ->
			if scope?
				onFulfilled = Ext.Function.bind( onFulfilled, scope )
				onRejected = Ext.Function.bind( onRejected, scope )
			return resolver.then( onFulfilled, onRejected )
		
		@otherwise = ( onRejected, scope ) ->
			if scope?
				onRejected = Ext.Function.bind( onRejected, scope )
			return resolver.then( null, onRejected )
		
		@always = ( fn, scope ) ->
			if scope?
				fn = Ext.Function.bind( fn, scope )
			return resolver.then( fn, fn )
		
		return @
,
	->
		# Use native reduce implementation, if available.
		if Array::reduce?
			@reduceArray = Array::reduce
		return
)