###
Copyright (c) 2013 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
###

describe( 'Deft.promise.Promise', ->
	values = [ undefined, null, false, 0, 1, 'expected value', [ 1, 2, 3 ], {}, new Error( 'error message' ) ]
	
	describe( 'when()', ->
		describe( 'returns a Promise that eventually resolves with the specified value', ->
			for value in values
				do ( value ) ->
					specify( value, ->
						promise = Deft.Promise.when( value )
						
						promise.should.be.an.instanceof( Deft.Promise )
						promise.should.not.be.fulfilled
						promise.should.not.be.rejected
						promise.should.eventually.equal( value )
					)
		)
		
		describe( 'returns a Promise that eventually resolves when the specified Promise is resolved', ->
			for value in values
				do( value ) ->
					specify( value, ->
						deferred = Ext.create( 'Deft.Deferred' )
						deferred.resolve( value )
						
						promise = Deft.Promise.when( deferred.promise )
						
						promise.should.be.an.instanceof( Deft.Promise )
						promise.should.not.be.fulfilled
						promise.should.not.be.rejected
						promise.should.eventually.equal( value )
					)
		)
			
		describe( 'returns a Promise that eventually rejects when the specified Promise is rejected', ->
			specify( 'Error: error message', ->
				deferred = Ext.create( 'Deft.Deferred' )
				deferred.reject( new Error( 'error message' ) )
				
				promise = Deft.Promise.when( deferred.promise )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.not.be.fulfilledled
				promise.should.not.be.rejected
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
			
			specify( 'resolves', ->
				mockThirdPartyPromise = new MockThirdPartyPromise()
				mockThirdPartyPromise.resolve( 'expected value' )
				
				promise = Deft.Promise.when( mockThirdPartyPromise )
				
				promise.should.not.be.equal( mockThirdPartyPromise )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.not.be.fulfilled
				promise.should.not.be.rejected
				promise.should.eventually.equal( 'expected value' )
			)
			
			specify( 'rejects', ->
				mockThirdPartyPromise = new MockThirdPartyPromise()
				mockThirdPartyPromise.resolve( 'expected value' )
				
				promise = Deft.Promise.when( mockThirdPartyPromise )
				
				promise.should.not.be.equal( mockThirdPartyPromise )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.not.be.fulfilled
				promise.should.not.be.rejected
				promise.should.eventually.equal( 'expected value' )
			)
		)
	)
	
	describe( 'all()', ->
		describe( 'returns a new Promise that will only resolve once all the specified Promises(s) or values have resolved.', ->
			specify( '[]', ->
				promise = Deft.Promise.all( [] )
				
				promise.should.be.an.instanceof( Deft.Promise )
				promise.should.not.be.fulfilled
				promise.should.not.be.rejected
				promise.should.eventually.deep.equal( [] )
			)
		)
	)
)