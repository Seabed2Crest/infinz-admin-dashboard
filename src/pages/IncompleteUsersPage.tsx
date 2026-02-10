"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Loader2, Download, User } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

const IncompleteUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["incomplete-users", debouncedSearch, page],
    queryFn: () =>
      adminApi.getIncompleteUsers({
        search: debouncedSearch,
        page,
        limit,
      }),
  });

  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.totalPages || 1;
  const total = usersData?.data?.total || 0;

  // Export function
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await adminApi.exportIncompleteUsers(debouncedSearch);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incomplete_users_${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Incomplete User Registrations
          </h2>
          <p className="text-gray-600 text-sm">
            Users who completed registration but haven't applied for loans
          </p>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="bg-[#2ba08e] hover:bg-[#248a7a] text-white text-sm px-4 py-2 flex items-center gap-2 rounded"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export to Excel
        </Button>
      </div>

      {/* Search Input Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by phone number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 border-gray-300 focus:ring-1 focus:ring-[#2ba08e]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="bg-[#f0f7ff] border border-[#e0efff] rounded-lg p-5">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Incomplete Registrations
            </p>
            <p className="text-3xl font-bold text-gray-900 leading-tight">
              {total}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2ba08e]" />
            <span className="ml-3 text-gray-500">Loading users...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Error loading users. Please try again.
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No incomplete registrations found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[150px] font-bold text-gray-700 py-4">
                    Serial No.
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">
                    Phone Number
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow
                    key={user.phoneNumber}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                  >
                    <TableCell className="font-bold text-gray-900 py-4">
                      {user.serialNumber}
                    </TableCell>
                    <TableCell className="font-bold text-gray-800 py-4 tracking-wide">
                      {user.phoneNumber || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm text-gray-500">
        <div className="order-2 sm:order-1">
          Page {page} of {totalPages}
        </div>

        <div className="flex items-center gap-4 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-gray-300 hover:bg-gray-50 px-4"
          >
            Previous
          </Button>
          <span className="font-medium text-gray-600">
            {total} total users
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-gray-300 hover:bg-gray-50 px-4"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncompleteUsersPage;