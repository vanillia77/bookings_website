import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    router = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow navigation if logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(result).toBeTrue();
  });

  it('should redirect to login if not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    router.parseUrl.and.returnValue('login-url' as any);
    const result = TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(result).toBe('login-url' as any);
  });
});
