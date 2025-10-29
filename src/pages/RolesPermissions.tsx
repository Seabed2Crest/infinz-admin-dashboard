import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Employee = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
};

const MODULES = [
  "employee-management",
  "leads",
  "loan-requests",
  "business-management",
  "dashboard",
  "logs",
] as const;

const ACTIONS = ["view", "create", "update", "delete"] as const;

const RolesPermissions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const list = await adminApi.getEmployees();
      return list as any[];
    },
  });

  const filteredEmployees = useMemo(() => {
    if (!employeesQuery.data) return [] as any[];
    const term = search.toLowerCase();
    return employeesQuery.data.filter(
      (e: any) =>
        e.fullName?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term) ||
        e.phoneNumber?.toLowerCase().includes(term)
    );
  }, [employeesQuery.data, search]);

  const loadPermissions = async (employee: Employee) => {
    try {
      const res = await adminApi.getEmployeePermissions(employee._id);
      setSelectedEmployee(employee);
      setPermissions(res.data.permissions || {});
    } catch (e: any) {
      toast.error(e?.message || "Failed to load permissions");
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee) throw new Error("No employee selected");
      return adminApi.updateEmployeePermissions({
        id: selectedEmployee._id,
        permissions,
      });
    },
    onSuccess: () => {
      toast.success("Permissions updated");
    },
    onError: (e: any) =>
      toast.error(e?.message || "Failed to update permissions"),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return adminApi.createEmployee(createForm);
    },
    onSuccess: () => {
      toast.success("Employee created");
      setCreateOpen(false);
      setCreateForm({ fullName: "", email: "", password: "", phoneNumber: "" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to create employee"),
  });

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev) => {
      const current = new Set(prev[module] || []);
      if (current.has(action)) {
        current.delete(action);
      } else {
        current.add(action);
      }
      return { ...prev, [module]: Array.from(current) };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>

        <Button onClick={() => navigate("/roles-permissions/create-employee")}>
          Create Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Input
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["employees"] })
              }
            >
              Refresh
            </Button>
          </div>
          <div className="grid gap-3">
            {employeesQuery.isLoading && <div>Loading employees...</div>}
            {employeesQuery.isError && <div>Failed to load employees</div>}
            {filteredEmployees.map((emp: any) => (
              <div key={emp._id} className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Name</div>
                      <div className="font-medium truncate">
                        {emp.name || emp.fullName || "-"}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="truncate">
                        <Badge variant="outline">{emp.email || "-"}</Badge>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="truncate">{emp.phoneNumber || "-"}</div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/roles-permissions/update-employee/${emp._id}`
                        )
                      }
                    >
                      Edit Employee
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Permissions for {selectedEmployee.fullName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {MODULES.map((module) => (
                <div key={module} className="border rounded-md p-3">
                  <div className="font-medium mb-2">{module}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIONS.map((action) => {
                      const checked = (permissions[module] || []).includes(
                        action
                      );
                      return (
                        <label key={action} className="flex items-center gap-2">
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
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedEmployee(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RolesPermissions;
