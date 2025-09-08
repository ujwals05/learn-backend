class APIError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = false;
    this.success = false;
    if(stack)
      this.stack = stack;
    else
      Error.captureStackTrace(this,this.constructor)
  }
}

export {APIError}
