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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Calendar,
  Grid3X3,
  List,
  Loader2,
  Download,
} from "lucide-react";
import { adminApi } from "@/lib/api";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Fetch users from API
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

  // ✅ Moved here to prevent "Cannot access before initialization" error
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Filters
  const filteredUsers = users.filter((user: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      user.mobileNumber?.toLowerCase().includes(term) ||
      user.source?.toLowerCase().includes(term) ||
      user.businessType?.toLowerCase().includes(term) ||
      user.loanPurpose?.toLowerCase().includes(term) ||
      user.employmentType?.toLowerCase().includes(term) ||
      user.userName?.toLowerCase().includes(term) ||
      user.companyOrBusinessName?.toLowerCase().includes(term);

    const matchesSource =
      sourceFilter === "all" ||
      user.source?.toLowerCase().includes(sourceFilter.toLowerCase());

    const matchesPlatform =
      platformFilter === "all" ||
      user.platform?.toLowerCase() === platformFilter.toLowerCase();

    // Age filter logic
    let matchesAge = true;
    if (ageFilter !== "all" && user.dateOfBirth) {
      const age = calculateAge(user.dateOfBirth);
      if (age !== null) {
        switch (ageFilter) {
          case "23-25":
            matchesAge = age >= 23 && age <= 25;
            break;
          case "26-35":
            matchesAge = age >= 26 && age <= 35;
            break;
          case "36-45":
            matchesAge = age >= 36 && age <= 45;
            break;
          case "46-60":
            matchesAge = age >= 46 && age <= 60;
            break;
          case "60+":
            matchesAge = age > 60;
            break;
          default:
            matchesAge = true;
        }
      } else {
        matchesAge = false;
      }
    } else if (ageFilter !== "all" && !user.dateOfBirth) {
      matchesAge = false;
    }

    return matchesSearch && matchesSource && matchesPlatform && matchesAge;
  });

  const getSourceColor = (source: string) => {
    if (source?.includes("personal")) return "bg-blue-100 text-blue-800";
    if (source?.includes("business")) return "bg-purple-100 text-purple-800";
    if (source === "android" || source === "ios")
      return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredUsers.map((user: any) => {
        const age = calculateAge(user.dateOfBirth);

        return (
          <Card
            key={user._id}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden"
          >
            <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-11 w-11 border border-gray-300">
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                    {user.userName
                      ? user.userName.substring(0, 2).toUpperCase()
                      : user.mobileNumber
                      ? user.mobileNumber.substring(0, 2)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">
                    {user.userName || user.mobileNumber || "No Number"}
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {user.companyOrBusinessName || user.businessType || "Lead"}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${getSourceColor(
                  user.source || ""
                )} border-0 capitalize`}
              >
                {user.source?.replace(/_/g, " ").replace("website", "") ||
                  "N/A"}
              </Badge>
            </div>

            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p className="text-gray-500">Mobile</p>
                <p className="text-gray-800 font-medium">
                  {user.mobileNumber || "N/A"}
                </p>

                {user.userName && (
                  <>
                    <p className="text-gray-500">Name</p>
                    <p className="text-gray-800 font-medium">{user.userName}</p>
                  </>
                )}

                {age !== null && (
                  <>
                    <p className="text-gray-500">Age</p>
                    <p className="text-gray-800 font-medium">{age} years</p>
                  </>
                )}

                {user.employmentType && (
                  <>
                    <p className="text-gray-500">Employment</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {user.employmentType.replace(/-/g, " ")}
                    </p>
                  </>
                )}

                {user.loanPurpose && (
                  <>
                    <p className="text-gray-500">Loan Purpose</p>
                    <p className="text-gray-800 font-medium">
                      {user.loanPurpose}
                    </p>
                  </>
                )}

                {user.status && (
                  <>
                    <p className="text-gray-500">Status</p>
                    <Badge
                      variant="outline"
                      className={`${
                        user.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : user.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      } border-0 capitalize w-fit`}
                    >
                      {user.status}
                    </Badge>
                  </>
                )}

                <p className="text-gray-500">Platform</p>
                <p className="text-gray-800 font-medium capitalize">
                  {user.platform || "web"}
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Mobile</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user: any) => {
            const age = calculateAge(user.dateOfBirth);
            return (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  {user.userName || user.mobileNumber || "N/A"}
                </TableCell>
                <TableCell>{age !== null ? `${age} years` : "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getSourceColor(
                      user.source || ""
                    )} border-0 capitalize text-xs`}
                  >
                    {user.source?.replace(/_/g, " ").replace("website", "") ||
                      "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.status ? (
                    <Badge
                      variant="outline"
                      className={`${
                        user.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : user.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      } border-0 capitalize text-xs`}
                    >
                      {user.status}
                    </Badge>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell className="capitalize">
                  {user.platform || "web"}
                </TableCell>
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600">Manage and monitor all leads</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
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
            placeholder="Search by mobile, name, purpose..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="personal">Personal Loan</SelectItem>
            <SelectItem value="business">Business Loan</SelectItem>
            <SelectItem value="android">Android App</SelectItem>
            <SelectItem value="ios">iOS App</SelectItem>
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

        <Select value={ageFilter} onValueChange={setAgeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Age Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="23-25">23-25 years</SelectItem>
            <SelectItem value="26-35">26-35 years</SelectItem>
            <SelectItem value="36-45">36-45 years</SelectItem>
            <SelectItem value="46-60">46-60 years</SelectItem>
            <SelectItem value="60+">60+ years</SelectItem>
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
          ) : error ? (
            <div className="text-center py-20 text-red-500">
              Error loading users. Please try again.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No leads found matching your filters
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
