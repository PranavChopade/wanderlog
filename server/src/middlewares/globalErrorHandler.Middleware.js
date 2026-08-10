const GlobalErrorHandler = (error, req, res, next) => { 
  if (error.name === 'MulterError') {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 5MB.'
        : error.message || 'File upload failed';
    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
};

export default GlobalErrorHandler;
