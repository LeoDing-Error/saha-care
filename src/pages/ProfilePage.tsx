import { User, Mail, Lock, Shield, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
    const { userProfile, firebaseUser } = useAuth();

    const initials = userProfile?.displayName
        ?.split(' ')
        .map((n) => n[0])
        .join('') || '?';

    const roleName = userProfile?.role
        ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
        : 'User';

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences</p>
            </div>

            <Card className="bg-gradient-to-br from-teal-50 to-blue-50">
                <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                                <AvatarFallback className="bg-teal-600 text-white text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                            <Button
                                size="sm"
                                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-teal-600 hover:bg-teal-700 text-white"
                            >
                                <Camera className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl text-gray-900">{userProfile?.displayName || 'Unknown User'}</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {roleName} · {userProfile?.region || 'No Region'}
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <Badge variant="outline" className={
                                    userProfile?.status === 'approved' ? 'border-green-500 text-green-700' :
                                    userProfile?.status === 'pending' ? 'border-orange-500 text-orange-700' :
                                    'border-gray-500 text-gray-700'
                                }>
                                    {userProfile?.status ? userProfile.status.charAt(0).toUpperCase() + userProfile.status.slice(1) : 'Unknown'}
                                </Badge>
                                {userProfile?.createdAt && (
                                    <span className="text-sm text-gray-500">
                                        Active since {userProfile.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
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
                            <Input defaultValue={userProfile?.displayName || ''} className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-700">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="email" defaultValue={firebaseUser?.email || ''} className="pl-10 h-10" readOnly />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-700">Region</Label>
                            <Input defaultValue={userProfile?.region || ''} className="h-10" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-700">Role</Label>
                            <Input defaultValue={roleName} className="h-10" readOnly />
                        </div>
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 mt-2">
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

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
                                <Input type="password" placeholder="Enter current password" className="pl-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-700">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="password" placeholder="Enter new password" className="pl-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-700">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="password" placeholder="Confirm new password" className="pl-10 h-10" />
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

            <Card>
                <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900">Account Status</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {userProfile?.status === 'approved'
                                    ? 'Your account is active and verified'
                                    : userProfile?.status === 'pending'
                                    ? 'Your account is pending approval'
                                    : 'Your account status is unknown'}
                            </p>
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
