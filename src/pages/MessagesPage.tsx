import { useState } from 'react';
import { Search, Send, FileText, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'volunteer' | 'supervisor';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  volunteerId: string;
  volunteerName: string;
  reportId: string;
  reportDisease: string;
  reportDate: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 'conv1',
    volunteerId: 'v1',
    volunteerName: 'Fatima Al-Masri',
    reportId: 'VR001',
    reportDisease: 'AWD',
    reportDate: '2026-03-20',
    lastMessage: 'Thank you for the verification. I will monitor the family.',
    lastMessageTime: '2026-03-20 10:15',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        senderId: 'v1',
        senderName: 'Fatima Al-Masri',
        senderRole: 'volunteer',
        text: 'I submitted a report for AWD affecting 3 family members. They are showing severe dehydration.',
        timestamp: '2026-03-20 09:25'
      },
      {
        id: 'm2',
        senderId: 's1',
        senderName: 'Ahmed Hassan',
        senderRole: 'supervisor',
        text: 'Received. Have they been referred to the health facility?',
        timestamp: '2026-03-20 09:32'
      },
      {
        id: 'm3',
        senderId: 'v1',
        senderName: 'Fatima Al-Masri',
        senderRole: 'volunteer',
        text: 'Yes, they were taken to the clinic 30 minutes ago. All three are receiving ORS.',
        timestamp: '2026-03-20 09:45'
      },
      {
        id: 'm4',
        senderId: 's1',
        senderName: 'Ahmed Hassan',
        senderRole: 'supervisor',
        text: 'Excellent work. I have verified your report. Please follow up with the family tomorrow and let me know their status.',
        timestamp: '2026-03-20 10:05'
      },
      {
        id: 'm5',
        senderId: 'v1',
        senderName: 'Fatima Al-Masri',
        senderRole: 'volunteer',
        text: 'Thank you for the verification. I will monitor the family.',
        timestamp: '2026-03-20 10:15'
      }
    ]
  },
  {
    id: 'conv2',
    volunteerId: 'v2',
    volunteerName: 'Omar Ibrahim',
    reportId: 'VR002',
    reportDisease: 'Measles',
    reportDate: '2026-03-20',
    lastMessage: 'Should I also check the siblings for symptoms?',
    lastMessageTime: '2026-03-20 11:30',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'v2',
        senderName: 'Omar Ibrahim',
        senderRole: 'volunteer',
        text: 'I have identified a suspected measles case - child with rash, fever, and red eyes for 4 days.',
        timestamp: '2026-03-20 08:20'
      },
      {
        id: 'm2',
        senderId: 's1',
        senderName: 'Ahmed Hassan',
        senderRole: 'supervisor',
        text: 'This is priority surveillance. Has the child been vaccinated? Please isolate immediately.',
        timestamp: '2026-03-20 08:45'
      },
      {
        id: 'm3',
        senderId: 'v2',
        senderName: 'Omar Ibrahim',
        senderRole: 'volunteer',
        text: 'Parents say vaccination records were lost during displacement. Child is now isolated at home.',
        timestamp: '2026-03-20 11:15'
      },
      {
        id: 'm4',
        senderId: 'v2',
        senderName: 'Omar Ibrahim',
        senderRole: 'volunteer',
        text: 'Should I also check the siblings for symptoms?',
        timestamp: '2026-03-20 11:30'
      }
    ]
  },
  {
    id: 'conv3',
    volunteerId: 'v3',
    volunteerName: 'Layla Hassan',
    reportId: 'VR003',
    reportDisease: 'SARI',
    reportDate: '2026-03-19',
    lastMessage: 'Report verified, thank you',
    lastMessageTime: '2026-03-19 18:25',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        senderId: 'v3',
        senderName: 'Layla Hassan',
        senderRole: 'volunteer',
        text: 'Two elderly patients with severe respiratory symptoms. Both have high fever and difficulty breathing.',
        timestamp: '2026-03-19 16:50'
      },
      {
        id: 'm2',
        senderId: 's1',
        senderName: 'Ahmed Hassan',
        senderRole: 'supervisor',
        text: 'Report verified, thank you',
        timestamp: '2026-03-19 18:25'
      }
    ]
  }
];

const quickReplies = [
  'Please provide more details',
  'Report verified, thank you',
  'Please re-submit with corrections',
  'Refer patient to health facility immediately'
];

export function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showReportPanel, setShowReportPanel] = useState(false);

  const filteredConversations = conversations.filter(conv =>
    conv.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.reportDisease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    console.log('Sending message:', messageText);
    setMessageText('');
  };

  const handleQuickReply = (text: string) => {
    setMessageText(text);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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
  };

  if (selectedConversation) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedConversation(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>

        <Card>
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {selectedConversation.volunteerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedConversation.volunteerName}</h3>
                  <p className="text-sm text-gray-500">
                    Re: {selectedConversation.reportDisease} Report — {new Date(selectedConversation.reportDate).toLocaleDateString()}
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
              {selectedConversation.messages.map((message, idx) => {
                const isVolunteer = message.senderRole === 'volunteer';
                const showDateSeparator = idx === 0 ||
                  new Date(message.timestamp).toDateString() !==
                  new Date(selectedConversation.messages[idx - 1].timestamp).toDateString();

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                          {new Date(message.timestamp).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isVolunteer ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-md ${isVolunteer ? 'mr-auto' : 'ml-auto'}`}>
                        <div className={`rounded-lg p-3 ${
                          isVolunteer ? 'bg-gray-100' : 'bg-teal-600 text-white'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${isVolunteer ? 'text-left' : 'text-right'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                <h4 className="font-medium">Linked Report Summary</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowReportPanel(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report ID:</span>
                  <span className="font-medium">{selectedConversation.reportId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disease:</span>
                  <span className="font-medium">{selectedConversation.reportDisease}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">{new Date(selectedConversation.reportDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Communicate with volunteers about their reports</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by volunteer name or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredConversations.map(conv => (
          <Card
            key={conv.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedConversation(conv)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {conv.volunteerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {conv.volunteerName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-red-500">{conv.unreadCount}</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 truncate mb-2">{conv.lastMessage}</p>

                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {conv.reportDisease} Report
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? `No conversations found matching "${searchTerm}"`
                : 'No messages yet — conversations appear when volunteers message about their reports'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
