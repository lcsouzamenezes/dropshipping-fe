class AuthTokenError extends Error {
  constructor() {
    super('Error refreshing the token');
  }
}

export { AuthTokenError };
