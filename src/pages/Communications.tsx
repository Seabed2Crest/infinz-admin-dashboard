
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Phone, Plus, Send, Users, Calendar, Edit, Trash2 } from 'lucide-react';

const Communications = () => {
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    userType: 'all'
  });

  const templates = [
    {
      id: 1,
      name: 'Loan Approval',
      type: 'email',
      subject: 'Your loan has been approved!',
      content: 'Congratulations! Your loan application has been approved...',
      userType: 'all',
      createdDate: '2024-01-10'
    },
    {
      id: 2,
      name: 'Payment Reminder',
      type: 'sms',
      subject: '',
      content: 'Hi {name}, your payment of ₹{amount} is due on {date}. Please make payment to avoid late fees.',
      userType: 'active',
      createdDate: '2024-01-08'
    },
    {
      id: 3,
      name: 'Welcome Message',
      type: 'whatsapp',
      subject: '',
      content: 'Welcome to our loan service! We\'re here to help you achieve your financial goals.',
      userType: 'new',
      createdDate: '2024-01-05'
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Monthly Newsletter',
      type: 'email',
      recipients: 2847,
      sent: 2840,
      opened: 1420,
      clicked: 284,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: 2,
      name: 'Payment Reminders',
      type: 'sms',
      recipients: 156,
      sent: 156,
      opened: 145,
      clicked: 0,
      status: 'completed',
      date: '2024-01-14'
    },
    {
      id: 3,
      name: 'New Product Launch',
      type: 'whatsapp',
      recipients: 500,
      sent: 0,
      opened: 0,
      clicked: 0,
      status: 'scheduled',
      date: '2024-01-20'
    }
  ];

  const handleCreateTemplate = () => {
    console.log('Creating template:', newTemplate);
    // Handle template creation logic here
    setNewTemplate({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      userType: 'all'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communications</h2>
          <p className="text-gray-600">Manage templates and send communications to users</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Created on {template.createdDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(template.type)}>
                        {getTypeIcon(template.type)}
                        <span className="ml-1">{template.type}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.subject && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Subject:</p>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Content:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {template.userType} users
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{campaign.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={getTypeColor(campaign.type)}>
                          {getTypeIcon(campaign.type)}
                          <span className="ml-1">{campaign.type}</span>
                        </Badge>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {campaign.date}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{campaign.recipients}</p>
                      <p className="text-sm text-gray-600">Recipients</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{campaign.sent}</p>
                      <p className="text-sm text-gray-600">Sent</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{campaign.opened}</p>
                      <p className="text-sm text-gray-600">Opened</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{campaign.clicked}</p>
                      <p className="text-sm text-gray-600">Clicked</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </Button>
                    <Button size="sm" variant="outline">
                      View Report
                    </Button>
                    {campaign.status === 'scheduled' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    placeholder="Enter template name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateType">Communication Type</Label>
                  <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">Target Users</Label>
                <Select value={newTemplate.userType} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, userType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="new">New Users</SelectItem>
                    <SelectItem value="last-month">Last Month Active</SelectItem>
                    <SelectItem value="last-2-months">Last 2 Months Active</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newTemplate.type === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your message content. Use {name}, {amount}, {date} for dynamic values"
                  rows={6}
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                />
                <p className="text-sm text-gray-600">
                  Available variables: {'{name}'}, {'{amount}'}, {'{date}'}, {'{loan_id}'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communications;
