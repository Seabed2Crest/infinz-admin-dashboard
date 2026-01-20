// Users.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  Grid3X3,
  List,
  Loader2,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  IndianRupee,
  User,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { ExportModal } from "@/components/ExportModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Users = () => {
  const queryClient = useQueryClient();
  const pincodeRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");
  const [loanAmountRange, setLoanAmountRange] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [debouncedPincodeSearch, setDebouncedPincodeSearch] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [selectedPincode, setSelectedPincode] = useState("");
  const [pincodeDropdownOpen, setPincodeDropdownOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

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
      fromDate,
      toDate,
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
        fromDate,
        toDate,
        page,
        limit,
      }),
  });

  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.totalPages || 1;
  const total = usersData?.data?.total || 0;

  // Toggle card expansion
  const toggleCardExpansion = (userId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Age Calculator
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    try {
      const birth = new Date(dateOfBirth);
      if (isNaN(birth.getTime())) return null;
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return age;
    } catch {
      return null;
    }
  };

  // Format Date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-GB");
    } catch {
      return dateString;
    }
  };

  // Format DateTime
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString("en-GB");
    } catch {
      return dateString;
    }
  };

  // Format Amount
  const formatAmount = (amount: string) => {
    if (!amount || amount === "N/A") return "N/A";
    if (isNaN(parseFloat(amount))) return amount;
    const num = parseFloat(amount);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(2)} K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Get N/A if empty
  const getValueOrNA = (value: any) => {
    return value && value !== "" ? value : "N/A";
  };

  // Export filtered data function
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

  const statusMutation = useMutation({
    mutationFn: adminApi.updateLeadStatus,
    onSuccess: (response) => {
      toast.success(response.message || "Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      toast.error(errorMessage);
    },
  });

  const handleStatusUpdate = (
    loanId: string,
    loanType: string,
    newStatus: string,
  ) => {
    statusMutation.mutate({ loanId, loanType, status: newStatus });
  };

  const handleSelectAllOnPage = () => {
    const pageLeadKeys = users.map((u: any) => `${u._id}|${u.loanType}`);

    const allSelected = pageLeadKeys.every((key) => selectedLeads.has(key));

    if (allSelected) {
      const newSelectedLeads = new Set(selectedLeads);
      pageLeadKeys.forEach((key) => newSelectedLeads.delete(key));
      setSelectedLeads(newSelectedLeads);
    } else {
      const newSelectedLeads = new Set(selectedLeads);
      pageLeadKeys.forEach((key) => newSelectedLeads.add(key));
      setSelectedLeads(newSelectedLeads);
    }
  };

  const bulkStatusMutation = useMutation({
    mutationFn: (
      updates: Array<{ loanId: string; loanType: string; status: string }>,
    ) => adminApi.bulkUpdateLeadStatus(updates),
    onSuccess: (response) => {
      toast.success(response.message || "Bulk update successful");
      setSelectedLeads(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Bulk update failed";
      toast.error(errorMessage);
    },
  });

  const toggleLeadSelection = (id: string, type: string) => {
    const key = `${id}|${type}`;
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // 3. Correct Bulk Update Handler
  const handleBulkUpdate = (newStatus: string) => {
    const updates = Array.from(selectedLeads).map((key) => {
      const [loanId, loanType] = key.split("|");
      return { loanId, loanType, status: newStatus };
    });
    bulkStatusMutation.mutate(updates);
  };

  // CARD VIEW - Improved with collapsible sections
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {users.map((user: any, index: number) => {
        const sNo = (page - 1) * limit + (index + 1);
        const age = calculateAge(user.dateOfBirth);
        const formattedSysDate = formatDateTime(user.sysDate);
        const formattedDOB = formatDate(user.dateOfBirth);
        const formattedIncorporationDate = formatDate(
          user.dateOfIncorporationStartDate,
        );
        const formattedLoanAmount = formatAmount(user.requiredLoanAmount);
        const formattedIncome = formatAmount(user.netMonthlyIncome);
        const formattedTurnover = formatAmount(user.annualTurnover);
        const isExpanded = expandedCards.has(user._id);
        const isBusinessLoan = user.loanType === "Business Loan";

        return (
          <Card
            key={user._id}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden flex flex-col h-full"
          >
            <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border border-gray-300">
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                    {user.fullName
                      ? user.fullName.substring(0, 2).toUpperCase()
                      : user.phoneNumber
                        ? user.phoneNumber.substring(0, 2)
                        : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-gray-900 font-semibold text-sm truncate">
                    {getValueOrNA(user.fullName)}
                  </h3>
                  <p className="text-gray-600 text-xs truncate">
                    {isBusinessLoan
                      ? getValueOrNA(user.businessName)
                      : getValueOrNA(user.companyName)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`${
                    isBusinessLoan
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  } border-0 capitalize text-xs`}
                >
                  {getValueOrNA(user.loanType)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleCardExpansion(user._id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <CardContent className="p-5 flex-grow">
              {/* Basic Info Section (Always Visible) */}
              <div className="space-y-4">
                {/* Personal Details */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-gray-800 font-medium text-sm">
                        {getValueOrNA(user.phoneNumber)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium text-sm truncate">
                        {getValueOrNA(user.email)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-gray-800 font-medium text-sm">
                        {formattedDOB} {age ? `(${age} years)` : ""}
                      </p>
                    </div>
                  </div>

                  {user.assignedUtmLink && (
                    <div className="flex items-start space-x-3">
                      <LinkIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">UTM Link</p>
                        <a
                          href={user.assignedUtmLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm truncate block"
                        >
                          {user.assignedUtmLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loan Details */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Required Loan Amount
                    </span>
                    <span className="text-gray-800 font-semibold text-sm">
                      {formattedLoanAmount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">EMI Tenure</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {getValueOrNA(user.emiTenure)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Employment Type
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {getValueOrNA(user.employmentType)}
                    </Badge>
                  </div>

                  {!isBusinessLoan && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Monthly Income
                      </span>
                      <span className="text-gray-800 font-medium text-sm">
                        {formattedIncome}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status and Source */}
                <div className="flex items-center justify-between border-t pt-4 mt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(
                        `${user._id}|${user.loanType}`,
                      )}
                      onChange={() =>
                        toggleLeadSelection(user._id, user.loanType)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    {/* <p className="text-sm font-semibold text-gray-700">Update Status</p> */}
                  </div>

                  <Select
                    value={user.status || "pending"}
                    onValueChange={(newStatus) =>
                      handleStatusUpdate(user._id, user.loanType, newStatus)
                    }
                    disabled={statusMutation.isPending}
                  >
                    <SelectTrigger
                      className={`h-9 w-[130px] text-xs capitalize font-bold border-2 shadow-sm ${
                        user.status === "approved"
                          ? "text-green-600 border-green-200 bg-green-50/30"
                          : user.status === "rejected"
                            ? "text-red-600 border-red-200 bg-red-50/30"
                            : "text-yellow-600 border-yellow-200 bg-yellow-50/30"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="text-yellow-600">
                        Pending
                      </SelectItem>
                      <SelectItem value="approved" className="text-green-600">
                        Approved
                      </SelectItem>
                      <SelectItem value="rejected" className="text-red-600">
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expanded Details Section */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t space-y-4 animate-in fade-in duration-200">
                  <h4 className="font-medium text-sm text-gray-700">
                    Additional Details
                  </h4>

                  {/* PAN & Pincode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">PAN Card</p>
                      <p className="text-gray-800 font-medium text-sm uppercase">
                        {getValueOrNA(user.panCard)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pincode</p>
                      <p className="text-gray-800 font-medium text-sm">
                        {getValueOrNA(user.pincode)}
                      </p>
                    </div>
                  </div>

                  {/* Company Details for Personal Loans */}
                  {!isBusinessLoan && (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Company Name</p>
                          <p className="text-gray-800 font-medium text-sm">
                            {getValueOrNA(user.companyName)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Company Pincode
                          </p>
                          <p className="text-gray-800 font-medium text-sm">
                            {getValueOrNA(user.companyPincode)}
                          </p>
                        </div>
                      </div>

                      {user.salaryPaymentMode && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Salary Payment Mode
                          </p>
                          <p className="text-gray-800 font-medium text-sm">
                            {getValueOrNA(user.salaryPaymentMode)}
                          </p>
                        </div>
                      )}

                      {user.salarySlipBankStatement && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Salary Slip / Bank Statement
                          </p>
                          <a
                            href={user.salarySlipBankStatement}
                            className="text-blue-600 underline text-sm inline-flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Business Details for Business Loans */}
                  {isBusinessLoan && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Company Type</p>
                        <p className="text-gray-800 font-medium text-sm">
                          {getValueOrNA(user.companyType)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Annual Turnover</p>
                        <p className="text-gray-800 font-medium text-sm">
                          {formattedTurnover}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Industry / Nature of Business
                        </p>
                        <p className="text-gray-800 font-medium text-sm">
                          {getValueOrNA(user.industryNatureOfBusiness)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Business Registration Number
                        </p>
                        <p className="text-gray-800 font-medium text-sm">
                          {getValueOrNA(user.businessRegistrationNumber)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Date of Incorporation
                        </p>
                        <p className="text-gray-800 font-medium text-sm">
                          {formattedIncorporationDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Business/Company Pincode
                        </p>
                        <p className="text-gray-800 font-medium text-sm">
                          {getValueOrNA(user.businessCompanyPincode)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Created Date</p>
                    <p className="text-gray-800 text-sm">{formattedSysDate}</p>

                    <p className="text-xs text-gray-500 mt-3 mb-1">S.no</p>
                    <p className="text-gray-800 font-mono text-xs truncate">
                      {/* {getValueOrNA(user.customerId)} */} {sNo}
                    </p>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button at Bottom */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-gray-600 hover:text-gray-900"
                  onClick={() => toggleCardExpansion(user._id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show More Details
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // TABLE VIEW - Improved with horizontal scroll container
  const renderTableView = () => (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto border rounded-lg">
        <Table className="min-w-[2500px]">
          <TableHeader>
            <TableRow>
              {/* <TableHead className="min-w-[120px] sticky left-0 bg-white z-10">S.no</TableHead> */}
              <TableHead className="min-w-[60px] w-[60px] sticky left-0 bg-white z-10">
                S.no
              </TableHead>
              <TableHead className="min-w-[150px]">Created Date</TableHead>
              <TableHead className="min-w-[100px]">Source</TableHead>
              <TableHead className="min-w-[180px]">Full Name</TableHead>
              <TableHead className="min-w-[140px]">Phone Number</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Date of Birth</TableHead>
              <TableHead className="min-w-[120px]">PAN Card</TableHead>
              <TableHead className="min-w-[100px]">Pincode</TableHead>
              <TableHead className="min-w-[200px]">UTM Link</TableHead>
              <TableHead className="min-w-[120px]">Loan Type</TableHead>
              <TableHead className="min-w-[150px]">
                Required Loan Amount
              </TableHead>
              <TableHead className="min-w-[120px]">EMI Tenure</TableHead>
              <TableHead className="min-w-[140px]">Employment Type</TableHead>
              <TableHead className="min-w-[150px]">
                Net Monthly Income
              </TableHead>
              <TableHead className="min-w-[160px]">
                Salary Payment Mode
              </TableHead>
              <TableHead className="min-w-[200px]">Company Name</TableHead>
              <TableHead className="min-w-[130px]">Company Pincode</TableHead>
              <TableHead className="min-w-[180px]">
                Salary Slip / Bank Statement
              </TableHead>
              <TableHead className="min-w-[200px]">Business Name</TableHead>
              <TableHead className="min-w-[140px]">Company Type</TableHead>
              <TableHead className="min-w-[150px]">Annual Turnover</TableHead>
              <TableHead className="min-w-[200px]">
                Industry / Nature of Business
              </TableHead>
              <TableHead className="min-w-[200px]">
                Business Registration Number
              </TableHead>
              <TableHead className="min-w-[160px]">
                Date of Incorporation
              </TableHead>
              <TableHead className="min-w-[160px]">
                Business/Company Pincode
              </TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user: any, index: number) => {
              const sNo = (page - 1) * limit + (index + 1);
              const age = calculateAge(user.dateOfBirth);
              const formattedSysDate = formatDateTime(user.sysDate);
              const formattedDOB = formatDate(user.dateOfBirth);
              const formattedIncorporationDate = formatDate(
                user.dateOfIncorporationStartDate,
              );
              const formattedLoanAmount = formatAmount(user.requiredLoanAmount);
              const formattedIncome = formatAmount(user.netMonthlyIncome);
              const formattedTurnover = formatAmount(user.annualTurnover);
              const isBusinessLoan = user.loanType === "Business Loan";

              return (
                <TableRow
                  key={user._id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* <TableCell className="text-xs font-mono sticky left-0 bg-white z-10"> */}
                  <TableCell className="text-xs font-medium w-[60px] sticky left-0 bg-white z-10 text-center">
                    {/* {getValueOrNA(user.customerId)} */} {sNo}
                  </TableCell>
                  <TableCell className="text-sm">{formattedSysDate}</TableCell>
                  <TableCell className="capitalize text-sm">
                    {getValueOrNA(user.source)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getValueOrNA(user.fullName)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getValueOrNA(user.phoneNumber)}
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-[200px]">
                    {getValueOrNA(user.email)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formattedDOB} {age ? `(${age})` : ""}
                  </TableCell>
                  <TableCell className="uppercase text-sm">
                    {getValueOrNA(user.panCard)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getValueOrNA(user.pincode)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.assignedUtmLink ? (
                      <a
                        href={user.assignedUtmLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-[200px]"
                      >
                        {user.assignedUtmLink}
                      </a>
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        isBusinessLoan
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      } border-0 text-xs capitalize`}
                    >
                      {getValueOrNA(user.loanType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formattedLoanAmount}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getValueOrNA(user.emiTenure)}
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {getValueOrNA(user.employmentType)}
                  </TableCell>
                  <TableCell className="text-sm">{formattedIncome}</TableCell>
                  <TableCell className="text-sm">
                    {getValueOrNA(user.salaryPaymentMode)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {!isBusinessLoan ? getValueOrNA(user.companyName) : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {!isBusinessLoan
                      ? getValueOrNA(user.companyPincode)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.salarySlipBankStatement ? (
                      <a
                        href={user.salarySlipBankStatement}
                        className="text-blue-600 underline inline-flex items-center text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan ? getValueOrNA(user.businessName) : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan ? getValueOrNA(user.companyType) : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan ? formattedTurnover : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan
                      ? getValueOrNA(user.industryNatureOfBusiness)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan
                      ? getValueOrNA(user.businessRegistrationNumber)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan ? formattedIncorporationDate : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isBusinessLoan
                      ? getValueOrNA(user.businessCompanyPincode)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={Array.from(selectedLeads).some(
                          (l) => l.id === user._id,
                        )}
                        onChange={() =>
                          toggleLeadSelection(user._id, user.loanType)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Select
                        value={user.status || "pending"}
                        onValueChange={(val) =>
                          handleStatusUpdate(user._id, user.loanType, val)
                        }
                        disabled={statusMutation.isPending}
                      >
                        <SelectTrigger
                          className={`h-8 w-[110px] text-xs font-semibold ${
                            user.status === "approved"
                              ? "text-green-600 border-green-200"
                              : user.status === "rejected"
                                ? "text-red-600 border-red-200"
                                : "text-yellow-600 border-yellow-200"
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="pending"
                            className="text-yellow-600"
                          >
                            Pending
                          </SelectItem>
                          <SelectItem
                            value="approved"
                            className="text-green-600"
                          >
                            Approved
                          </SelectItem>
                          <SelectItem value="rejected" className="text-red-600">
                            Rejected
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Scroll horizontally to view all columns →
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600">Manage and monitor all leads</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={handleFilteredExport}
            disabled={isLoading}
            className="text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Filtered
          </Button>

          <Button
            variant="default"
            onClick={() => setExportModalOpen(true)}
            className="text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Bulk Export
          </Button>
        </div>
      </div>

      {/* Filters - Improved with wrapping */}
      {/* Filters Block */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col relative flex-1 min-w-[250px]">
          {/* <label className="text-xs text-gray-500 mb-1">Search</label> */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by mobile, name, PAN, email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Loans</label>
            <Select
              value={loanTypeFilter}
              onValueChange={(value) => {
                setLoanTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loans</SelectItem>
                <SelectItem value="personal">Personal Loan</SelectItem>
                <SelectItem value="business">Business Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Platforms</label>
            <Select
              value={platformFilter}
              onValueChange={(value) => {
                setPlatformFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
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

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Ages</label>
            <Select
              value={ageFilter}
              onValueChange={(value) => {
                setAgeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
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
          </div>

          {/* PINCODE DROPDOWN */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Pincode</label>
            <div ref={pincodeRef} className="relative w-[160px]">
              <div
                className="border rounded-md px-3 py-2 cursor-pointer bg-white flex justify-between items-center text-sm"
                onClick={() => {
                  if (!selectedPincode)
                    setPincodeDropdownOpen(!pincodeDropdownOpen);
                }}
              >
                {selectedPincode ? (
                  <>
                    <span className="truncate">{selectedPincode}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPincode("");
                        setPincodeSearch("");
                        setPage(1);
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-2"
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
                    className="mb-2 text-sm"
                    value={pincodeSearch}
                    onChange={(e) => setPincodeSearch(e.target.value)}
                  />

                  {pincodeLoading ? (
                    <p className="text-sm text-gray-500 p-2">Loading...</p>
                  ) : pincodes.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">
                      No pincodes found
                    </p>
                  ) : (
                    pincodes.map((pin: string) => (
                      <div
                        key={pin}
                        onClick={() => {
                          setSelectedPincode(pin);
                          setPincodeDropdownOpen(false);
                          setPage(1);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md text-sm"
                      >
                        {pin}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Salaries</label>
            <Select
              value={salaryRange}
              onValueChange={(value) => {
                setSalaryRange(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
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
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Amounts</label>
            <Select
              value={loanAmountRange}
              onValueChange={(value) => {
                setLoanAmountRange(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
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

          <div className="flex gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="w-[160px]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">To Date</label>
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="w-[160px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {users.length} of {total} results
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllOnPage}
            className={`text-xs h-8 ${users.length > 0 && users.every((u: any) => selectedLeads.has(`${u._id}|${u.loanType}`)) ? "bg-blue-50 border-blue-200 text-blue-600" : ""}`}
          >
            {users.length > 0 &&
            users.every((u: any) => selectedLeads.has(`${u._id}|${u.loanType}`))
              ? "Deselect All Page"
              : "Select All on Page"}
          </Button>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) =>
            value && setViewMode(value as "card" | "table")
          }
        >
          <ToggleGroupItem value="card" className="border px-3 py-1.5 text-sm">
            <Grid3X3 className="w-4 h-4 mr-2" /> Card View
          </ToggleGroupItem>

          <ToggleGroupItem value="table" className="border px-3 py-1.5 text-sm">
            <List className="w-4 h-4 mr-2" /> Table View
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* LIST */}
      <Card>
        <CardContent className="p-4 md:p-6">
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
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-3 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-gray-700 text-sm">
                  {total} total results
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
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

      {selectedLeads.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">
              {selectedLeads.size}
            </div>
            <span className="text-sm font-medium">Leads Selected</span>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">
              Update Status to:
            </p>
            <Select
              onValueChange={(value) => handleBulkUpdate(value)}
              disabled={bulkStatusMutation.isPending}
            >
              <SelectTrigger className="w-[140px] h-9 bg-slate-800 border-slate-700 text-white text-xs">
                <SelectValue placeholder="Choose Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem
                  value="pending"
                  className="text-yellow-400 focus:bg-slate-700 focus:text-yellow-400"
                >
                  Pending
                </SelectItem>
                <SelectItem
                  value="approved"
                  className="text-green-400 focus:bg-slate-700 focus:text-green-400"
                >
                  Approved
                </SelectItem>
                <SelectItem
                  value="rejected"
                  className="text-red-400 focus:bg-slate-700 focus:text-red-400"
                >
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setSelectedLeads(new Set())}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;