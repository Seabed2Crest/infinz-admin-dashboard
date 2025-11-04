import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  IndianRupee,
  Grid3X3,
  List,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import config from "@/config/env";

const Users = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Export modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [applyFilters, setApplyFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [exportFilters, setExportFilters] = useState({
    status: [] as string[],
    city: [] as string[],
    loanType: [] as string[],
    platformOrigin: [] as string[],
    fromDate: "",
    toDate: "",
  });

  // Fetch users from backend
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
    retry: 2,
  });

  const users = usersData?.data?.users || [];

  const downloadFile = async (url: string, filename: string) => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("adminToken");

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
        city: [],
        loanType: [],
        platformOrigin: [],
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
    let url = `https://backend.infinz.seabed2crest.com/api/v1/admin/export/leads`;

    if (applyFilters) {
      const params = new URLSearchParams();

      // Add multiple status values
      if (exportFilters.status.length > 0) {
        exportFilters.status.forEach((status) => {
          params.append("status", status);
        });
      }

      // Add multiple city values
      if (exportFilters.city.length > 0) {
        exportFilters.city.forEach((city) => {
          params.append("city", city);
        });
      }

      // Add multiple loan type values
      if (exportFilters.loanType.length > 0) {
        exportFilters.loanType.forEach((type) => {
          params.append("loanType", type);
        });
      }

      // Add multiple platform origin values
      if (exportFilters.platformOrigin.length > 0) {
        exportFilters.platformOrigin.forEach((platform) => {
          params.append("platformOrigin", platform);
        });
      }

      if (exportFilters.fromDate)
        params.append("fromDate", exportFilters.fromDate);
      if (exportFilters.toDate) params.append("toDate", exportFilters.toDate);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    const filename = `leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadFile(url, filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load users</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      (user.isVerified ? "active" : "inactive") === statusFilter;
    const matchesLocation =
      locationFilter === "all" || user.pinCode === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const locations = [
    ...new Set(users.map((user) => user.pinCode).filter(Boolean)),
  ];

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredUsers.map((user) => (
        <Card key={user._id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/placeholder-${user._id}.jpg`} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {user.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.fullName || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user.email || "No email"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.phoneNumber || "No phone"}
                  </p>
                </div>
              </div>
              <Badge
                className={getStatusColor(
                  user.isVerified ? "active" : "inactive"
                )}
              >
                {user.isVerified ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {user.pinCode || "Unknown"}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <IndianRupee className="h-4 w-4 mr-2" />
                {user.role || "user"}
              </div>
              <div className="text-sm text-gray-600">
                {(user.platform || user.origin || "unknown").toString()}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/user-details/${user._id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Pin Code</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
          <TableRow key={user._id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder-${user._id}.jpg`} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {user.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.fullName}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm">{user.email}</p>
                <p className="text-sm text-gray-500">{user.phoneNumber}</p>
              </div>
            </TableCell>
            <TableCell>{user.pinCode}</TableCell>
            <TableCell>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Unknown"}
            </TableCell>
            <TableCell>
              <Badge
                className={getStatusColor(
                  user.isVerified ? "active" : "inactive"
                )}
              >
                {user.isVerified ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="capitalize">
              {user.platform || user.origin || "unknown"}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/user-details/${user._id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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
                  Export Leads to Excel
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
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="space-y-2">
                      {["new", "contacted", "approved", "rejected"].map(
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

                  {/* Loan Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Loan Type
                    </label>
                    <div className="space-y-2">
                      {["personal", "business"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`loanType-${type}`}
                            checked={exportFilters.loanType.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFilters({
                                  ...exportFilters,
                                  loanType: [...exportFilters.loanType, type],
                                });
                              } else {
                                setExportFilters({
                                  ...exportFilters,
                                  loanType: exportFilters.loanType.filter(
                                    (t) => t !== type
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`loanType-${type}`}
                            className="text-sm text-gray-700 cursor-pointer capitalize"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Origin Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Platform Origin
                    </label>
                    <div className="space-y-2">
                      {["web", "android", "ios"].map((platform) => (
                        <div
                          key={platform}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`platform-${platform}`}
                            checked={exportFilters.platformOrigin.includes(
                              platform
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFilters({
                                  ...exportFilters,
                                  platformOrigin: [
                                    ...exportFilters.platformOrigin,
                                    platform,
                                  ],
                                });
                              } else {
                                setExportFilters({
                                  ...exportFilters,
                                  platformOrigin:
                                    exportFilters.platformOrigin.filter(
                                      (p) => p !== platform
                                    ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`platform-${platform}`}
                            className="text-sm text-gray-700 cursor-pointer capitalize"
                          >
                            {platform}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      City (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter city name"
                      value={exportFilters.city[0] || ""}
                      onChange={(e) =>
                        setExportFilters({
                          ...exportFilters,
                          city: e.target.value ? [e.target.value] : [],
                        })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Leave empty to include all cities
                    </p>
                  </div>

                  {/* Date Range */}
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600">Manage and monitor all leads</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "card" | "table")
            }
          >
            <ToggleGroupItem value="card" aria-label="Card view">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-6">
          {viewMode === "card" ? renderCardView() : renderTableView()}
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              No users found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Users;
