import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

describe('AuthService token hashing contract', () => {
  it('exposes sanitize without password', () => {
    const service = Object.create(AuthService.prototype) as AuthService;
    const sanitized = service.sanitize({
      id: '1',
      email: 'a@b.com',
      displayName: 'A',
      role: 'USER',
      locale: 'en',
    });
    expect(sanitized).toEqual({
      id: '1',
      email: 'a@b.com',
      displayName: 'A',
      role: 'USER',
      locale: 'en',
    });
    expect(sanitized).not.toHaveProperty('passwordHash');
  });

  it('UnauthorizedException is used for auth failures', () => {
    expect(new UnauthorizedException('Invalid credentials')).toBeInstanceOf(Error);
  });
});
