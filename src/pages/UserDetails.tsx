import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, Download, Eye, CheckCircle, XCircle, Clock, IndianRupee, Grid3X3, List, User, Mail, Phone, MapPin, Calendar, Shield, Briefcase, Building, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { adminApi, userApi, employmentApi } from '@/lib/api';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Fetch user details
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user-details', userId],
    queryFn: () => adminApi.getUsers().then(data => {
      const user = data.data.users.find(u => u._id === userId);
      return user ? { data: { user } } : null;
    }),
    enabled: !!userId,
    retry: 2,
  });

  // Fetch user's employment details (if available)
  const { data: employmentData, isLoading: employmentLoading } = useQuery({
    queryKey: ['employment-details', userId],
    queryFn: () => employmentApi.getForUser(userId),
    enabled: !!userId,
    retry: 2,
  });

  // Fetch user's loan requests
  const { data: loansData, isLoading: loansLoading } = useQuery({
    queryKey: ['user-loans', userId],
    queryFn: () => adminApi.getLoans().then(data => {
      // Filter loans for this specific user (you might need to adjust this based on your data structure)
      return data.data.filter(loan => loan.userId === userId);
    }),
    enabled: !!userId,
    retry: 2,
  });

  const user = userData?.data?.user;
  const employment = employmentData?.data;
  const loans = loansData || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationStatus = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Not Verified
      </Badge>
    );
  };

  const getEmploymentTypeIcon = (type: string) => {
    switch (type) {
      case 'salaried':
        return <User className="h-5 w-5" />;
      case 'self-employed':
        return <Briefcase className="h-5 w-5" />;
      case 'business-owner':
        return <Building className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'salaried':
        return 'bg-blue-100 text-blue-800';
      case 'self-employed':
        return 'bg-green-100 text-green-800';
      case 'business-owner':
        return 'bg-purple-100 text-purple-800';
      case 'unemployed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: string | number) => {
    return `₹${parseInt(amount.toString()).toLocaleString()}`;
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user details...</span>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load user details</p>
          <Button onClick={() => navigate('/users')}>Back to Users</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">Complete user profile and information</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="employment">Employment Details</TabsTrigger>
          <TabsTrigger value="loans">Loan History</TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-lg">
                        {getInitials(user.fullName || 'Unknown User')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user.fullName || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                      {getVerificationStatus(user.isVerified)}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.phoneNumber || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Pincode: {user.pinCode || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">DOB: {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Unknown'}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Role:</span>
                      <Badge variant="outline">{user.role?.toUpperCase() || 'USER'}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Auth Provider:</span>
                      <Badge variant="outline">{user.authProvider?.replace('-', ' ').toUpperCase() || 'PHONE'}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gender:</span>
                      <span className="capitalize">{user.gender || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Marital Status:</span>
                      <span className="capitalize">{user.maritalStatus || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PAN Card:</span>
                      <span className="font-mono text-xs">{user.pancardNumber || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {loans.length}
                    </p>
                    <p className="text-sm text-blue-600">Total Loan Requests</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {loans.filter(loan => loan.status?.toLowerCase() === 'approved').length}
                    </p>
                    <p className="text-sm text-green-600">Approved Loans</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {loans.filter(loan => loan.status?.toLowerCase() === 'pending').length}
                    </p>
                    <p className="text-sm text-yellow-600">Pending Loans</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {loans.length}
                    </p>
                    <p className="text-sm text-purple-600">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employment Details Tab */}
        <TabsContent value="employment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Employment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Current Employment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employmentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading employment details...</span>
                  </div>
                ) : employment ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getEmploymentTypeIcon(employment.employmentType)}
                      <Badge className={getEmploymentTypeColor(employment.employmentType)}>
                        {employment.employmentType.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Income</p>
                      <p className="text-lg font-semibold">₹{employment.netMonthlyIncome}</p>
                    </div>
                    {employment.companyOrBusinessName && (
                      <div>
                        <p className="text-sm text-gray-600">Company/Business</p>
                        <p className="font-medium">{employment.companyOrBusinessName}</p>
                      </div>
                    )}
                    {employment.companyPinCode && (
                      <div>
                        <p className="text-sm text-gray-600">Company Pincode</p>
                        <p className="font-medium">{employment.companyPinCode}</p>
                      </div>
                    )}
                    {employment.paymentMode && (
                      <div>
                        <p className="text-sm text-gray-600">Payment Mode</p>
                        <p className="font-medium capitalize">{employment.paymentMode.replace('-', ' ')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No employment details available</p>
                    <p className="text-sm text-gray-400">User hasn't provided employment information</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
                <CardDescription>
                  Detailed employment and income information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employment Type</label>
                        <p className="capitalize">{employment.employmentType.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Net Monthly Income</label>
                        <p className="text-lg font-semibold">₹{employment.netMonthlyIncome}</p>
                      </div>
                      {employment.employmentType === 'salaried' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Company Name</label>
                            <p>{employment.companyOrBusinessName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Company Pincode</label>
                            <p>{employment.companyPinCode || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Payment Mode</label>
                            <p className="capitalize">{employment.paymentMode?.replace('-', ' ') || 'Not specified'}</p>
                          </div>
                          {employment.salarySlipDocument && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Salary Slip Document</label>
                              <p className="text-sm text-blue-600">Document uploaded</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No employment information available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loan History Tab */}
        <TabsContent value="loans" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Loan History</CardTitle>
                  <CardDescription>Complete loan application and repayment history</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'card' | 'table')}>
                    <ToggleGroupItem value="card" aria-label="Card view">
                      <Grid3X3 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="table" aria-label="Table view">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading loan history...</span>
                </div>
              ) : loans.length > 0 ? (
                viewMode === 'card' ? (
                  <div className="space-y-4">
                    {loans.map((loan, index) => (
                      <div key={loan._id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">Loan Application #{index + 1}</h4>
                              <p className="text-sm text-gray-600">Applied on {loan.createdAt ? formatDate(loan.createdAt) : 'Unknown date'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(loan.status)}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <label className="font-medium text-gray-500">Amount</label>
                            <p className="text-lg font-semibold">{formatCurrency(loan.amount || 0)}</p>
                          </div>
                          <div>
                            <label className="font-medium text-gray-500">Applied Date</label>
                            <p>{loan.createdAt ? formatDate(loan.createdAt) : 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="font-medium text-gray-500">Status</label>
                            <p>{loan.status || 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="font-medium text-gray-500">Last Updated</label>
                            <p>{loan.updatedAt ? formatDate(loan.updatedAt) : 'Unknown'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan, index) => (
                        <TableRow key={loan._id || index}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{formatCurrency(loan.amount || 0)}</TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell>{loan.createdAt ? formatDate(loan.createdAt) : 'Unknown'}</TableCell>
                          <TableCell>{loan.updatedAt ? formatDate(loan.updatedAt) : 'Unknown'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              ) : (
                <div className="text-center py-8">
                  <IndianRupee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No loan applications found</p>
                  <p className="text-sm text-gray-400">This user hasn't applied for any loans yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetails;