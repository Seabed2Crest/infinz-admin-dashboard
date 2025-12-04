import React, { useState, ChangeEvent } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Upload, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  financialDictionaryApi,
  fileApi,
  FinancialDictionaryTerm,
} from "@/lib/api";

interface FormData {
  iconUrl: string;
  iconKey?: string;
  iconAlt?: string;
  title: string;
  category: string;
  description: string;
  example: string;
}

type ViewType = "list" | "add" | "edit";

const FinancialDictionaryAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    iconUrl: "",
    iconKey: "",
    iconAlt: "",
    title: "",
    category: "",
    description: "",
    example: "",
  });

  const termsQuery = useQuery({
    queryKey: ["financial-dictionary"],
    queryFn: async () => {
      const res = await financialDictionaryApi.getAll();
      return res.data ?? [];
    },
  });

  const terms = termsQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: financialDictionaryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-dictionary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      data: Partial<FinancialDictionaryTerm>;
    }) => financialDictionaryApi.update(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-dictionary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialDictionaryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-dictionary"] });
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const presigned = await fileApi.getPresigned(
          file,
          "financial-dictionary"
        );
        const uploadData = Array.isArray(presigned.data)
          ? presigned.data[0]
          : presigned.data;
        await fileApi.uploadToS3(uploadData.url, file);
        const url = `https://infinz.s3.ap-south-1.amazonaws.com/${uploadData.key}`;
        setIconPreview(url);
        setFormData((prev) => ({
          ...prev,
          iconUrl: url,
          iconKey: uploadData.key,
        }));
      } catch {
        alert("Failed to upload icon. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAdd = () => {
    setCurrentView("add");
    setIconPreview("");
    setFormData({
      iconUrl: "",
      iconKey: "",
      iconAlt: "",
      title: "",
      category: "",
      description: "",
      example: "",
    });
  };

  const handleEdit = (term: FinancialDictionaryTerm) => {
    setCurrentView("edit");
    setEditingId(term._id || null);
    setIconPreview(term.iconUrl);
    setFormData({
      iconUrl: term.iconUrl,
      iconKey: term.iconKey,
      iconAlt: term.iconAlt || "",
      title: term.title,
      category: term.category,
      description: term.description,
      example: term.example || "",
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.description || !formData.iconUrl) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      example: formData.example,
      iconUrl: formData.iconUrl,
      iconKey: formData.iconKey,
      iconAlt: formData.iconAlt,
    };

    try {
      if (currentView === "add") {
        await createMutation.mutateAsync(payload);
      } else if (currentView === "edit" && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      }
      setCurrentView("list");
      setEditingId(null);
      setFormData({
        iconUrl: "",
        iconKey: "",
        iconAlt: "",
        title: "",
        category: "",
        description: "",
        example: "",
      });
      setIconPreview("");
    } catch (error: any) {
      alert(error?.message || "Failed to save term");
    }
  };

  const handleCancel = () => {
    setCurrentView("list");
    setEditingId(null);
    setIconPreview("");
    setFormData({
      iconUrl: "",
      iconKey: "",
      iconAlt: "",
      title: "",
      category: "",
      description: "",
      example: "",
    });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this term?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error?.message || "Failed to delete term");
      }
    }
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.title &&
      formData.category &&
      formData.description &&
      formData.iconUrl
    );
  };

  const filteredTerms = terms.filter((term) => {
    const query = searchQuery.toLowerCase();
    return (
      term.title.toLowerCase().includes(query) ||
      term.category.toLowerCase().includes(query) ||
      term.description.toLowerCase().includes(query)
    );
  });

  if (currentView === "list" && termsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading financial terms...</p>
      </div>
    );
  }

  // List View
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Dictionary Terms</h1>
              <p className="text-gray-600 mt-1">Manage your business terms and definitions</p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus size={20} />
              Add New Term
            </button>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Terms</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{terms.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Categories</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{new Set(terms.map(t => t.category)).size}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Last Updated</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">Today</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div> */}

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Terms Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon Alt Text</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTerms.map((term) => (
                  <tr key={term._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={term.iconUrl}
                        alt={term.iconAlt || term.title}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{term.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                        {term.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {term.iconAlt || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm line-clamp-2">{term.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(term._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTerms.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'No terms found matching your search.' : 'No terms added yet. Click "Add New Term" to get started.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit View (Separate Page)
  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentView === "add" ? "Add New Term" : "Edit Term"}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentView === "add"
              ? "Fill in the details to create a new dictionary term"
              : "Update the term information below"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="space-y-6">
            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Icon Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {iconPreview ? (
                    <img
                      src={iconPreview}
                      alt={formData.iconAlt || "Icon preview"}
                      className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Upload className="text-gray-400" size={40} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg cursor-pointer transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      <Upload size={18} />
                      {iconPreview ? "Change Image" : "Upload Image"}
                    </label>
                    <p className="text-sm text-gray-500 mt-3">PNG, JPG, SVG up to 5MB</p>
                    <p className="text-xs text-gray-400 mt-1">Recommended size: 512x512px</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon Alt Text
                    </label>
                    <input
                      type="text"
                      name="iconAlt"
                      value={formData.iconAlt}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="e.g. Illustration representing APR"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description for screen readers and SEO.
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      You can find and download suitable icons from{" "}
                      <a
                        href="https://lucide.dev/icons/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        lucide.dev/icons
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Annual Percentage Rate (APR)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Interest Rates, Credit, Loans"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Provide a clear and detailed explanation of the term..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Example */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Example <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                name="example"
                value={formData.example}
                onChange={handleInputChange}
                rows={3}
                placeholder="Provide a practical example to help users understand..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {currentView === "add" ? "Create Term" : "Update Term"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDictionaryAdmin;