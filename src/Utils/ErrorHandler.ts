class ErrorHandler extends Error {
  statusCode: any;
  constructor(message:any, statusCode:any) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    // Error.captureStackTrace(this, this.constructor);
  }
  //   here we are creating static method because we dont need to create object to call a class it call automatically
  static alreadyExist(message:any) {
    return new ErrorHandler(409, message);
  }
  static notFound(message = "404 Not Found") {
    return new ErrorHandler(404, message);
  }

  static wrongCredentials(message:any) {
    return new ErrorHandler(401, (message = "username or password is wrong"));
  }
  // default message or value given to function
  static unAuthorized(message = "unAuthorized") {
    return new ErrorHandler(401, message);
  }
  static serverError(message = "Internal Server Error") {
    return new ErrorHandler(500, message);
  }
}

export default ErrorHandler;
