"use client";
import { useState, useEffect, useRef } from "react";
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
import { Search, Grid3X3, List, Loader2, Download } from "lucide-react";
import { adminApi } from "@/lib/api";
import { ExportModal } from "@/components/ExportModal";

const Users = () => {
  const pincodeRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");
  const [loanAmountRange, setLoanAmountRange] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card"); // 👈 IMPORTANT
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [debouncedPincodeSearch, setDebouncedPincodeSearch] = useState("");

  const [selectedPincode, setSelectedPincode] = useState("");
  const [pincodeDropdownOpen, setPincodeDropdownOpen] = useState(false);

  const limit = 10;

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPincodeSearch(pincodeSearch), 300);
    return () => clearTimeout(t);
  }, [pincodeSearch]);

  // Close Pincode dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pincodeRef.current &&
        !pincodeRef.current.contains(event.target as Node)
      ) {
        setPincodeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch pincodes
  const { data: pincodeData, isLoading: pincodeLoading } = useQuery({
    queryKey: ["pincodes", debouncedPincodeSearch],
    queryFn: () => adminApi.getPincodes(debouncedPincodeSearch),
    enabled: pincodeDropdownOpen,
  });

  const pincodes = pincodeData?.data || [];

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-users",
      debouncedSearch,
      selectedPincode,
      loanTypeFilter,
      platformFilter,
      ageFilter,
      salaryRange,
      loanAmountRange,
      page,
    ],
    queryFn: () =>
      adminApi.getUsers({
        search: debouncedSearch,
        pincode: selectedPincode,
        loanType: loanTypeFilter,
        platform: platformFilter,
        ageRange: ageFilter,
        salaryRange,
        loanAmountRange,
        page,
        limit,
      }),
  });

  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.totalPages || 1;
  const total = usersData?.data?.total || 0;

  // Age Calculator
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  // Loan Type Badge Colors
  const getLoanTypeColor = (loanType: string) => {
    if (loanType === "personal") return "bg-blue-100 text-blue-800";
    if (loanType === "business") return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  // CARD VIEW
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {users.map((user: any) => {
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
                    {user.userName || user.mobileNumber || "N/A"}
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {user.companyOrBusinessName || "Lead"}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${getLoanTypeColor(
                  user.loanType
                )} border-0 capitalize`}
              >
                {user.loanType || "N/A"}
              </Badge>
            </div>

            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p className="text-gray-500">Mobile</p>
                <p className="text-gray-800 font-medium">
                  {user.mobileNumber || "N/A"}
                </p>

                <p className="text-gray-500">Age</p>
                <p className="text-gray-800 font-medium">
                  {age ? `${age} years` : "N/A"}
                </p>

                <p className="text-gray-500">Platform</p>
                <p className="text-gray-800 font-medium capitalize">
                  {user.platform || "N/A"}
                </p>

                <p className="text-gray-500">Loan Purpose</p>
                <p className="text-gray-800 font-medium">
                  {user.loanPurpose || "N/A"}
                </p>

                <p className="text-gray-500">Loan Amount</p>
                <p className="text-gray-800 font-medium">
                  {user.loanAmountRequired || user.desiredAmount || "N/A"}
                </p>

                <p className="text-gray-500">Monthly Income</p>
                <p className="text-gray-800 font-medium">
                  {user.monthlyIncome || user.netMonthlyIncome || "N/A"}
                </p>

                <p className="text-gray-500">EMI Tenure</p>
                <p className="text-gray-800 font-medium">
                  {user.emiTenure || "N/A"}
                </p>

                <p className="text-gray-500">Employment Type</p>
                <p className="text-gray-800 font-medium capitalize">
                  {user.employmentType || "N/A"}
                </p>

                <p className="text-gray-500">Payment Mode</p>
                <p className="text-gray-800 font-medium">
                  {user.paymentMode || "N/A"}
                </p>

                <p className="text-gray-500">Company</p>
                <p className="text-gray-800 font-medium">
                  {user.companyOrBusinessName || "N/A"}
                </p>

                <p className="text-gray-500">Company Pincode</p>
                <p className="text-gray-800 font-medium">
                  {user.companyPinCode || "N/A"}
                </p>

                <p className="text-gray-500">Salary Slip</p>
                <p className="text-gray-800 font-medium">
                  {user.salarySlipDocument ? (
                    <a
                      href={user.salarySlipDocument}
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>

                <p className="text-gray-500">Status</p>
                <Badge
                  variant="outline"
                  className={`${
                    user.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : user.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : user.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  } border-0 text-xs capitalize`}
                >
                  {user.status || "N/A"}
                </Badge>

                <p className="text-gray-500">Created At</p>
                <p className="text-gray-800 font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "N/A"}
                </p>

                <p className="text-gray-500">Updated At</p>
                <p className="text-gray-800 font-medium">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // TABLE VIEW
  const renderTableView = () => (
    <div className="w-full overflow-x-auto border rounded-lg">
      <Table className="min-w-[2200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Name / Mobile</TableHead>
            <TableHead className="min-w-[120px]">Loan Type</TableHead>
            <TableHead className="min-w-[200px]">Loan Purpose</TableHead>
            <TableHead className="min-w-[160px]">Monthly Income</TableHead>
            <TableHead className="min-w-[160px]">
              Loan Amount Required
            </TableHead>
            <TableHead className="min-w-[140px]">EMI Tenure</TableHead>
            <TableHead className="min-w-[160px]">Employment Type</TableHead>
            <TableHead className="min-w-[160px]">Net Monthly Income</TableHead>
            <TableHead className="min-w-[150px]">Payment Mode</TableHead>
            <TableHead className="min-w-[220px]">Company Name</TableHead>
            <TableHead className="min-w-[130px]">Company Pincode</TableHead>
            <TableHead className="min-w-[130px]">Salary Slip</TableHead>
            <TableHead className="min-w-[120px]">Status</TableHead>
            <TableHead className="min-w-[120px]">Platform</TableHead>
            <TableHead className="min-w-[100px]">Age</TableHead>
            <TableHead className="min-w-[160px]">Created At</TableHead>
            <TableHead className="min-w-[160px]">Updated At</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user: any) => {
            const age = calculateAge(user.dateOfBirth);

            return (
              <TableRow key={user._id} className="hover:bg-gray-50 transition">
                <TableCell>
                  {user.userName || user.mobileNumber || "N/A"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getLoanTypeColor(
                      user.loanType
                    )} border-0 text-xs capitalize`}
                  >
                    {user.loanType || "N/A"}
                  </Badge>
                </TableCell>

                <TableCell>{user.loanPurpose || "N/A"}</TableCell>
                <TableCell>{user.monthlyIncome || "N/A"}</TableCell>
                <TableCell>{user.loanAmountRequired || "N/A"}</TableCell>
                <TableCell>{user.emiTenure || "N/A"}</TableCell>
                <TableCell>{user.employmentType || "N/A"}</TableCell>
                <TableCell>{user.netMonthlyIncome || "N/A"}</TableCell>
                <TableCell>{user.paymentMode || "N/A"}</TableCell>
                <TableCell>{user.companyOrBusinessName || "N/A"}</TableCell>
                <TableCell>{user.companyPinCode || "N/A"}</TableCell>

                <TableCell>
                  {user.salarySlipDocument ? (
                    <a
                      href={user.salarySlipDocument}
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${
                      user.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : user.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : user.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    } border-0 text-xs capitalize`}
                  >
                    {user.status || "N/A"}
                  </Badge>
                </TableCell>

                <TableCell>{user.platform || "N/A"}</TableCell>
                <TableCell>{age ? `${age} years` : "N/A"}</TableCell>
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  // Export
  const handleFilteredExport = async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

      const params = {
        search: debouncedSearch,
        pincode: selectedPincode,
        loanType: loanTypeFilter,
        platform: platformFilter,
        ageRange: ageFilter,
        salaryRange,
        loanAmountRange,
        employeeId: adminData?._id || "",
        employeeName: adminData?.fullName || "",
      };

      const excelBlob = await adminApi.exportFilteredLeads(params);
      const url = window.URL.createObjectURL(excelBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Filtered_Leads_${Date.now()}.xlsx`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel Export Failed ❌:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600">Manage and monitor all leads</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleFilteredExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Filtered
          </Button>

          <Button variant="default" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Bulk Export
          </Button>
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={loanTypeFilter}
          onValueChange={(value) => {
            setLoanTypeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Loans</SelectItem>
            <SelectItem value="personal">Personal Loan</SelectItem>
            <SelectItem value="business">Business Loan</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={platformFilter}
          onValueChange={(value) => {
            setPlatformFilter(value);
            setPage(1);
          }}
        >
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

        <Select
          value={ageFilter}
          onValueChange={(value) => {
            setAgeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Age Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="23-25">23–25 years</SelectItem>
            <SelectItem value="26-35">26–35 years</SelectItem>
            <SelectItem value="36-45">36–45 years</SelectItem>
            <SelectItem value="46-60">46–60 years</SelectItem>
            <SelectItem value="60+">60+ years</SelectItem>
          </SelectContent>
        </Select>

        {/* PINCODE DROPDOWN */}
        <div ref={pincodeRef} className="relative w-full sm:w-48">
          <div
            className="border rounded-md px-3 py-2 cursor-pointer bg-white flex justify-between items-center"
            onClick={() => {
              if (!selectedPincode)
                setPincodeDropdownOpen(!pincodeDropdownOpen);
            }}
          >
            {selectedPincode ? (
              <>
                <span>{selectedPincode}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPincode("");
                    setPincodeSearch("");
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </>
            ) : (
              <span className="text-gray-400">Select Pincode</span>
            )}
          </div>

          {pincodeDropdownOpen && !selectedPincode && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto p-2">
              <Input
                placeholder="Search pincode..."
                className="mb-2"
                value={pincodeSearch}
                onChange={(e) => setPincodeSearch(e.target.value)}
              />

              {pincodeLoading ? (
                <p className="text-sm text-gray-500 p-2">Loading...</p>
              ) : pincodes.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No pincodes found</p>
              ) : (
                pincodes.map((pin: string) => (
                  <div
                    key={pin}
                    onClick={() => {
                      setSelectedPincode(pin);
                      setPincodeDropdownOpen(false);
                      setPage(1);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                  >
                    {pin}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Select
          value={salaryRange}
          onValueChange={(value) => {
            setSalaryRange(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Salary Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salaries</SelectItem>
            <SelectItem value="15k-30k">₹15K - ₹30K</SelectItem>
            <SelectItem value="30k-50k">₹30K - ₹50K</SelectItem>
            <SelectItem value="50k-1l">₹50K - ₹1L</SelectItem>
            <SelectItem value="above-1l">Above ₹1L</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={loanAmountRange}
          onValueChange={(value) => {
            setLoanAmountRange(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Loan Amount" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Amounts</SelectItem>
            <SelectItem value="50k-1l">₹50K - ₹1L</SelectItem>
            <SelectItem value="1l-2l">₹1L - ₹2L</SelectItem>
            <SelectItem value="2l-5l">₹2L - ₹5L</SelectItem>
            <SelectItem value="5l-10l">₹5L - ₹10L</SelectItem>
            <SelectItem value="10l-20l">₹10L - ₹20L</SelectItem>
            <SelectItem value="above-20l">Above ₹20L</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 👇 VIEW TOGGLE ADDED HERE */}
      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) =>
            value && setViewMode(value as "card" | "table")
          }
        >
          <ToggleGroupItem value="card" className="border px-3 py-1 text-sm">
            <Grid3X3 className="w-4 h-4 mr-2" /> Card View
          </ToggleGroupItem>

          <ToggleGroupItem value="table" className="border px-3 py-1 text-sm">
            <List className="w-4 h-4 mr-2" /> Table View
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* LIST */}
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
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No leads found matching your filters
            </div>
          ) : viewMode === "card" ? (
            renderCardView()
          ) : (
            renderTableView()
          )}

          {/* Pagination */}
          {users.length > 0 && (
            <div className="flex justify-center gap-3 items-center mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-gray-700 text-sm">
                Page {page} of {totalPages} ({total} results)
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        filters={{
          search: debouncedSearch,
          loanType: loanTypeFilter,
          platform: platformFilter,
          ageRange: ageFilter,
          salaryRange,
          loanAmountRange,
        }}
      />
    </div>
  );
};

export default Users;
