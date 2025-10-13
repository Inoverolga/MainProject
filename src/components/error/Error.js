const Error = ({ message, className = "" }) => {
  return (
    <div className={`alert alert-danger ${className}`} role="alert">
      {message}
    </div>
  );
};

export default Error;
