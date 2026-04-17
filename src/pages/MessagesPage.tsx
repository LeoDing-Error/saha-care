import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, FileText, ArrowLeft, AlertTriangle, MapPin, Thermometer, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../contexts/AuthContext';
import { useCaseDefinitions } from '../hooks/useCaseDefinitions';
import {
    subscribeToConversations,
    subscribeToMessages,
    sendMessage,
    markConversationRead,
    getReport,
    createConversation,
} from '../services/conversations';
import { buildDiseaseQuestionLookup, getReportDisplayTags } from '../utils/reportTags';
import type { Conversation, Message, Report } from '../types';

const supervisorQuickReplies = [
    'Please provide more details',
    'Report verified, thank you',
    'Please re-submit with corrections',
    'Refer patient to health facility immediately',
];

const volunteerQuickReplies = [
    'Understood, will follow up',
    'Patient has been referred',
    'Status update: condition improving',
    'Need more guidance',
];

function formatTime(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
}

function getStatusColor(status: string) {
    switch (status) {
        case 'verified': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
}

export function MessagesPage() {
    const { firebaseUser, userProfile } = useAuth();
    const { definitions } = useCaseDefinitions();
    const [searchParams] = useSearchParams();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [showReportPanel, setShowReportPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [reportDetail, setReportDetail] = useState<Report | null>(null);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [conversationError, setConversationError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const conversationsLoadedRef = useRef(false);
    const questionLookup = useMemo(() => buildDiseaseQuestionLookup(definitions), [definitions]);

    const isVolunteer = userProfile?.role === 'volunteer';

    const quickReplies = isVolunteer ? volunteerQuickReplies : supervisorQuickReplies;

    const isFakeVolunteerId = (id: string) =>
        !id || id.length < 20 || /^(volunteer|supervisor|user)-\d+$/.test(id);

    // Get the other party's name for a conversation
    const getOtherName = (conv: Conversation) =>
        isVolunteer ? conv.supervisorName : conv.volunteerName;

    const getOtherInitials = (conv: Conversation) =>
        getOtherName(conv).split(' ').map(n => n[0]).join('');

    // Subscribe to conversations
    useEffect(() => {
        if (!firebaseUser?.uid) return;

        setLoading(true);
        const unsubscribe = subscribeToConversations(firebaseUser.uid, (convs) => {
            setConversations(convs);
            setLoading(false);

            // Auto-select conversation from URL params on first load
            if (!conversationsLoadedRef.current) {
                conversationsLoadedRef.current = true;
                const targetId = searchParams.get('conversationId');
                if (targetId) {
                    const match = convs.find(c => c.id === targetId);
                    if (match) {
                        setSelectedConversation(match);
                    }
                }
            }
        }, (error) => {
            console.error('Conversations subscription error:', error);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            conversationsLoadedRef.current = false;
        };
    }, [firebaseUser?.uid, searchParams]);

    // Handle reportId URL param — find or create conversation
    useEffect(() => {
        const reportId = searchParams.get('reportId');
        if (!reportId || loading || !firebaseUser?.uid || !userProfile) return;

        // Check if conversation for this report already exists
        const existing = conversations.find(c => c.reportId === reportId);
        if (existing) {
            setSelectedConversation(existing);
            setConversationLoading(false);
            setConversationError(null);
            return;
        }

        // Don't create if already creating
        if (conversationLoading) return;

        const reportDisease = searchParams.get('reportDisease') || '';
        const reportDateStr = searchParams.get('reportDate');
        const volunteerId = searchParams.get('volunteerId') || '';
        const volunteerName = searchParams.get('volunteerName') || 'Unknown';
        const region = searchParams.get('region') || '';

        setConversationLoading(true);
        setConversationError(null);

        createConversation({
            reportId,
            reportDisease,
            reportDate: reportDateStr ? new Date(reportDateStr) : new Date(),
            volunteerId,
            volunteerName,
            supervisorId: firebaseUser.uid,
            supervisorName: userProfile.displayName,
            participantIds: [volunteerId, firebaseUser.uid],
            region,
        })
            .then(() => {
                // onSnapshot will pick up the new conversation; the effect re-runs to select it
            })
            .catch((err) => {
                console.error('Failed to create conversation:', err, { reportId, volunteerId, volunteerName });
                // Show more specific error for permission issues
                let message: string;
                if (isFakeVolunteerId(volunteerId)) {
                    message = 'Cannot message this volunteer — the report was created with test data. Re-seed reports with real user accounts.';
                } else if (err?.code === 'permission-denied') {
                    message = 'Permission denied. Firestore rules may need to be deployed.';
                } else {
                    message = 'Failed to start conversation. Please try again.';
                }
                setConversationError(message);
                setConversationLoading(false);
            });
    }, [searchParams, loading, conversations, firebaseUser?.uid, userProfile, conversationLoading]);

    // Subscribe to messages when a conversation is selected
    useEffect(() => {
        if (!selectedConversation || !firebaseUser?.uid) return;

        markConversationRead(selectedConversation.id, firebaseUser.uid);

        const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
            setMessages(msgs);
        }, (error) => {
            console.error('Messages subscription error:', error);
        });

        return () => unsubscribe();
    }, [selectedConversation, firebaseUser?.uid]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch report detail when panel is opened
    useEffect(() => {
        if (!showReportPanel || !selectedConversation) return;

        setReportDetail(null);
        getReport(selectedConversation.reportId).then((report) => {
            setReportDetail(report);
        });
    }, [showReportPanel, selectedConversation]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation || !firebaseUser || !userProfile) return;

        const text = messageText.trim();
        setMessageText('');

        const otherParticipantId = isVolunteer
            ? selectedConversation.supervisorId
            : selectedConversation.volunteerId;

        await sendMessage(
            selectedConversation.id,
            {
                senderId: firebaseUser.uid,
                senderName: userProfile.displayName || 'Unknown',
                senderRole: userProfile.role as 'volunteer' | 'supervisor',
                text,
            },
            otherParticipantId
        );
    };

    const handleQuickReply = (text: string) => {
        setMessageText(text);
    };

    const filteredConversations = conversations.filter(conv => {
        const otherName = getOtherName(conv);
        return (
            otherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.reportDisease.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    const reportDisplayTags = reportDetail
        ? getReportDisplayTags(reportDetail, questionLookup)
        : { symptoms: [], dangerSigns: [] };

    // Chat view
    if (selectedConversation) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => {
                    setSelectedConversation(null);
                    setShowReportPanel(false);
                    setReportDetail(null);
                    setMessages([]);
                }}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Messages
                </Button>

                <Card>
                    <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-teal-100 text-teal-700">
                                        {getOtherInitials(selectedConversation)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{getOtherName(selectedConversation)}</h3>
                                    <p className="text-sm text-gray-500">
                                        Re: {selectedConversation.reportDisease} Report — {selectedConversation.reportDate.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowReportPanel(!showReportPanel)}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                View Report
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="h-96 p-4">
                        <div className="space-y-4">
                            {messages.map((message, idx) => {
                                const isOwn = message.senderId === firebaseUser?.uid;
                                const showDateSeparator = idx === 0 ||
                                    message.sentAt.toDateString() !== messages[idx - 1].sentAt.toDateString();

                                return (
                                    <div key={message.id}>
                                        {showDateSeparator && (
                                            <div className="flex items-center justify-center my-4">
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                                                    {message.sentAt.toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
                                                <div className={`rounded-lg p-3 ${
                                                    isOwn ? 'bg-teal-600 text-white' : 'bg-gray-100'
                                                }`}>
                                                    <p className="text-sm">{message.text}</p>
                                                </div>
                                                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                    {message.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    <div className="border-t p-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {quickReplies.map((reply, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-teal-50 hover:border-teal-500"
                                    onClick={() => handleQuickReply(reply)}
                                >
                                    {reply}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Type your message..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="min-h-[60px]"
                            />
                            <Button
                                className="bg-teal-600 hover:bg-teal-700"
                                onClick={handleSendMessage}
                                disabled={!messageText.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500">
                            {messageText.trim() ? 'Press Enter to send, Shift+Enter for new line' : 'Messages queue offline and sync when online'}
                        </p>
                    </div>
                </Card>

                {showReportPanel && (
                    <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                                <h4 className="font-medium">Linked Report Details</h4>
                                <Button variant="ghost" size="sm" onClick={() => setShowReportPanel(false)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </div>

                            {!reportDetail ? (
                                <p className="text-sm text-gray-500">Loading report...</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        {reportDetail.caseId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Case ID:</span>
                                                <span className="font-medium">{reportDetail.caseId}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Disease:</span>
                                            <span className="font-medium">{reportDetail.disease}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Status:</span>
                                            <Badge className={getStatusColor(reportDetail.status)}>
                                                {reportDetail.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Reporter:</span>
                                            <span className="font-medium">{reportDetail.reporterName || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> Location:
                                            </span>
                                            <span className="font-medium text-right">{reportDetail.location.name || `${reportDetail.location.lat}, ${reportDetail.location.lng}`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <Users className="h-3 w-3" /> Persons:
                                            </span>
                                            <span className="font-medium">{reportDetail.personsCount}</span>
                                        </div>
                                        {reportDetail.temp !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <Thermometer className="h-3 w-3" /> Temperature:
                                                </span>
                                                <span className="font-medium">{reportDetail.temp}&deg;C</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Submitted:
                                            </span>
                                            <span className="font-medium">{reportDetail.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {reportDisplayTags.symptoms.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Symptoms:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {reportDisplayTags.symptoms.map((symptom, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {symptom}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {reportDisplayTags.dangerSigns.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Danger Signs:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {reportDisplayTags.dangerSigns.map((sign, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        {sign}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {reportDetail.verificationNotes && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Verification Notes:</p>
                                            <p className="text-sm bg-white rounded p-2 border">{reportDetail.verificationNotes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // Conversation list view
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl text-gray-900">Messages</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isVolunteer
                        ? 'Communicate with your supervisor about reports'
                        : 'Communicate with volunteers about their reports'}
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={isVolunteer ? 'Search by supervisor name or disease...' : 'Search by volunteer name or disease...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500">Loading conversations...</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {conversationLoading && (
                        <Card className="border-teal-200 bg-teal-50">
                            <CardContent className="py-6 text-center">
                                <p className="text-teal-700">Starting conversation...</p>
                            </CardContent>
                        </Card>
                    )}

                    {conversationError && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="py-6 text-center">
                                <p className="text-red-700">{conversationError}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {filteredConversations.map(conv => {
                            const unreadCount = conv.unreadCounts[firebaseUser?.uid || ''] || 0;
                            const otherName = getOtherName(conv);
                            const otherInitials = getOtherInitials(conv);
                            const subtitle = isVolunteer
                                ? `Supervisor: ${conv.supervisorName}`
                                : `Volunteer: ${conv.volunteerName}`;

                            return (
                                <Card
                                    key={conv.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setSelectedConversation(conv)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-teal-100 text-teal-700">
                                                    {otherInitials}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-medium ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {otherName}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">{formatTime(conv.lastMessageAt)}</span>
                                                        {unreadCount > 0 && (
                                                            <Badge className="bg-red-500">{unreadCount}</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-500 mb-1">{subtitle}</p>
                                                <p className="text-sm text-gray-600 truncate mb-2">{conv.lastMessage}</p>

                                                <Badge variant="outline" className="text-xs">
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    {conv.reportDisease} Report
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredConversations.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500">
                                    {searchTerm
                                        ? `No conversations found matching "${searchTerm}"`
                                        : 'No conversations yet -- conversations appear when messages are exchanged about reports'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
