"use client";
import { adminApi } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function EmployeeForm() {
  const { employeeId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    permissions: {} as Record<string, string[]>,
  });

  const MODULE_ACTIONS = {
    "employee-management": ["view", "create", "update", "delete"],
    leads: ["view", "create", "update", "delete"],
    "loan-requests": ["view", "create", "update", "delete"],
    dashboard: ["view"],
    logs: ["view"],
  } as const;

  // ✅ Fetch Employee details if editing
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await adminApi.getEmployees();
        const employees = res ?? [];
        const employee = employees.find((e: any) => e._id === employeeId);

        if (employee) {
          const permissionMap: Record<string, string[]> = {};
          employee.permissions.forEach((p: any) => {
            permissionMap[p.module] = p.actions;
          });

          setFormData({
            fullName: employee.fullName,
            email: employee.email,
            password: "",
            phoneNumber: employee.phoneNumber,
            permissions: permissionMap,
          });
          setIsEditing(true);
        }
      } catch (err) {
        toast.error("Failed to load employee details");
      }
    };

    if (employeeId) fetchEmployee();
  }, [employeeId]);

  // ✅ Create Employee
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await adminApi.createEmployee({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        permissions: formData.permissions,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Employee created successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate("/employees");
    },
    onError: (e: any) => toast.error(e?.message || "Failed to create employee"),
  });

  // ✅ Update Employee (full update)
  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        permissions: formData.permissions,
        ...(formData.password ? { password: formData.password } : {}),
      };
      return adminApi.updateEmployee(employeeId!, payload);
    },
    onSuccess: () => {
      toast.success("Employee updated successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate("/roles-permissions");
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update employee"),
  });

  // ✅ Toggle Permissions
  function togglePermission(module: string, action: string) {
    setFormData((prev) => {
      const modulePerms = prev.permissions[module] || [];
      const hasAction = modulePerms.includes(action);

      const updated = hasAction
        ? modulePerms.filter((a) => a !== action)
        : [...modulePerms, action];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: updated,
        },
      };
    });
  }

  // ✅ Step navigation
  function handleNext() {
    if (
      !formData.fullName ||
      !formData.email ||
      (!isEditing && !formData.password) ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    setCurrentStep(2);
  }

  function handleBack() {
    setCurrentStep(1);
  }

  // ✅ Submit handler
  function handleSubmit() {
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              currentStep === 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="font-medium">Basic Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div
            className={`flex items-center gap-2 ${
              currentStep === 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="font-medium">Permissions</span>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">
            {isEditing ? "Edit Employee Details" : "Employee Details"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                placeholder="Enter email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  placeholder="Enter password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleNext} className="px-8">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Permissions */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Set Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MODULE_ACTIONS).map(([module, actions]) => (
              <div
                key={module}
                className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="font-semibold mb-3 capitalize text-lg">
                  {module.replace(/-/g, " ")}
                </div>
                <div className="space-y-2">
                  {actions.map((action) => {
                    const checked = (
                      formData.permissions[module] || []
                    ).includes(action);

                    return (
                      <label
                        key={action}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            togglePermission(module, action)
                          }
                        />
                        <span className="text-sm capitalize">{action}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <Button onClick={handleBack} variant="outline" className="px-8">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-8"
            >
              {isEditing
                ? updateMutation.isPending
                  ? "Updating..."
                  : "Update Employee"
                : createMutation.isPending
                ? "Creating..."
                : "Create Employee"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeForm;
