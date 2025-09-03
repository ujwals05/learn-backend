class APIError extends Error {
  constructor(statusCode, message, errors = [], statck = "") {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = false;
    this.success = false;
    if(statck)
      this.statck = stack
    else
      Error.captureStackTrace(this,this.constructor)
  }
}

export (APIError)
