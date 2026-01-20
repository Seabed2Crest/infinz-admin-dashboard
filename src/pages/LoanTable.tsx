import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { utmLinkApi, type UtmLink } from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";


// ------------------------
// LIST TABLE
// ------------------------
const LoanTable = ({ onNavigateToAdd, onEdit, onDelete }: any) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["utm-links"],
    queryFn: async () => {
      const response = await utmLinkApi.getAll();
      return response.data || [];
    },
  });

  const loans = data || [];

  if (isLoading)
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin mr-2" />
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div>
          <p className="text-red-600">Load failed</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">UTM Links</h1>
          <Button onClick={onNavigateToAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add UTM
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-yellow-400">
                  <TableHead>PRIORITY</TableHead>
                  <TableHead>BANK</TableHead>
                  <TableHead>LOAN</TableHead>
                  <TableHead>SALARY</TableHead>
                  <TableHead>AGE</TableHead>
                  <TableHead>PINCODE</TableHead>
                  <TableHead>UTM LINK</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No UTM links found.
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan: UtmLink) => (
                    <TableRow key={loan._id}>
                      <TableCell>{loan.priority}</TableCell>

                      <TableCell className="flex items-center gap-2">
                        {loan.logoImage && (
                          <img
                            src={`https://infinz.s3.amazonaws.com/${loan.logoImage}`}
                            alt={loan.logoAlt || loan.bankName}
                            className="w-8 h-8 object-contain rounded border"
                          />
                        )}
                        {loan.bankName}
                      </TableCell>

                      <TableCell>
                        {loan.loanAmountMin} → {loan.loanAmountMax}
                      </TableCell>

                      <TableCell>{loan.salary}</TableCell>

                      <TableCell>
                        {loan.ageMin} - {loan.ageMax}
                      </TableCell>

                      <TableCell>
                        <Badge>
                          {loan.pincodeType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <a
                          href={loan.utmLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Open
                        </a>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(loan)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(loan._id!)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


// ------------------------
// FORM
// ------------------------
const UTMForm = ({
  onBack,
  editData,
}: {
  onBack: () => void;
  editData: UtmLink | null;
}) => {
  const queryClient = useQueryClient();
  const [pincodeInput, setPincodeInput] = useState("");

  const [formData, setFormData] = useState<Omit<UtmLink, "_id" | "createdAt" | "updatedAt">>(
    editData
      ? {
          ...editData,
          pincodes: editData.pincodes || [],
          conditions: editData.conditions || [],
          logoAlt: editData.logoAlt || "",
          logoImage: editData.logoImage || "",
        }
      : {
          priority: 0,
          bankName: "",
          loanAmountMin: "",
          loanAmountMax: "",
          salary: "",
          ageMin: "",
          ageMax: "",
          pincodeType: "PAN INDIA",
          pincodes: [],
          conditions: [],
          utmLink: "",
          logoImage: "",
          logoAlt: "",
        }
  );

  // Helper to format labels (e.g., bankName -> Bank Name)
  const formatLabel = (key: string) => {
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  // ======================
  // CONDITIONS LOGIC
  // ======================
  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { key: "", value: "" }],
    }));
  };

  const updateCondition = (index: number, field: "key" | "value", val: string) => {
    const newConditions = [...formData.conditions];
    newConditions[index][field] = val;
    setFormData((prev) => ({ ...prev, conditions: newConditions }));
  };

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  // ======================
  // BANK LOGO UPLOAD (S3)
  // ======================
  const handleBankLogoUpload = async (file: File) => {
    try {
      toast.loading("Uploading logo...");

      const payload = {
        files: [{ fileName: file.name, fileType: file.type }],
        uploadType: "bank-logo",
      };

      const presignRes = await fetch(
        "https://backend.infinz.seabed2crest.com/api/v1/presigned-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await presignRes.json();
      const { url, key } = json.data[0];

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setFormData((prev) => ({
        ...prev,
        logoImage: key,
      }));

      toast.success("Logo uploaded");

    } catch {
      toast.error("Upload failed");
    } finally {
      toast.dismiss();
    }
  };

  // ======================
  // EXCEL PINCODE
  // ======================
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target?.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(sheet);

      const extracted = data
        .map((x) => String(x.pincode || x.Pincode || "").trim())
        .filter(Boolean);

      setFormData((prev) => ({
        ...prev,
        pincodes: [...prev.pincodes, ...extracted],
      }));
    };

    reader.readAsBinaryString(file);
  };

  // ======================
  // CRUD
  // ======================
  const createMutation = useMutation({
    mutationFn: utmLinkApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utm-links"] });
      toast.success("Created successfully");
      onBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UtmLink> }) =>
      utmLinkApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utm-links"] });
      toast.success("Updated successfully");
      onBack();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editData?._id
      ? updateMutation.mutate({ id: editData._id, data: formData })
      : createMutation.mutate(formData);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {editData ? "Edit UTM Link" : "Add UTM Link"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* BASIC */}
              <div className="grid grid-cols-2 gap-4">
                {["priority", "bankName", "loanAmountMin", "loanAmountMax",
                  "salary", "ageMin", "ageMax"].map((field: any) => (
                  <div key={field}>
                    <Label>{formatLabel(field)}</Label>
                    <Input
                      name={field}
                      value={(formData as any)[field]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    />
                  </div>
                ))}

                <div>
                  <Label>Pincode Type</Label>
                  <Select
                    value={formData.pincodeType}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        pincodeType: v as any,
                        pincodes: v === "PAN INDIA" ? [] : prev.pincodes,
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAN INDIA">PAN INDIA</SelectItem>
                      <SelectItem value="SHARED">SHARED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LOGO */}
              <div>
                <Label>Bank Logo</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    e.target.files && handleBankLogoUpload(e.target.files[0])
                  }
                />

                {formData.logoImage && (
                  <img
                    src={`https://infinz.s3.amazonaws.com/${formData.logoImage}`}
                    alt={formData.logoAlt || "logo"}
                    className="w-20 mt-2"
                  />
                )}
              </div>

              {/* ALT */}
              <div>
                <Label>Logo Alt Text</Label>
                <Input
                  value={formData.logoAlt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoAlt: e.target.value,
                    }))
                  }
                />
              </div>

              {/* PINCODES */}
              {formData.pincodeType === "SHARED" && (
                <>
                  <Label>Pincodes</Label>
                  <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter pincode"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                    />
                    <Button type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          pincodes: [...prev.pincodes, pincodeInput],
                        }))
                      }
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {formData.pincodes.map((p, i) => (
                      <Badge key={i}>
                        {p}
                        <X onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            pincodes: prev.pincodes.filter(x => x !== p)
                          }))
                        } />
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* ADDITIONAL CONDITIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Additional Conditions</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addCondition}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Condition
                  </Button>
                </div>
                
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex gap-4 items-end border p-3 rounded-md bg-gray-50">
                    <div className="flex-1">
                      <Label className="text-xs">Condition Name (Key)</Label>
                      <Input
                        placeholder="Enter condition key"
                        value={condition.key}
                        onChange={(e) => updateCondition(index, "key", e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Condition Value</Label>
                      <Input
                        placeholder="Enter condition value"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, "value", e.target.value)}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* UTM */}
              <div>
                <Label>UTM Link</Label>
                <Input
                  value={formData.utmLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, utmLink: e.target.value }))
                  }
                />
              </div>

              {/* SUBMIT */}
              <div className="flex justify-end">
                <Button disabled={isLoading}>
                  {isLoading ? "Saving..." : editData ? "Update" : "Save"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


// ------------------------
// MAIN
// ------------------------
export default function UtmLink() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"table" | "form">("table");
  const [editingLoan, setEditingLoan] = useState<UtmLink | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => utmLinkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utm-links"] });
      toast.success("Deleted");
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {view === "table" ? (
        <LoanTable
          onNavigateToAdd={() => { setEditingLoan(null); setView("form"); }}
          onEdit={(loan: UtmLink) => { setEditingLoan(loan); setView("form"); }}
          onDelete={(id: string) => deleteMutation.mutate(id)}
        />
      ) : (
        <UTMForm
          editData={editingLoan}
          onBack={() => { setEditingLoan(null); setView("table"); }}
        />
      )}
    </div>
  );
}
