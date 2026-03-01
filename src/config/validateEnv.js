const REQUIRED_ENV_VARS = ['DB_URL', 'JWT_SECRET'];

const OPTIONAL_ENV_VARS = [
  'PORT',
  'VERCEL',
  'MODE',
  'ROOT',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'LOCAL_GOOGLE_CLIENT_ID',
  'LOCAL_GOOGLE_CLIENT_SECRET',
  'GOOGLE_LOGIN_REDIRECT_URI',
  'GOOGLE_SIGNUP_REDIRECT_URI',
  'LOCAL_GOOGLE_LOGIN_REDIRECT_URI',
  'LOCAL_GOOGLE_SIGNUP_REDIRECT_URI',
  'GOOGLE_TOKEN_URL',
  'GOOGLE_USERINFO_URL',
  'SIGNATURE_WINDOW_MS'
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `[EnvValidationError] 필수 환경변수가 누락되었습니다: ${missing.join(', ')}`
    );
  }

  if (!process.env.SIGNATURE_SECRET) {
    console.warn(
      '[EnvValidationWarning] SIGNATURE_SECRET이 없어 서명 보호 라우트에서 500이 발생할 수 있습니다.'
    );
  }
};

export { REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS, validateEnv };
