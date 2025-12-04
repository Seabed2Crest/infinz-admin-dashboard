import React, { useState, ChangeEvent } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Search, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fileApi, newsApi, NewsPost } from "@/lib/api";

type ViewType = "list" | "add" | "edit";
type NewsType = "news" | "press-release";

interface FormData {
  title: string;
  type: NewsType;
  summary: string;
  content: string;
  publishedAt: string;
  imageUrl: string;
  imageKey?: string;
  imageAlt?: string;
}

const initialForm: FormData = {
  title: "",
  type: "news",
  summary: "",
  content: "",
  publishedAt: "",
  imageUrl: "",
  imageKey: "",
  imageAlt: "",
};

const readableType = (type: NewsType) =>
  type === "press-release" ? "Press Release" : "News";

const NewsAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialForm);

  // Fetch all news / press
  const newsQuery = useQuery({
    queryKey: ["news-and-press"],
    queryFn: async () => {
      const res = await newsApi.getAll();
      return res.data ?? [];
    },
  });

  const newsItems = newsQuery.data ?? [];

  // CREATE
  const createMutation = useMutation({
    mutationFn: (
      payload: Omit<NewsPost, "_id" | "slug" | "createdAt" | "updatedAt">
    ) => newsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-and-press"] });
    },
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<NewsPost> }) =>
      newsApi.update(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-and-press"] });
    },
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-and-press"] });
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const presigned = await fileApi.getPresigned(file, "news");
      const uploadData = Array.isArray(presigned.data)
        ? presigned.data[0]
        : presigned.data;

      await fileApi.uploadToS3(uploadData.url, file);
      const url = `https://infinz.s3.ap-south-1.amazonaws.com/${uploadData.key}`;

      setImagePreview(url);
      setFormData((prev) => ({
        ...prev,
        imageUrl: url,
        imageKey: uploadData.key,
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    setCurrentView("add");
    setEditingId(null);
    setImagePreview("");
    setFormData(initialForm);
  };

  const handleEdit = (item: NewsPost) => {
    setCurrentView("edit");
    setEditingId(item._id || null);
    setImagePreview(item.imageUrl);
    setFormData({
      title: item.title,
      type: (item.type || "news") as NewsType,
      summary: item.summary,
      content: item.content,
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : "",
      imageUrl: item.imageUrl,
      imageKey: item.imageKey,
      imageAlt: item.imageAlt || "",
    });
  };

  const resetState = () => {
    setCurrentView("list");
    setEditingId(null);
    setImagePreview("");
    setFormData(initialForm);
  };

  const isFormValid = () =>
    !!(
      formData.title &&
      formData.summary &&
      formData.content &&
      formData.publishedAt &&
      formData.imageUrl
    );

  const handleSave = async () => {
    if (!isFormValid()) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      type: formData.type,
      summary: formData.summary,
      content: formData.content,
      publishedAt: formData.publishedAt,
      imageUrl: formData.imageUrl,
      imageKey: formData.imageKey,
      imageAlt: formData.imageAlt,
    };

    try {
      if (currentView === "add") {
        await createMutation.mutateAsync(payload);
      } else if (currentView === "edit" && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      }
      resetState();
    } catch (error: any) {
      alert(error?.message || "Failed to save news item");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm("Delete this post?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error?.message || "Failed to delete news item");
      }
    }
  };

  const filteredNews = newsItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query)
    );
  });

  // -----------------------
  // LIST VIEW: LOADING STATE
  // -----------------------
  if (currentView === "list" && newsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading news &amp; press posts...</p>
      </div>
    );
  }

  // -----------------------
  // LIST VIEW: ERROR STATE
  // -----------------------
  if (currentView === "list" && newsQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-600">
          Failed to load news. Please refresh the page.
        </p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["news-and-press"] })
          }
          className="px-4 py-2 bg-teal-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // -----------------------
  // LIST VIEW
  // -----------------------
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">News &amp; Press Releases</h1>
              <p className="text-gray-600">
                Manage announcements, press releases, and company milestones
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors"
            >
              <Plus size={18} /> Add Post
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Image
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Title
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.summary}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {readableType((item.type || "news") as NewsType)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : "--"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredNews.length && (
              <p className="p-8 text-center text-gray-500">No posts found.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------
  // ADD / EDIT VIEW
  // -----------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow border border-gray-100">
        <button
          onClick={resetState}
          className="flex gap-2 mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft /> Back to list
        </button>

        <h1 className="text-2xl font-bold mb-6">
          {currentView === "add" ? "Add News" : "Edit News"}
        </h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              placeholder="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border p-3 rounded-lg"
              >
                <option value="news">News</option>
                <option value="press-release">Press Release</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Date
              </label>
              <input
                type="date"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleInputChange}
                className="w-full border p-3 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Summary
            </label>
            <textarea
              name="summary"
              placeholder="Short summary"
              value={formData.summary}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Content
            </label>
            <textarea
              name="content"
              placeholder="Full content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {(imagePreview || formData.imageUrl) && (
              <img
                src={imagePreview || formData.imageUrl}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg mt-4 border"
              />
            )}
            {uploading && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Uploading image...
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={resetState} className="text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !isFormValid() ||
              createMutation.isPending ||
              updateMutation.isPending ||
              uploading
            }
            className="bg-teal-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsAdmin;
