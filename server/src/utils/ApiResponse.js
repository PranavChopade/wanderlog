class ApiResponse {
  constructor(data, message = 'success') {
    this.message = message;
    this.data = data;
    this.success = true;
  }
}

export default ApiResponse;
