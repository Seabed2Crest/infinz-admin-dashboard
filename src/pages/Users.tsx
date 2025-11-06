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

const Users = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
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

  // Filters
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

    const matchesStatus =
      statusFilter === "all" ||
      user.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPlatform =
      platformFilter === "all" ||
      user.platform?.toLowerCase() === platformFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getStatusColor = (status: string) =>
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredUsers.map((user) => (
        <Card
          key={user._id}
          className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-11 w-11 border border-gray-300">
                <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                  {user.fullName
                    ? user.fullName.charAt(0).toUpperCase()
                    : user.phoneNumber
                    ? user.phoneNumber.substring(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-gray-900 font-semibold text-sm capitalize">
                  {user.fullName || "Unnamed User"}
                </h3>
                <p className="text-gray-600 text-xs">
                  {user.email || "No Email"}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-gray-300 text-gray-700 capitalize"
            >
              {user.origin || "N/A"}
            </Badge>
          </div>

          {/* Content */}
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p className="text-gray-500">Phone</p>
              <p className="text-gray-800 font-medium">
                {user.phoneNumber || "N/A"}
              </p>

              <p className="text-gray-500">Email</p>
              <p className="text-gray-800 font-medium">{user.email || "N/A"}</p>

              <p className="text-gray-500">Platform</p>
              <p className="text-gray-800 font-medium capitalize">
                {user.platform?.toLowerCase() || "web"}
              </p>

              <p className="text-gray-500">District</p>
              <p className="text-gray-800 font-medium">
                {(user as any).district || "N/A"}
              </p>

              <p className="text-gray-500">State</p>
              <p className="text-gray-800 font-medium">
                {(user as any).state || "N/A"}
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
      ))}
    </div>
  );

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Full Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Origin</TableHead>
          <TableHead>District</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="capitalize">
              {user.fullName || "N/A"}
            </TableCell>
            <TableCell>{user.phoneNumber || "N/A"}</TableCell>
            <TableCell>{user.email || "N/A"}</TableCell>
            <TableCell className="capitalize">
              {user.platform?.toLowerCase() || "web"}
            </TableCell>
            <TableCell className="capitalize">
              {user.origin?.toLowerCase() || "N/A"}
            </TableCell>
            <TableCell>{(user as any).district || "N/A"}</TableCell>
            <TableCell>{(user as any).state || "N/A"}</TableCell>
            <TableCell>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, mobile, etc..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="android">Android</SelectItem>
            <SelectItem value="ios">iOS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : viewMode === "card" ? (
            renderCardView()
          ) : (
            renderTableView()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
