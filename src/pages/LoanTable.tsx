import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Initial data
const initialLoans = [
  {
    id: 1,
    priority: 1,
    bankName: 'INCRED',
    loanAmount: '50K to 15 Lakhs',
    salary: '15K',
    age: '21-56',
    additionalCondition1: '',
    additionalCondition2: '',
    additionalCondition3: '',
    pincodeType: 'SHARED',
    pincodes: [],
    utmLink: 'https://www.incred.com/personal-loan/?partnerid=7804017114710849&utm_source=abcd&utm_medium=links&utm_campaign='
  },
  {
    id: 2,
    priority: 2,
    bankName: 'TRUSTA PAISA',
    loanAmount: '2.5K to 20K',
    salary: '20K',
    age: '22-50',
    additionalCondition1: '',
    additionalCondition2: '',
    additionalCondition3: '',
    pincodeType: 'SHARED',
    pincodes: [],
    utmLink: 'https://trustapaisa.com/?utm_source=infinu&utm_medium=cpa&clickid=je4YOURLICKID'
  },
  {
    id: 3,
    priority: 3,
    bankName: 'WERIZE.PL',
    loanAmount: '30K to 5 Lakhs',
    salary: '15K',
    age: '21-58',
    additionalCondition1: '',
    additionalCondition2: '',
    additionalCondition3: '',
    pincodeType: 'PAN INDIA',
    pincodes: [],
    utmLink: 'https://partner.werize.com/MyBusiness/Nakshtra%20Hospitality%20P%20Limited/2a49c44-1e10-41c5-a3cc-1d293160c'
  }
];

// Table Component
const LoanTable = ({ onNavigateToAdd, loans, onEdit, onDelete }) => {
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
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.priority}</TableCell>
                      <TableCell className="font-medium">{loan.bankName}</TableCell>
                      <TableCell>{loan.loanAmount}</TableCell>
                      <TableCell>{loan.salary}</TableCell>
                      <TableCell>{loan.age}</TableCell>
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
                            onClick={() => onDelete(loan.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
const UTMForm = ({ onBack, onSave, editData }) => {
  const [formData, setFormData] = useState(editData || {
    priority: '',
    bankName: '',
    loanAmount: '',
    salary: '',
    age: '',
    additionalCondition1: '',
    additionalCondition2: '',
    additionalCondition3: '',
    pincodeType: 'PAN INDIA',
    pincodes: [],
    utmLink: ''
  });

  const [pincodeInput, setPincodeInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePincodeTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      pincodeType: value,
      pincodes: value === 'PAN INDIA' ? [] : prev.pincodes
    }));
    if (value === 'PAN INDIA') {
      setPincodeInput('');
    }
  };

  const handleAddPincode = () => {
    if (pincodeInput.trim() && !formData.pincodes.includes(pincodeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        pincodes: [...prev.pincodes, pincodeInput.trim()]
      }));
      setPincodeInput('');
    }
  };

  const handleRemovePincode = (pincode) => {
    setFormData(prev => ({
      ...prev,
      pincodes: prev.pincodes.filter(p => p !== pincode)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{editData ? 'Edit UTM Link' : 'Add New UTM Link'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank / NBFC Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    placeholder="e.g., 50K to 15 Lakhs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., 15K"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 21-56"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincodeType">Pincode Type</Label>
                  <Select
                    value={formData.pincodeType}
                    onValueChange={handlePincodeTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAN INDIA">PAN INDIA</SelectItem>
                      <SelectItem value="SHARED">SHARED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.pincodeType === 'SHARED' && (
                <div className="space-y-2">
                  <Label htmlFor="pincodes">Pincodes</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pincodes"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="Enter pincode"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPincode();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddPincode}>
                      Add
                    </Button>
                  </div>
                  {formData.pincodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.pincodes.map((pincode, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {pincode}
                          <button
                            type="button"
                            onClick={() => handleRemovePincode(pincode)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="additionalCondition1">Additional Condition 1</Label>
                <Input
                  id="additionalCondition1"
                  name="additionalCondition1"
                  value={formData.additionalCondition1}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalCondition2">Additional Condition 2</Label>
                <Input
                  id="additionalCondition2"
                  name="additionalCondition2"
                  value={formData.additionalCondition2}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalCondition3">Additional Condition 3</Label>
                <Input
                  id="additionalCondition3"
                  name="additionalCondition3"
                  value={formData.additionalCondition3}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmLink">UTM Link</Label>
                <Input
                  id="utmLink"
                  name="utmLink"
                  value={formData.utmLink}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editData ? 'Update' : 'Save'} UTM Link
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
  const [view, setView] = useState('table');
  const [loans, setLoans] = useState(initialLoans);
  const [editingLoan, setEditingLoan] = useState(null);

  const handleNavigateToAdd = () => {
    setEditingLoan(null);
    setView('form');
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setView('form');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this UTM link?')) {
      setLoans(prev => prev.filter(loan => loan.id !== id));
    }
  };

  const handleSave = (formData) => {
    if (editingLoan) {
      setLoans(prev => prev.map(loan => 
        loan.id === editingLoan.id ? { ...formData, id: loan.id } : loan
      ));
    } else {
      const newId = Math.max(...loans.map(l => l.id), 0) + 1;
      setLoans(prev => [...prev, { ...formData, id: newId }]);
    }
    setView('table');
  };

  const handleBack = () => {
    setView('table');
    setEditingLoan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'table' ? (
        <LoanTable
          loans={loans}
          onNavigateToAdd={handleNavigateToAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <UTMForm
          onBack={handleBack}
          onSave={handleSave}
          editData={editingLoan}
        />
      )}
    </div>
  );
}