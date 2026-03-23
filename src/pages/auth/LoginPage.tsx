import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight, HelpCircle, Globe, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { signIn } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [userType, setUserType] = useState<'clinical' | 'field'>('clinical');
  const [showPin, setShowPin] = useState(false);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (firebaseUser) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, pin);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">SAHA-Care</h1>
          <p className="text-gray-600">Humanitarian Health Network Access</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-md">
          <CardContent className="pt-6 pb-8 px-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Health Worker Access Toggle */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-gray-500 mb-3 block">
                  Health Worker Access
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('clinical')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      userType === 'clinical'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium text-sm">Clinical</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('field')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      userType === 'field'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium text-sm">Field Staff</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {userType === 'clinical' ? 'Health Care Users' : 'Volunteers'}
                </p>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@organization.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Security PIN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pin">Password</Label>
                  <span className="text-sm text-gray-400">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600">
                Not part of the network yet?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register with Email
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </button>
          <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
            <Globe className="w-4 h-4" />
            Organization Site
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6">
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            SECURE PORTAL FOR AUTHORIZED SAHA-CARE HEALTH PROVIDERS<br />
            AND HUMANITARIAN WORKERS ONLY. UNAUTHORIZED ACCESS IS<br />
            STRICTLY PROHIBITED.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
            <Shield className="w-4 h-4 text-teal-600" />
            <span className="font-medium">Encrypted Connection</span>
            <span className="text-gray-400">•</span>
            <span>Active Humanitarian Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
