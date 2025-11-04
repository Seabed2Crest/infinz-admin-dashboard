import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Eye,
  IndianRupee,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import config from "@/config/env";
import { downloadCsv } from "@/lib/utils";

const LoanRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountRange, setAmountRange] = useState("all");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [applyFilters, setApplyFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export filter states
  const [exportFilters, setExportFilters] = useState({
    status: [] as string[],
    employmentType: [] as string[],
    fromDate: "",
    toDate: "",
  });

  const downloadFile = async (url: string, filename: string) => {
    try {
      setIsExporting(true);

      // Get the token from localStorage or wherever you store it
      const token = localStorage.getItem("adminToken"); // Adjust this based on where you store your token

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      setExportModalOpen(false);
      setApplyFilters(false);
      setExportFilters({
        status: [],
        employmentType: [],
        fromDate: "",
        toDate: "",
      });
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    let url = `https://backend.infinz.seabed2crest.com/api/v1/admin/export/loans`;

    if (applyFilters) {
      const params = new URLSearchParams();

      // Add multiple status values
      if (exportFilters.status.length > 0) {
        exportFilters.status.forEach((status) => {
          params.append("status", status);
        });
      }

      // Add multiple employment type values
      if (exportFilters.employmentType.length > 0) {
        exportFilters.employmentType.forEach((type) => {
          params.append("employmentType", type);
        });
      }

      if (exportFilters.fromDate)
        params.append("fromDate", exportFilters.fromDate);
      if (exportFilters.toDate) params.append("toDate", exportFilters.toDate);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    const filename = `loans_${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadFile(url, filename);
  };

  const {
    data: loansData,
    isLoading: loansLoading,
    error: loansError,
  } = useQuery({
    queryKey: ["admin-loans"],
    queryFn: () => adminApi.getLoans(),
    retry: 2,
  });

  const loanRequests = (loansData?.data as any)?.loanRequests || [];

  const filteredRequests = loanRequests.filter((request) => {
    const matchesSearch = (request.userId?.fullName || "Unknown")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    let matchesAmount = true;
    if (amountRange !== "all") {
      const [min, max] = amountRange.split("-").map(Number);
      const amount = parseFloat(request.desiredAmount) || 0;
      matchesAmount = amount >= min && (max ? amount <= max : true);
    }

    return matchesSearch && matchesStatus && matchesAmount;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "reviewing":
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleApprove = (requestId: string) => {
    console.log("Approving request:", requestId);
  };

  const handleReject = (requestId: string) => {
    console.log("Rejecting request:", requestId);
  };

  return (
    <div className="space-y-6">
      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Export Loans to Excel
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose whether to export all data or apply filters
                </p>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isExporting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="apply-filters"
                  checked={applyFilters}
                  onChange={(e) => setApplyFilters(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="apply-filters"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Apply filters to export
                </label>
              </div>

              {applyFilters && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="space-y-2">
                      {["pending", "approved", "rejected", "reviewing"].map(
                        (status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`status-${status}`}
                              checked={exportFilters.status.includes(status)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExportFilters({
                                    ...exportFilters,
                                    status: [...exportFilters.status, status],
                                  });
                                } else {
                                  setExportFilters({
                                    ...exportFilters,
                                    status: exportFilters.status.filter(
                                      (s) => s !== status
                                    ),
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`status-${status}`}
                              className="text-sm text-gray-700 cursor-pointer capitalize"
                            >
                              {status}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Employment Type
                    </label>
                    <div className="space-y-2">
                      {["salaried", "self-employed", "business"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`employment-${type}`}
                            checked={exportFilters.employmentType.includes(
                              type
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFilters({
                                  ...exportFilters,
                                  employmentType: [
                                    ...exportFilters.employmentType,
                                    type,
                                  ],
                                });
                              } else {
                                setExportFilters({
                                  ...exportFilters,
                                  employmentType:
                                    exportFilters.employmentType.filter(
                                      (t) => t !== type
                                    ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`employment-${type}`}
                            className="text-sm text-gray-700 cursor-pointer capitalize"
                          >
                            {type === "self-employed" ? "Self Employed" : type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={exportFilters.fromDate}
                        onChange={(e) =>
                          setExportFilters({
                            ...exportFilters,
                            fromDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={exportFilters.toDate}
                        onChange={(e) =>
                          setExportFilters({
                            ...exportFilters,
                            toDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setExportModalOpen(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

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
                  {loansLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    loanRequests.filter((r) => r.status === "pending").length
                  )}
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
                  {loansLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    loanRequests.filter((r) => r.status === "approved").length
                  )}
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
                  {loansLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    loanRequests.filter((r) => r.status === "rejected").length
                  )}
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
                  {loansLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `₹${(
                      loanRequests.reduce(
                        (sum, loan) =>
                          sum + (parseFloat(loan.desiredAmount) || 0),
                        0
                      ) / 100000
                    ).toFixed(1)}L`
                  )}
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
            <p className="text-red-500">
              Failed to load loan requests. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {(request.userId?.fullName || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.userId?.fullName || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.employmentType}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹
                        {parseFloat(
                          request.desiredAmount || "0"
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Employment Type</p>
                    <p className="font-medium capitalize">
                      {request.employmentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="font-medium">₹{request.netMonthlyIncome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">
                      {request.companyOrBusinessName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <p className="font-medium">
                      {request.paymentMode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="font-medium capitalize">
                      {request.platform || "unknown"}
                    </p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loansLoading && !loansError && filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              No loan requests found matching your criteria.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Total requests in database: {loanRequests.length}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoanRequests;
