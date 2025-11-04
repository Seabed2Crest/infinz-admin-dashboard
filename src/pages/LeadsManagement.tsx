import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2, X } from "lucide-react";

const Leads = () => {
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
                      {["personal", "home", "business", "auto"].map((type) => (
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

      {/* Page Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Leads Management
            </h1>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Button clicked - opening modal");
                setExportModalOpen(true);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Add your leads table/list here */}
          <div className="text-center text-gray-500 py-12">
            <p>Your leads content goes here</p>
            <p className="text-sm mt-2">
              Modal state: {exportModalOpen ? "Open" : "Closed"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
