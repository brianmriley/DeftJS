###
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
###

###
A Deferred is typically used within the body of a function that performs an 
asynchronous operation. When that operation succeeds, the Deferred should be 
resolved; if that operation fails, the Deferred should be rejected.

Once a Deferred has been resolved or rejected, it is considered to be complete 
and subsequent calls to resolve() or reject() are ignored.

Deferreds are the mechanism used to create new Promises. A Deferred has a 
single associated Promise that can be safely returned to external consumers 
to ensure they do not interfere with the resolution or rejection of the deferred 
operation.
###
Ext.define( 'Deft.promise.Deferred',
	alternateClassName: [ 'Deft.Deferred' ]
	requires: [ 'Deft.promise.Resolver' ]
	
	constructor: ->
		resolver = Ext.create( 'Deft.promise.Resolver' )
		
		@promise = resolver.promise
		@resolve = ( result ) -> resolver.resolve( result )
		@reject = ( error ) -> resolver.reject( error )
		
		return @
)