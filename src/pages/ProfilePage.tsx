import { User, Mail, Phone, Lock, Shield, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function ProfilePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-teal-50 to-blue-50">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-teal-600 text-white text-2xl">AH</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-gray-900">Ahmed Hassan</h2>
              <p className="text-sm text-gray-600 mt-1">Supervisor · Rafah Region</p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Total Reports</p>
                  <p className="text-xl text-gray-900 mt-1">247</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className="text-xl text-green-600 mt-1">189</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Active Since</p>
                  <p className="text-base text-gray-900 mt-1">Jan 2024</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-teal-600" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Full Name</Label>
              <Input
                defaultValue="Ahmed Hassan"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  defaultValue="ahmed.hassan@saha.org"
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  defaultValue="+970 59 123 4567"
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Job Title</Label>
              <Input
                defaultValue="Regional Health Supervisor"
                className="h-10"
              />
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 mt-2">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mt-2">
              <p className="text-xs text-gray-600">
                Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-10">
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">Account Status</p>
              <p className="text-sm text-gray-500 mt-1">Your account is active and verified</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="h-10">
                Export Data
              </Button>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 h-10">
                Deactivate Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
