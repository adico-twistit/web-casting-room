'use strict';
// Require our core node modules.
var util = require( "util" );

// Export the constructor function.
exports.WcError = WcError;

// Export the factory function for the custom error object. The factory function lets
// the calling context create new AppError instances without calling the [new] keyword.
exports.createAppError = createAppError;

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //


// I create the new instance of the AppError object, ensureing that it properly
// extends from the Error class.
function createAppError( settings ) {

    // NOTE: We are overriding the "implementationContext" so that the createAppError()
    // function is not part of the resulting stacktrace.
    return( new WcError( settings, createAppError ) );

}


// I am the custom error object for the application. The settings is a hash of optional
// properties for the error instance:
// --
// * type: I am the type of error being thrown.
// * message: I am the reason the error is being thrown.
// * detail: I am an explanation of the error.
// * extendedInfo: I am additional information about the error context.
// * errorCode: I am a custom error code associated with this type of error.
// --
// The implementationContext argument is an optional argument that can be used to trim
// the generated stacktrace. If not provided, it defaults to WcError.
function WcError( settings, implementationContext, err ) {

    // Ensure that settings exists to prevent refernce errors.
    settings = ( settings || {} );

    // Capture the current stacktrace and store it in the property "this.stack". By
    // providing the implementationContext argument, we will remove the current
    // constructor (or the optional factory function) line-item from the stacktrace; this
    // is good because it will reduce the implementation noise in the stack property.
    // --
    // Rad More: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi#Stack_trace_collection_for_custom_exceptions
    Error.captureStackTrace( this, ( implementationContext || WcError ) );

    // Override the default name property (Error). This is basically zero value-add.
    this.name = "WcError";

    this.type = ( settings.type || "Application" );
    this.message = ( settings.message || "An error occurred." );
    this.detail = ( settings.detail || "" );
    this.extendedInfo = ( settings.extendedInfo || "" );
    this.errorCode = ( settings.errorCode || "" );

    // This is just a flag that will indicate if the error is a custom WcError. If this
    // is not an WcError, this property will be undefined, which is a Falsey.
    this.isAppError = true;

    if(err) {
        this.source = err;
    }
    else {
        this.source = null;
    }
}

// todo: ? WCError.prototype = Object.create(Error.prototype);
// Or
util.inherits( WcError, Error );

var mod = {
    handleError: function handleError(err, req, res, cb) {
        logError(err);

        var message = err.message ? err.message : 'Internal Server Error';
        err.message = message;

        if(cb) {
            cb(err);
            return;
        }

        res.json({
            error: {message: message}
        });

        function logError(error) {
            console.log({
                message: error.message,
                status: error.status,
                stack: error.stack
            });
        }
    }
};

function WcError( message, status, code, stack ) {
    Error.captureStackTrace(this);
    this.message = message || 'Internal Server Error';
    this.name = "WcError";
    this.code = code;
    this.status = code;
    this.stack = stack;
}
WcError.prototype = Object.create(Error.prototype);
WcError.prototype.constructor = WcError;

function ServerError(message, status, code, stack) {
    Error.captureStackTrace(this);
    this.message = message;
    this.name = "ServerError";
    this.code = code;
    this.status = code;
    this.stack = stack;
}
ServerError.prototype = Object.create(Error.prototype);

function DataServerError(message, status, code, stack) {
    Error.captureStackTrace(this);
    this.message = message;
    this.name = "DataServerError";
    this.code = code;
    this.status = code;
    this.stack = stack;
}
DataServerError.prototype = Object.create(Error.prototype);

function BabelError(message, status, code, stack) {
    Error.captureStackTrace(this);
    this.message = message;
    this.name = "BabelError";
    this.code = code;
    this.status = code;
    this.stack = stack;
}
BabelError.prototype = Object.create(Error.prototype);
BabelError.prototype.getMessage = function(cb) {
    translateYouError(this.message, cb);
}

// in real life use https://github.com/paypal/makara
function translateYourError(message, cb) {
    cb(null, "And it can to pass that, " + message.toLowerCase());
}

module.exports = mod;

// TODO: fix the handlers to proper ones
var statusSwitcher = {
    '400': WcError,
    '404': DataServerError,
    '500': ServerError
};
var codeSwitcher = {
    '100': WcError,
    '200': DataServerError,
    '300': ServerError
};

module.exports.create = function createError(err, message, status, code, stack) {
    // overloading: no err object passed
    if( typeof err === 'string' ) {
        // assuming err is message  status, code, stack might follow, shift all params right
        stack = code;
        code = status;
        status = message;
        message = err;
        err = null;
    } else if ( typeof err === 'number' ) {
        // assuming err is status, message & stack might follow 
        stack = status;
        status = err;
        err = null;
        code = null;
    }

    if( typeof mesasge !== 'string' || message.length < 1 ) {
        message = 'Internal Server Error';
    }
    var switcher = statusSwitcher;
    var switchVal = status;
    if( typeof status !== 'number' && typeof code === 'number' ) {
        switcher = codeSwitcher;
        switchVal = code;
    }

    if( switchVal in switcher )
    {
        return new switcher[switchVal](err, message, status, code, stack);
    } else {
        return new WcError(err, message, status, code, stack);
    }
}