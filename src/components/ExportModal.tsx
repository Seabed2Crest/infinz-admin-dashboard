"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { adminApi } from "@/lib/api";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Record<string, string>;
}

export const ExportModal = ({ isOpen, onClose, filters }: ExportModalProps) => {
  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      adminApi
        .getLastDownload()
        .then((res) => {
          if (res.lastDownload) {
            setFromDate(
              format(new Date(res.lastDownload), "yyyy-MM-dd'T'HH:mm:ss"),
            );
          } else {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            setFromDate(format(d, "yyyy-MM-dd'T'HH:mm:ss"));
          }
        })
        .catch(() => {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          setFromDate(format(d, "yyyy-MM-dd'T'HH:mm:ss"));
        });
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!fromDate || !toDate) return alert("Select both From and To dates.");
    if (new Date(toDate) < new Date(fromDate))
      return alert("To Date cannot be earlier than From Date");

    setLoading(true);
    try {
      const params = {
        ...filters,
        from: fromDate,
        to: toDate,
        employeeId: "EMP1001",
        employeeName: "Shanu Joseph",
      };

      const blob = await adminApi.exportFilteredLeads(params);

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `filtered_leads_${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error(err);
      alert("Export failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Filtered Leads</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <Label className="text-sm font-medium">
              From Date & Time (with seconds)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                disabled
                type="datetime-local"
                step="1"
                className="pl-9"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">
              To Date & Time (with seconds)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                disabled
                type="datetime-local"
                step="1"
                className="pl-9"
                min={fromDate}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Exporting..." : "Export Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
