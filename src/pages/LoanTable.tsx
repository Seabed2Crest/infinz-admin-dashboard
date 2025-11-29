import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utmLinkApi, type UtmLink } from '@/lib/api';
import { toast } from 'sonner';
import * as XLSX from "xlsx";

// Table Component
const LoanTable = ({ onNavigateToAdd, onEdit, onDelete }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['utm-links'],
    queryFn: async () => {
      const response = await utmLinkApi.getAll();
      return response.data;
    },
  });

  const loans = data || [];

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading UTM Links...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load UTM Links</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">UTM Links</h1>
          <Button onClick={onNavigateToAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add UTM Link
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                    <TableHead className="font-bold text-black">PRIORITY</TableHead>
                    <TableHead className="font-bold text-black">BANK / NBFC NAME</TableHead>
                    <TableHead className="font-bold text-black">LOAN AMOUNT</TableHead>
                    <TableHead className="font-bold text-black">SALARY</TableHead>
                    <TableHead className="font-bold text-black">AGE</TableHead>
                    <TableHead className="font-bold text-black">PINCODE TYPE</TableHead>
                    <TableHead className="font-bold text-black">UTM LINK</TableHead>
                    <TableHead className="font-bold text-black">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No UTM Links found. Click "Add UTM Link" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => (
                      <TableRow key={loan._id}>
                        <TableCell>{loan.priority}</TableCell>
                        <TableCell className="font-medium">{loan.bankName}</TableCell>
                        <TableCell>{loan.loanAmountMin} to {loan.loanAmountMax}</TableCell>
                        <TableCell>{loan.salary}</TableCell>
                        <TableCell>{loan.ageMin} to {loan.ageMax}</TableCell>
                        <TableCell>
                          <Badge variant={loan.pincodeType === 'PAN INDIA' ? 'default' : 'secondary'}>
                            {loan.pincodeType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            <a 
                              href={loan.utmLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              title={loan.utmLink}
                            >
                              {loan.utmLink}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add/Edit UTM Link Component
const UTMForm = ({ onBack, editData }: { onBack: () => void; editData: UtmLink | null }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<UtmLink, "_id" | "createdAt" | "updatedAt">>(editData ? {
    priority: editData.priority,
    bankName: editData.bankName,
    loanAmountMin: editData.loanAmountMin,
    loanAmountMax: editData.loanAmountMax,
    salary: editData.salary,
    ageMin: editData.ageMin,
    ageMax: editData.ageMax,
    pincodeType: editData.pincodeType,
    pincodes: editData.pincodes || [],
    conditions: editData.conditions || [],
    utmLink: editData.utmLink
  } : {
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
    utmLink: ""
  });

  const [pincodeInput, setPincodeInput] = useState("");

  // ======================
  // HANDLE EXCEL UPLOAD
// ======================
// HANDLE EXCEL UPLOAD
// ======================
const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (evt) => {
    const binaryStr = evt.target?.result as string;

    const workbook = XLSX.read(binaryStr, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Tell TS what rows look like
    type ExcelRow = {
      pincode?: string | number;
      Pincode?: string | number;
      [key: string]: any;
    };

    const data: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

    const extracted = data
      .map((row) => String(row.pincode || row.Pincode || "").trim())
      .filter((v) => v !== "");

    setFormData((prev) => ({
      ...prev,
      pincodes: [...prev.pincodes, ...extracted],
    }));
  };

  reader.readAsBinaryString(file);
};


  const createMutation = useMutation({
    mutationFn: (data: Omit<UtmLink, "_id" | "createdAt" | "updatedAt">) =>
      utmLinkApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utm-links'] });
      toast.success('UTM Link created successfully');
      onBack();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create UTM Link');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UtmLink> }) =>
      utmLinkApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utm-links'] });
      toast.success('UTM Link updated successfully');
      onBack();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update UTM Link');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' ? Number(value) : value,
    }));
  };

  const handlePincodeTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      pincodeType: value as "PAN INDIA" | "SHARED",
      pincodes: value === "PAN INDIA" ? [] : prev.pincodes,
    }));
    if (value === "PAN INDIA") setPincodeInput("");
  };

  const handleAddPincode = () => {
    if (pincodeInput.trim() && !formData.pincodes.includes(pincodeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        pincodes: [...prev.pincodes, pincodeInput.trim()],
      }));
      setPincodeInput("");
    }
  };

  const handleRemovePincode = (pin) => {
    setFormData((prev) => ({
      ...prev,
      pincodes: prev.pincodes.filter((x) => x !== pin),
    }));
  };

  // ==========================
  // DYNAMIC CONDITIONS
  // ==========================
  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { key: "", value: "" }]
    }));
  };

  const updateCondition = (index, field, value) => {
    const updated = [...formData.conditions];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, conditions: updated }));
  };

  const removeCondition = (index) => {
    const updated = [...formData.conditions];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, conditions: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editData?._id) {
      updateMutation.mutate({ id: editData._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{editData ? "Edit UTM Link" : "Add New UTM Link"}</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* BASIC FIELDS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Input 
                    name="priority" 
                    type="number" 
                    value={formData.priority || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div>
                  <Label>Bank Name</Label>
                  <Input name="bankName" value={formData.bankName} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Loan Amount (Min)</Label>
                  <Input 
                    name="loanAmountMin" 
                    value={formData.loanAmountMin} 
                    onChange={handleChange} 
                    placeholder="e.g., 50K"
                    required 
                  />
                </div>

                <div>
                  <Label>Loan Amount (Max)</Label>
                  <Input 
                    name="loanAmountMax" 
                    value={formData.loanAmountMax} 
                    onChange={handleChange} 
                    placeholder="e.g., 15 Lakhs"
                    required 
                  />
                </div>

                <div>
                  <Label>Salary</Label>
                  <Input name="salary" value={formData.salary} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Age (Min)</Label>
                  <Input 
                    name="ageMin" 
                    value={formData.ageMin} 
                    onChange={handleChange} 
                    placeholder="e.g., 21"
                    required 
                  />
                </div>

                <div>
                  <Label>Age (Max)</Label>
                  <Input 
                    name="ageMax" 
                    value={formData.ageMax} 
                    onChange={handleChange} 
                    placeholder="e.g., 56"
                    required 
                  />
                </div>

                <div>
                  <Label>Pincode Type</Label>
                  <Select value={formData.pincodeType} onValueChange={handlePincodeTypeChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAN INDIA">PAN INDIA</SelectItem>
                      <SelectItem value="SHARED">SHARED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* PINCODE SECTION */}
              {formData.pincodeType === "SHARED" && (
                <>
                  <Label>Pincodes</Label>

                  {/* Excel Upload */}
                  <div className="space-y-2">
                    <Label>Upload Excel (xlsx/csv)</Label>
                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} />
                  </div>

                  {/* Manual Add */}
                  <div className="flex gap-2 mt-2">
                    <Input value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value)} placeholder="Enter pincode" />
                    <Button type="button" onClick={handleAddPincode}>Add</Button>
                  </div>

                  {/* Show Pincodes */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.pincodes.map((pin, i) => (
                      <Badge key={i} variant="secondary">
                        {pin}
                        <button type="button" onClick={() => handleRemovePincode(pin)}>
                          <X className="h-3 w-3 ml-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* CONDITIONS SECTION */}
              <div>
                <Label className="text-lg font-medium">Additional Conditions</Label>

                <Button type="button" className="mt-2" onClick={addCondition}>
                  + Add Condition
                </Button>

                <div className="space-y-3 mt-3">
                  {formData.conditions.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 items-center">
                      <Input
                        placeholder="Key"
                        value={item.key}
                        onChange={(e) => updateCondition(index, "key", e.target.value)}
                      />

                      <Input
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => updateCondition(index, "value", e.target.value)}
                      />

                      <Button variant="destructive" onClick={() => removeCondition(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* UTM LINK */}
              <div>
                <Label>UTM Link</Label>
                <Input name="utmLink" value={formData.utmLink} onChange={handleChange} required />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={onBack} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editData ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    `${editData ? "Update" : "Save"} UTM Link`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


// Main App Component
export default function UtmLink() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'table' | 'form'>('table');
  const [editingLoan, setEditingLoan] = useState<UtmLink | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => utmLinkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utm-links'] });
      toast.success('UTM Link deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete UTM Link');
    },
  });

  const handleNavigateToAdd = () => {
    setEditingLoan(null);
    setView('form');
  };

  const handleEdit = (loan: UtmLink) => {
    setEditingLoan(loan);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this UTM link?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBack = () => {
    setView('table');
    setEditingLoan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'table' ? (
        <LoanTable
          onNavigateToAdd={handleNavigateToAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <UTMForm
          onBack={handleBack}
          editData={editingLoan}
        />
      )}
    </div>
  );
}