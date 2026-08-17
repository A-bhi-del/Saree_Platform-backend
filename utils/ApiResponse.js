class ApiResponse {
  constructor(statusCode, message, data = null, pagination = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if(pagination) {
      this.pagination = pagination;
    }
  }
}

export default ApiResponse;