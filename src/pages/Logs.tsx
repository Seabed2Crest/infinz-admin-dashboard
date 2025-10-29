"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { adminApi } from "@/lib/api";

interface DownloadLog {
  _id: string;
  employeeId: string;
  employeeName: string;
  dataType: "lead" | "loanRequest";
  downloadedAt: string;
  count?: number;
  pages?: number;
}

const DownloadLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    employeeName: "",
    dataType: "",
    startDate: "",
    endDate: "",
  });

  const [tempFilters, setTempFilters] = useState({
    employeeName: "",
    dataType: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDownloadLogs({
        page,
        limit: 10,
        employeeName: filters.employeeName,
        dataType: filters.dataType as "lead" | "loanRequest",
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      if (response?.success) {
        const payload: any = response.data ?? [];
        let dataArray: DownloadLog[] = [];
        let pages = 1;

        if (Array.isArray(payload)) {
          dataArray = payload;
        } else if (payload && typeof payload === "object") {
          dataArray = Array.isArray(payload.data) ? payload.data : [];
          pages = typeof payload.pages === "number" ? payload.pages : 1;
        }

        setLogs(dataArray);
        setTotalPages(pages);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch only when page or filters change (not tempFilters)
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  // ✅ Apply filters manually
  const handleFilter = () => {
    setFilters(tempFilters); // trigger re-fetch through useEffect
    setPage(1);
  };

  // ✅ Clear filters and reset both states
  const handleClearFilters = () => {
    const cleared = {
      employeeName: "",
      dataType: "",
      startDate: "",
      endDate: "",
    };
    setFilters(cleared);
    setTempFilters(cleared);
    setPage(1);
  };

  return (
    <div className="p-6">
      <Card className="bg-card text-card-foreground shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            📜 Download Logs
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Employee Name</Label>
              <Input
                placeholder="Search by name"
                value={tempFilters.employeeName}
                onChange={(e) =>
                  setTempFilters((f) => ({
                    ...f,
                    employeeName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label>Data Type</Label>
              <Select
                value={tempFilters.dataType || "all"}
                onValueChange={(val) =>
                  setTempFilters((f) => ({
                    ...f,
                    dataType: val === "all" ? "" : val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="loanRequest">Loan Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={tempFilters.startDate}
                onChange={(e) =>
                  setTempFilters((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={tempFilters.endDate}
                onChange={(e) =>
                  setTempFilters((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button onClick={handleFilter}>Apply Filters</Button>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const date = new Date(log.downloadedAt);
                    return (
                      <TableRow key={log._id}>
                        <TableCell>{log.employeeName}</TableCell>
                        <TableCell>{log.employeeId}</TableCell>
                        <TableCell className="capitalize">
                          {log.dataType}
                        </TableCell>
                        <TableCell>{log.count || "-"}</TableCell>
                        <TableCell>{format(date, "dd-MM-yyyy")}</TableCell>
                        <TableCell>{format(date, "hh:mm a")}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadLogsPage;
