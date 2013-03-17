###
Copyright (c) 2013 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
###

describe( 'Deft.promise.Promise', ->
	# Format values displayed by the test runner to make them human readable
	# and consistent across platforms.
	formatValue = ( value ) ->
		# Promises and Deferreds
		if value instanceof Deft.promise.Promise
			return 'Deft.Promise'
		if value instanceof Deft.promise.Deferred
			return 'Deft.Deferred'
		# All other Ext JS or Sencha Touch Class instances
		if value instanceof Ext.ClassManager.get( 'Ext.Base' )
			return Ext.ClassManager.getName( value )
		# Array
		if Ext.isArray( value )
			formattedValues = Ext.Array.map( value, formatValue )
			return "[#{ formattedValues.join(', ') }]"
		# Object
		if Ext.isObject( value )
			return 'Object'
		# String
		if Ext.isString( value )
			return "\"#{ value }\""
		return '' + value
	
	describe( 'when()', ->
		values = [ undefined, null, false, 0, 1, 'expected value', [ 1, 2, 3 ], {}, new Error( 'error message' ) ]
		
		describe( 'returns a Promise that eventually resolves with the specified value', ->
			for value in values
				do ( value ) ->
					specify( formatValue( value ), ->
						promise = Deft.Promise.when( value )
						
						promise.should.be.an.instanceof( Deft.Promise )
						promise.should.eventually.equal( value )
					)
		)
		
		describe( 'returns a Promise that eventually resolves when the specified Promise is resolved', ->
			for value in values
				do( value ) ->
					specify( formatValue( value ), ->
						deferred = Ext.create( 'Deft.Deferred' )
						deferred.resolve( value )
						
						promise = Deft.Promise.when( deferred.promise )
						
						promise.should.not.be.equal( deferred.promise )
						promise.should.be.an.instanceof( Deft.Promise )
						promise.should.eventually.equal( value )
					)
		)
		
		describe( 'returns a Promise that eventually rejects when the specified Promise is rejected', ->
			specify( 'Error: error message', ->
				deferred = Ext.create( 'Deft.Deferred' )
				deferred.reject( new Error( 'error message' ) )
				
				promise = Deft.Promise.when( deferred.promise )
				
				promise.should.not.be.equal( deferred.promise )
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
		)
		
		describe( 'returns a new Promise that adapts the specified untrusted (aka third-party) then-able', ->
			class MockThirdPartyPromise
				then: ( @successCallback, @failureCallback ) ->
					switch @state
						when 'resolved'
							@successCallback( @value )
						when 'rejected'
							@failureCallback( @value )
					return
				resolve: ( @value ) ->
					@state = 'resolved'
					@successCallback( @value ) if @successCallback?
					return
				reject: ( @value ) ->
					@state = 'rejected'
					@failureCallback( @value ) if @failureCallback?
					return
			
			specify( 'resolves when resolved', ->
				mockThirdPartyPromise = new MockThirdPartyPromise()
				mockThirdPartyPromise.resolve( 'expected value' )
				
				promise = Deft.Promise.when( mockThirdPartyPromise )
				
				promise.should.not.be.equal( mockThirdPartyPromise )
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'rejects when rejected', ->
				mockThirdPartyPromise = new MockThirdPartyPromise()
				mockThirdPartyPromise.resolve( 'expected value' )
				
				promise = Deft.Promise.when( mockThirdPartyPromise )
				
				promise.should.not.be.equal( mockThirdPartyPromise )
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
		)
	)
	
	describe( 'isPromise()', ->
		describe( 'returns true for a Deft.Promise', ->
			specify( 'Deft.Promise', ->
				promise = Ext.create( 'Deft.Deferred' ).promise
				
				expect( Deft.Promise.isPromise( promise ) ).to.be.true
			)
			
			specify( 'returns true for any then()-able', ->
				promise = { then: -> return }
				
				expect( Deft.Promise.isPromise( promise ) ).to.be.true
			)
		)
		
		describe( 'returns false for non-promises', ->
			values = [ undefined, null, false, 0, 1, 'value', [ 1, 2, 3 ], {}, new Error( 'error message' ) ]
			for value in values
				do ( value ) ->
					specify( formatValue( value ), ->
						expect( Deft.Promise.isPromise( value ) ).to.be.false
					)
		)
	)
	
	describe( 'all()', ->
		describe( 'returns a new Promise that resolves with the resolved values for the specified Array of Promises(s) or values.', ->
			specify( 'Empty Array', ->
				promise = Deft.Promise.all( [] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [] )
			)
			
			specify( 'Array with one value', ->
				promise = Deft.Promise.all( [ 'expected value' ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 'expected value' ] )
			)
			
			specify( 'Array of values', ->
				promise = Deft.Promise.all( [ 1, 2, 3 ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 1, 2, 3 ] )
			)
			
			specify( 'Sparse Array', ->
				promise = Deft.Promise.all( `[,2,,4,5]` )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( `[,2,,4,5]` )
			)
			
			specify( 'Array with one resolved Promise(s)', ->
				promise = Deft.Promise.all( [ Deft.Deferred.resolve( 'expected value' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 'expected value' ] )
			)
			
			specify( 'Array of resolved Promise(s)', ->
				promise = Deft.Promise.all( [ Deft.Deferred.resolve( 1 ), Deft.Deferred.resolve( 2 ), Deft.Deferred.resolve( 3 ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 1, 2, 3 ] )
			)
		)
		
		describe( 'returns a new Promise that resolves with the resolved values for the specified resolved Promise of an Array of Promises(s) or values.', ->
			specify( 'Promise of an empty Array', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						[]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [] )
			)
			
			specify( 'Promise of an Array with one value', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						[ 'expected value' ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 'expected value' ] )
			)
			
			specify( 'Promise of an Array of values', ->
				promise = Deft.Promise.all(
					Deft.Deferred.resolve(
						[ 1, 2, 3 ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 1, 2, 3 ] )
			)
			
			specify( 'Promise of a sparse Array', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						`[,2,,4,5]`
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( `[,2,,4,5]` )
			)
			
			specify( 'Promise of an Array with one resolved Promise(s)', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						[ Deft.Deferred.resolve( 'expected value' ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 'expected value' ] )
			)
			
			specify( 'Promise of an Array of resolved Promise(s)', ->
				promise = Deft.Promise.all(
					Deft.Deferred.resolve(
						[ Deft.Deferred.resolve( 1 ), Deft.Deferred.resolve( 2 ), Deft.Deferred.resolve( 3 ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( [ 1, 2, 3 ] )
			)
		)
		
		describe( 'returns a new Promise that rejects with the error associated with the first Promise in the specified Array of Promise(s) or values that rejects', ->
			specify( 'Array with one rejected Promise', ->
				promise = Deft.Promise.all( [ Deft.Deferred.reject( new Error( 'error message' ) ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
			
			specify( 'Array of resolved Promises and a rejected Promise', ->
				promise = Deft.Promise.all( [ Deft.Deferred.resolve( 1 ), Deft.Deferred.reject( new Error( 'error message' ) ), Deft.Deferred.resolve( 3 ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
			
			specify( 'Array of values, resolved Promises and a rejected Promise', ->
				promise = Deft.Promise.all( [ 1, Deft.Deferred.reject( new Error( 'error message' ) ), Deft.Deferred.resolve( 3 ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
		)
		
		describe( 'returns a new Promise that rejects with the error associated with the first Promise in the specified resolved Promise of an Array of Promise(s) or values that rejects', ->
			specify( 'Promise of an Array with one rejected Promise', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						[ Deft.Deferred.reject( new Error( 'error message' ) ) ] 
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
			
			specify( 'Promise of an Array of resolved Promises and a rejected Promise', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						[ Deft.Deferred.resolve( 1 ), Deft.Deferred.reject( new Error( 'error message' ) ), Deft.Deferred.resolve( 3 ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
			
			specify( 'Promise of an Array of values, resolved Promises and a rejected Promise', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.resolve(
						[ 1, Deft.Deferred.reject( new Error( 'error message' ) ), Deft.Deferred.resolve( 3 ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
		)
		
		describe( 'returns a new Promise that rejects with the error associated with the rejected Promise of an Array of Promise(s) or values', ->
			specify( 'Error: error message', ->
				promise = Deft.Promise.all( 
					Deft.Deferred.reject(
						new Error( 'error message' )
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
		)
		
		describe( 'throws an Error if anything other than Array or Promise of an Array is specified', ->
			specify( 'no parameters', ->
				expect( -> Deft.Promise.all() ).to.throw( Error, 'Invalid parameter: expected an Array or Promise of an Array.' )
			)
			
			specify( 'a single non-Array parameter', ->
				expect( -> Deft.Promise.all( 1 ) ).to.throw( Error, 'Invalid parameter: expected an Array or Promise of an Array.' )
			)
			
			specify( 'multiple non-Array parameters', ->
				expect( -> Deft.Promise.all( 1, 2, 3 ) ).to.throw( Error, 'Invalid parameter: expected an Array or Promise of an Array.' )
			)
		)
		
		return
	)
	
	describe( 'any()', ->
		describe( 'returns a new Promise that will resolve once any one of the specified Array of Promises(s) or values have resolved.', ->
			specify( 'Array with one value', ->
				promise = Deft.Promise.any( [ 'expected value' ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array of values', ->
				promise = Deft.Promise.any( [ 'expected value', 'expected value', 'expected value' ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Sparse Array', ->
				promise = Deft.Promise.any( `[,'expected value',,'expected value','expected value']` )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array with one resolved Promise(s)', ->
				promise = Deft.Promise.any( [ Deft.Deferred.resolve( 'expected value' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( 'expected value' )
			)
			
			specify( 'Array of resolved Promise(s)', ->
				promise = Deft.Promise.any( [ Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.resolve( 'expected value' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array of rejected Promise(s) and one resolved Promise', ->
				promise = Deft.Promise.any( [ Deft.Deferred.reject( 'error message' ), Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.reject( 'error message' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array of pending and rejected Promise(s) and one resolved Promise', ->
				promise = Deft.Promise.any( [ Ext.create( 'Deft.Deferred' ).promise, Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.reject( 'error message' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
		)
		
		describe( 'returns a new Promise that will resolve once any one of the specified resolved Promise of an Array of Promises(s) or values have resolved.', ->
			specify( 'Array with one value', ->
				promise = Deft.Promise.any( 
					Deft.Deferred.resolve(
						[ 'expected value' ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array of values', ->
				promise = Deft.Promise.any(
					Deft.Deferred.resolve(
						[ 'expected value', 'expected value', 'expected value' ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Sparse Array', ->
				promise = Deft.Promise.any(
					Deft.Deferred.resolve(
						`[,'expected value',,'expected value','expected value']`
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array with one resolved Promise(s)', ->
				promise = Deft.Promise.any( 
					Deft.Deferred.resolve(
						[ Deft.Deferred.resolve( 'expected value' ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.deep.equal( 'expected value' )
			)
			
			specify( 'Array of resolved Promise(s)', ->
				promise = Deft.Promise.any( 
					Deft.Deferred.resolve(
						[ Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.resolve( 'expected value' ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array of rejected Promise(s) and one resolved Promise', ->
				promise = Deft.Promise.any( 
					Deft.Deferred.resolve(
						[ Deft.Deferred.reject( 'error message' ), Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.reject( 'error message' ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'Array of pending and rejected Promise(s) and one resolved Promise', ->
				promise = Deft.Promise.any( 
					Deft.Deferred.resolve(
						[ Ext.create( 'Deft.Deferred' ).promise, Deft.Deferred.resolve( 'expected value' ), Deft.Deferred.reject( 'error message' ) ]
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.eventually.equal( 'expected value' )
			)
		)
		
		describe( 'returns a new Promise that will reject if none of the specified Array of Promises(s) or values resolves.', ->
			specify( 'Empty Array', ->
				promise = Deft.Promise.any( [] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( 'No Promises were resolved.' )
			)
			
			specify( 'Array with one rejected Promise(s)', ->
				promise = Deft.Promise.any( [ Deft.Deferred.reject( 'error message' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( 'No Promises were resolved.' )
			)
			
			specify( 'Array of rejected Promise(s)', ->
				promise = Deft.Promise.any( [ Deft.Deferred.reject( 'error message' ), Deft.Deferred.reject( 'error message' ), Deft.Deferred.reject( 'error message' ) ] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( 'No Promises were resolved.' )
			)
		)
		
		describe( 'returns a new Promise that rejects with the error associated with the rejected Promise of an Array of Promise(s) or values', ->
			specify( 'Error: error message', ->
				promise = Deft.Promise.any( 
					Deft.Deferred.reject(
						new Error( 'error message' )
					)
				)
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.be.rejected.with( Error, 'error message' )
			)
		)
		
		describe( 'throws an Error if anything other than Array or Promise of an Array is specified', ->
			specify( 'no parameters', ->
				expect( -> Deft.Promise.any() ).to.throw( Error, 'Invalid parameter: expected an Array or Promise of an Array.' )
			)
			
			specify( 'a single non-Array parameter', ->
				expect( -> Deft.Promise.any( 1 ) ).to.throw( Error, 'Invalid parameter: expected an Array or Promise of an Array.' )
			)
			
			specify( 'multiple non-Array parameters', ->
				expect( -> Deft.Promise.any( 1, 2, 3 ) ).to.throw( Error, 'Invalid parameter: expected an Array or Promise of an Array.' )
			)
		)
	)
	
	describe( 'some()', ->
	)
	
	describe( 'delay()', ->
	)
	
	describe( 'timeout()', ->
	)
	
	describe( 'memoize()', ->
	)
	
	describe( 'map()', ->
	)
	
	describe( 'reduce()', ->
	)
)