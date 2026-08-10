const extractErrorMessage = (error, fallback = 'server error') => {
  return error?.response?.data?.message || error?.message || fallback;
};

export default extractErrorMessage;
