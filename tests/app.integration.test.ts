// @ts-nocheck
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

let app;
let jwtUtil;

beforeAll(async () => {
  process.env.DB_URL = process.env.DB_URL ?? 'mongodb://127.0.0.1:27017/todopet-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
  process.env.SIGNATURE_SECRET = process.env.SIGNATURE_SECRET ?? 'test-signature-secret';

  ({ default: app } = await import('../app.ts'));
  ({ default: jwtUtil } = await import('../src/utils/jwt.ts'));
});

describe('App Integration', () => {
  it('GET /health returns server health payload', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.status).toBe('ok');
  });

  it('GET /api/v1/users/auth returns 401 when token is missing', async () => {
    const response = await request(app).get('/api/v1/users/auth');

    expect(response.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(response.body.error.result).toBe('Unauthorized');
  });

  it('GET /api/v1/users/auth returns 200 when bearer token is valid', async () => {
    const token = jwtUtil.sign('507f1f77bcf86cd799439011');

    const response = await request(app)
      .get('/api/v1/users/auth')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.status).toBe(200);
    expect(response.body.data.result).toBe('Success');
  });

  it('GET /api/v1/users/auth returns 200 when cookie token is valid', async () => {
    const token = jwtUtil.sign('507f1f77bcf86cd799439011');

    const response = await request(app)
      .get('/api/v1/users/auth')
      .set('Cookie', [`token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.message).toBe('토큰 검증 완료');
  });
});
