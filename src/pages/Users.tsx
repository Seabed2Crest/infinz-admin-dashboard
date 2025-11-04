import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Eye,
  Calendar,
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

  const allFields = [
    "businessType",
    "turnover",
    "loanAmount",
    "mobileNumber",
    "emiTenure",
    "platform",
    "createdAt",
    "updatedAt",
    "loanPurpose",
    "monthlyIncome",
    "loanAmountRequired",
    "userId",
    "userName",
    "employmentType",
    "netMonthlyIncome",
    "paymentMode",
    "companyOrBusinessName",
    "companyPinCode",
    "salarySlipDocument",
    "desiredAmount",
    "status",
  ];

  const [selectedFields, setSelectedFields] = useState<string[]>([
    "mobileNumber",
    "loanAmount",
    "status",
  ]);

  const [exportFilters, setExportFilters] = useState({
    platformOrigin: [] as string[],
    fromDate: "",
    toDate: "",
  });

  // Fetch users
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

  // Download Excel
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

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      setExportModalOpen(false);
      setApplyFilters(false);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    let url = `http://localhost:8085/api/v1/admin/export/leads`;
    const params = new URLSearchParams();

    // Add selected fields
    if (selectedFields.length > 0)
      params.append("fields", selectedFields.join(","));

    // Add filters if applied
    if (applyFilters) {
      if (exportFilters.platformOrigin.length > 0)
        exportFilters.platformOrigin.forEach((p) =>
          params.append("platformOrigin", p)
        );

      if (exportFilters.fromDate)
        params.append("fromDate", exportFilters.fromDate);
      if (exportFilters.toDate) params.append("toDate", exportFilters.toDate);
    }

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const filename = `leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadFile(url, filename);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load users</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      user.mobileNumber?.toLowerCase().includes(term) ||
      user.source?.toLowerCase().includes(term) ||
      user.businessType?.toLowerCase().includes(term) ||
      user.loanPurpose?.toLowerCase().includes(term) ||
      user.employmentType?.toLowerCase().includes(term) ||
      user.fullName?.toLowerCase().includes(term);

    return matchesSearch;
  });

  const getStatusColor = (status: string) =>
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredUsers.map((user) => {
        const leadType = user.businessType
          ? "Business"
          : user.loanPurpose
          ? "Personal"
          : user.employmentType
          ? "App"
          : "Unknown";

        return (
          <Card
            key={user._id}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-11 w-11 border border-gray-300">
                  <AvatarImage src={`/placeholder-${user._id}.jpg`} />
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                    {user.mobileNumber
                      ? user.mobileNumber.substring(0, 2).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">
                    {user.mobileNumber || user.userId?.slice(-6) || "Unknown"}
                  </h3>
                  <p className="text-gray-600 text-xs capitalize">
                    {user.source
                      ? user.source.replace(/_/g, " ")
                      : user.companyOrBusinessName || "Direct App User"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`${
                    user.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : user.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  } border-none font-medium`}
                >
                  {user.status || "N/A"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gray-300 text-gray-700 capitalize"
                >
                  {leadType}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {/* Business Fields */}
                {user.businessType && (
                  <>
                    <p className="text-gray-500">Business Type</p>
                    <p className="text-gray-800 font-medium">
                      {user.businessType}
                    </p>

                    <p className="text-gray-500">Turnover</p>
                    <p className="text-gray-800 font-medium">{user.turnover}</p>
                  </>
                )}

                {/* Personal Loan Fields */}
                {user.loanPurpose && (
                  <>
                    <p className="text-gray-500">Loan Purpose</p>
                    <p className="text-gray-800 font-medium">
                      {user.loanPurpose}
                    </p>

                    <p className="text-gray-500">Monthly Income</p>
                    <p className="text-gray-800 font-medium">
                      {user.monthlyIncome}
                    </p>
                  </>
                )}

                {/* App Fields */}
                {user.employmentType && (
                  <>
                    <p className="text-gray-500">Employment Type</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {user.employmentType}
                    </p>

                    <p className="text-gray-500">Net Monthly Income</p>
                    <p className="text-gray-800 font-medium">
                      {user.netMonthlyIncome}
                    </p>

                    <p className="text-gray-500">Payment Mode</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {user.paymentMode}
                    </p>
                  </>
                )}

                {/* Common Fields */}
                <p className="text-gray-500">Loan Amount</p>
                <p className="text-gray-800 font-medium">
                  {user.loanAmount ||
                    user.loanAmountRequired ||
                    user.desiredAmount ||
                    "N/A"}
                </p>

                <p className="text-gray-500">EMI Tenure</p>
                <p className="text-gray-800 font-medium">
                  {user.emiTenure || "N/A"}
                </p>

                <p className="text-gray-500">Platform</p>
                <p className="text-gray-800 font-medium capitalize">
                  {user.platform || "web"}
                </p>

                <p className="text-gray-500">Pincode</p>
                <p className="text-gray-800 font-medium">
                  {user.companyPinCode || "N/A"}
                </p>

                <p className="text-gray-500">Created At</p>
                <p className="text-gray-800 font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mobile</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Loan Amount</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
          <TableRow key={user._id}>
            <TableCell>{user.mobileNumber || "N/A"}</TableCell>
            <TableCell>
              {user.businessType
                ? "Business"
                : user.loanPurpose
                ? "Personal"
                : user.employmentType
                ? "App"
                : "Unknown"}
            </TableCell>
            <TableCell>
              {user.loanAmount ||
                user.loanAmountRequired ||
                user.desiredAmount ||
                "N/A"}
            </TableCell>
            <TableCell>{user.platform || "web"}</TableCell>
            <TableCell>
              <Badge>{user.status || "N/A"}</Badge>
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

      {/* Users List */}
      <Card>
        <CardContent className="p-6">
          {viewMode === "card" ? renderCardView() : renderTableView()}
        </CardContent>
      </Card>

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
                  Select fields to include and apply filters if needed
                </p>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Select All */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedFields.length === allFields.length}
                  onChange={(e) =>
                    setSelectedFields(e.target.checked ? allFields : [])
                  }
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700"
                >
                  Select All Fields
                </label>
              </div>

              {/* Field Checkboxes */}
              <div className="grid grid-cols-2 gap-2">
                {allFields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`field-${field}`}
                      checked={selectedFields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedFields([...selectedFields, field]);
                        else
                          setSelectedFields(
                            selectedFields.filter((f) => f !== field)
                          );
                      }}
                    />
                    <label
                      htmlFor={`field-${field}`}
                      className="text-sm text-gray-700 capitalize"
                    >
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="border-t pt-4 mt-4 space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Platform
                </label>
                {["web", "android", "ios"].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`platform-${platform}`}
                      checked={exportFilters.platformOrigin.includes(platform)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...exportFilters.platformOrigin, platform]
                          : exportFilters.platformOrigin.filter(
                              (p) => p !== platform
                            );
                        setExportFilters({
                          ...exportFilters,
                          platformOrigin: updated,
                        });
                      }}
                    />
                    <label
                      htmlFor={`platform-${platform}`}
                      className="text-sm text-gray-700 capitalize"
                    >
                      {platform}
                    </label>
                  </div>
                ))}

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
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
                  <div>
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
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
    </div>
  );
};

export default Users;
