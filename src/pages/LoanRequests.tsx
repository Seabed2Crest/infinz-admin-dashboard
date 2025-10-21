import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Eye, IndianRupee, Calendar, User, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

const LoanRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountRange, setAmountRange] = useState('all');

  // Fetch loan requests from API
  const { data: loansData, isLoading: loansLoading, error: loansError } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: () => adminApi.getLoans(),
    retry: 2,
  });

  const loanRequests = (loansData?.data as any)?.loanRequests || [];

  const filteredRequests = loanRequests.filter(request => {
    const matchesSearch = (request.userId?.fullName || 'Unknown').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    let matchesAmount = true;
    if (amountRange !== 'all') {
      const [min, max] = amountRange.split('-').map(Number);
      const amount = parseFloat(request.desiredAmount) || 0;
      matchesAmount = amount >= min && (max ? amount <= max : true);
    }
    
    return matchesSearch && matchesStatus && matchesAmount;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleApprove = (requestId: string) => {
    console.log('Approving request:', requestId);
    // Handle approval logic here
  };

  const handleReject = (requestId: string) => {
    console.log('Rejecting request:', requestId);
    // Handle rejection logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline">Export Data</Button>
          <Button>Bulk Actions</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {loansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : loanRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {loansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : loanRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {loansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : loanRequests.filter(r => r.status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {loansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    `₹${(loanRequests.reduce((sum, loan) => sum + (parseFloat(loan.desiredAmount) || 0), 0) / 100000).toFixed(1)}L`
                  }
                </p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={amountRange} onValueChange={setAmountRange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="0-10000">₹0 - ₹10k</SelectItem>
                <SelectItem value="10000-20000">₹10k - ₹20k</SelectItem>
                <SelectItem value="20000-50000">₹20k - ₹50k</SelectItem>
                <SelectItem value="50000">₹50k+</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loan Requests List */}
      {loansLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading loan requests...</span>
        </div>
      ) : loansError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-500">Failed to load loan requests. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {(request.userId?.fullName || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.userId?.fullName || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-600">{request.employmentType}</p>
                      <p className="text-2xl font-bold text-blue-600">₹{parseFloat(request.desiredAmount || '0').toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Employment Type</p>
                    <p className="font-medium capitalize">{request.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="font-medium">₹{request.netMonthlyIncome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{request.companyOrBusinessName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <p className="font-medium">{request.paymentMode || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request._id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(request._id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loansLoading && !loansError && filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No loan requests found matching your criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Total requests in database: {loanRequests.length}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoanRequests;