import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    region: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration - in real app would create account
    console.log('Register:', formData);
    navigate('/login');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">SAHA-Care</span>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">Join the Network</h1>
          <p className="text-gray-600">Connecting humanitarian efforts across regions.</p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-md">
          <CardContent className="pt-8 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role and Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => updateField('role', value)}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="clinical-coordinator">Clinical Coordinator</SelectItem>
                      <SelectItem value="field-coordinator">Field Coordinator</SelectItem>
                      <SelectItem value="data-analyst">Data Analyst</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Region
                  </Label>
                  <Select value={formData.region} onValueChange={(value) => updateField('region', value)}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rafah">Rafah</SelectItem>
                      <SelectItem value="khan-younis">Khan Younis</SelectItem>
                      <SelectItem value="gaza-city">Gaza City</SelectItem>
                      <SelectItem value="north-gaza">North Gaza</SelectItem>
                      <SelectItem value="deir-al-balah">Deir al-Balah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Register Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6">
                Register
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-medium">DATA PROTECTED</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-medium">HUMANITARIAN STANDARD</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-medium">SECURE PORTAL</span>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © 2024 SAHA-Care Portal. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
