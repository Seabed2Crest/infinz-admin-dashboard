import React, { useState, ChangeEvent } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Upload, Search } from "lucide-react";

interface NewsItem {
  id: number;
  image: string;
  title: string;
  type: "News" | "Press Release";
  summary: string;
  content: string;
  date: string;
}

interface FormData {
  image: string;
  title: string;
  type: "News" | "Press Release";
  summary: string;
  content: string;
  date: string;
}

type ViewType = "list" | "add" | "edit";

const NewsAdmin: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState<FormData>({
    image: "",
    title: "",
    type: "News",
    summary: "",
    content: "",
    date: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData({ ...formData, image: result });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    setCurrentView("add");
    resetForm();
  };

  const handleEdit = (item: NewsItem) => {
    setCurrentView("edit");
    setEditingId(item.id);
    setImagePreview(item.image);
    setFormData(item);
  };

  const handleSave = () => {
    if (currentView === "add") {
      const newItem = {
        ...formData,
        id: Date.now(),
      };
      setNews([...news, newItem]);
    } else if (currentView === "edit" && editingId) {
      setNews(news.map(n => (n.id === editingId ? { ...n, ...formData } : n)));
    }
    setCurrentView("list");
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setImagePreview("");
    setFormData({
      image: "",
      title: "",
      type: "News",
      summary: "",
      content: "",
      date: "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this post?")) {
      setNews(news.filter(n => n.id !== id));
    }
  };

  const isValid = () => {
    return (
      formData.title &&
      formData.summary &&
      formData.content &&
      formData.date &&
      formData.image
    );
  };

  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // LIST VIEW
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">News & Press Releases</h1>
              <p className="text-gray-600">Manage announcements and updates</p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Plus /> Add Post
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search news..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Image</th>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map(item => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <img src={item.image} className="w-16 h-16 object-cover rounded-lg"/>
                    </td>
                    <td className="p-4 font-semibold">{item.title}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-teal-100 rounded-full">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">{item.date}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)}><Edit2 /></button>
                      <button onClick={() => handleDelete(item.id)}><Trash2 /></button>
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

  // ADD / EDIT VIEW
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <button
          onClick={() => setCurrentView("list")}
          className="flex gap-2 mb-4"
        >
          <ArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">
          {currentView === "add" ? "Add News" : "Edit News"}
        </h1>

        <div className="space-y-5">
          <input
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border p-3 rounded-lg"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full border p-3 rounded-lg"
          >
            <option>News</option>
            <option>Press Release</option>
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            name="summary"
            placeholder="Short summary"
            value={formData.summary}
            onChange={handleInputChange}
            className="w-full border p-3 rounded-lg"
            rows={3}
          />

          <textarea
            name="content"
            placeholder="Full content"
            value={formData.content}
            onChange={handleInputChange}
            className="w-full border p-3 rounded-lg"
            rows={6}
          />

          {/* Image Upload */}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && (
            <img src={imagePreview} className="w-40 h-40 object-cover rounded-lg"/>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={() => setCurrentView("list")}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!isValid()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsAdmin;
