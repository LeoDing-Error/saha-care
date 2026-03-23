import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToPendingVolunteers, approveUser, rejectUser } from '../services/users';
import type { User } from '../types';

function formatDate(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

export function VolunteersPage() {
    const { userProfile, firebaseUser } = useAuth();
    const [pendingVolunteers, setPendingVolunteers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState<User | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!userProfile?.region) return;
        const unsub = subscribeToPendingVolunteers(userProfile.region, (users) => {
            setPendingVolunteers(users);
            setLoading(false);
        });
        return unsub;
    }, [userProfile?.region]);

    const handleApprove = (volunteer: User) => {
        setSelectedVolunteer(volunteer);
        setActionType('approve');
    };

    const handleReject = (volunteer: User) => {
        setSelectedVolunteer(volunteer);
        setActionType('reject');
        setRejectionReason('');
    };

    const handleConfirmAction = async () => {
        if (!selectedVolunteer || !firebaseUser?.uid) return;
        setActionLoading(true);
        try {
            if (actionType === 'approve') {
                await approveUser(selectedVolunteer.uid, firebaseUser.uid);
            } else if (actionType === 'reject') {
                await rejectUser(selectedVolunteer.uid, firebaseUser.uid, rejectionReason);
            }
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setActionLoading(false);
            setActionType(null);
            setSelectedVolunteer(null);
            setRejectionReason('');
        }
    };

    // Mock data for active/rejected tabs since we don't have those subscriptions
    const activeVolunteers = [
        { id: 'v3', name: 'Fatima Al-Masri', email: 'fatima.masri@email.com', approvedDate: '2026-03-10', reportsSubmitted: 24, lastActive: '2026-03-20' },
        { id: 'v4', name: 'Omar Ibrahim', email: 'omar.ibrahim@email.com', approvedDate: '2026-03-08', reportsSubmitted: 31, lastActive: '2026-03-20' },
        { id: 'v5', name: 'Layla Hassan', email: 'layla.hassan@email.com', approvedDate: '2026-03-05', reportsSubmitted: 18, lastActive: '2026-03-19' },
    ];

    const rejectedVolunteers = [
        { id: 'v8', name: 'Ali Mahmoud', email: 'ali.m@email.com', rejectedDate: '2026-03-15', rejectionReason: 'Incomplete training documentation.' },
    ];

    const stats = { active: activeVolunteers.length, pending: pendingVolunteers.length, rejected: rejectedVolunteers.length };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl text-gray-900">Volunteers</h1>
                <p className="text-sm text-gray-500 mt-1">{userProfile?.region || 'All Regions'}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active</p>
                                <p className="text-3xl text-gray-900 mt-1">{stats.active}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-3xl text-gray-900 mt-1">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Rejected</p>
                                <p className="text-3xl text-gray-900 mt-1">{stats.rejected}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                                <UserX className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={stats.pending > 0 ? 'pending' : 'active'} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending" className="relative">
                        Pending{stats.pending > 0 && <Badge className="ml-2 bg-orange-500">{stats.pending}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : pendingVolunteers.length > 0 ? (
                        pendingVolunteers.map((volunteer) => (
                            <Card key={volunteer.uid}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-orange-100 text-orange-700">
                                                    {volunteer.displayName.split(' ').map((n) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{volunteer.displayName}</h3>
                                                <p className="text-sm text-gray-600">{volunteer.email}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <Badge variant="outline">{volunteer.region}</Badge>
                                                    <span className="text-sm text-gray-500">Applied {formatDate(volunteer.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(volunteer)}>
                                                <UserCheck className="h-4 w-4 mr-2" />Approve
                                            </Button>
                                            <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleReject(volunteer)}>
                                                <UserX className="h-4 w-4 mr-2" />Reject
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <UserCheck className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-gray-500">No pending volunteers — all caught up!</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="active" className="space-y-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Volunteer</th>
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Email</th>
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Approved</th>
                                            <th className="text-center py-3 px-2 text-sm text-gray-600">Reports</th>
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Last Active</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeVolunteers.map((v) => (
                                            <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                                                {v.name.split(' ').map((n) => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-900">{v.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-sm text-gray-600">{v.email}</td>
                                                <td className="py-4 px-2 text-sm text-gray-600">{new Date(v.approvedDate).toLocaleDateString()}</td>
                                                <td className="py-4 px-2 text-center"><Badge variant="secondary">{v.reportsSubmitted}</Badge></td>
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Activity className="h-4 w-4 text-green-600" />
                                                        {formatDate(new Date(v.lastActive))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected" className="space-y-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Volunteer</th>
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Email</th>
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Rejected</th>
                                            <th className="text-left py-3 px-2 text-sm text-gray-600">Reason</th>
                                            <th className="text-right py-3 px-2 text-sm text-gray-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rejectedVolunteers.map((v) => (
                                            <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                                                                {v.name.split(' ').map((n) => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-900">{v.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-sm text-gray-600">{v.email}</td>
                                                <td className="py-4 px-2 text-sm text-gray-600">{new Date(v.rejectedDate).toLocaleDateString()}</td>
                                                <td className="py-4 px-2 max-w-xs"><p className="text-sm text-gray-600 italic line-clamp-2">{v.rejectionReason}</p></td>
                                                <td className="py-4 px-2 text-right"><Button variant="outline" size="sm">Reconsider</Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={actionType === 'approve'} onOpenChange={() => setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Volunteer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve <strong>{selectedVolunteer?.displayName}</strong> as a volunteer for <strong>{selectedVolunteer?.region}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-800">
                            Once approved, {selectedVolunteer?.displayName} will be able to submit disease reports for your region.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmAction} disabled={actionLoading}>
                            <UserCheck className="h-4 w-4 mr-2" />{actionLoading ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Volunteer</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting <strong>{selectedVolunteer?.displayName}</strong>'s application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="rejection-reason">Reason for rejection <span className="text-red-600">*</span></Label>
                        <Textarea id="rejection-reason" placeholder="e.g., Incomplete training documentation..."
                            value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="resize-none" />
                        <p className="text-xs text-gray-500">{rejectionReason.length} / 10 characters minimum</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmAction}
                            disabled={rejectionReason.length < 10 || actionLoading}>
                            <UserX className="h-4 w-4 mr-2" />{actionLoading ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
