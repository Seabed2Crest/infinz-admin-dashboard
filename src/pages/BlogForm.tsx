import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { blogApi, fileApi } from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const mode = location.pathname.includes("edit") ? "edit" : "add";

  const { register, handleSubmit, reset } = useForm();

  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/ /g, "-");

  // Fetch blog when editing
  const blogQuery = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await blogApi.getById(id!);
      return res.data;
    },
    enabled: mode === "edit" && !!id,
  });

  // Prefill values on edit
  useEffect(() => {
    if (mode === "edit" && blogQuery.data) {
      reset(blogQuery.data);
      setThumbnail(blogQuery.data.thumbnail || "");
    }
  }, [blogQuery.data]);

  // Upload file to S3 automatically
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setUploading(true);

    try {
      const presigned = await fileApi.getPresigned(selected);

      const uploadData = Array.isArray(presigned.data)
        ? presigned.data[0]
        : presigned.data;

      if (!uploadData) {
        alert("Failed to get upload URL");
        return;
      }

      await fileApi.uploadToS3(uploadData.url, selected);

      const finalURL = `https://infinz.s3.ap-south-1.amazonaws.com/${uploadData.key}`;

      setThumbnail(finalURL);
    } catch (err) {
      console.error(err);
      alert("File upload failed");
    }

    setUploading(false);
  };

  // CREATE / UPDATE
  const mutationFn =
    mode === "add"
      ? blogApi.create
      : (payload: any) => blogApi.update(id!, payload);

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      navigate("/admin/blogs");
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      slug: mode === "add" ? slugify(data.title) : data.slug,
      thumbnail,
    };

    mutation.mutate(payload);
  };

  if (mode === "edit" && blogQuery.isLoading) {
    return <p className="text-center mt-10 text-lg">Loading blog...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {mode === "add" ? "Add Blog" : "Edit Blog"}
        </h1>

        <Button variant="outline" onClick={() => navigate("/admin/blogs")}>
          ← Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input {...register("title")} placeholder="Blog title..." />
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <Input {...register("category")} placeholder="Finance, Business..." />
        </div>

        {/* Thumbnail Upload */}
        <div>
          <Label>Thumbnail Image</Label>
          <Input type="file" accept="image/*" onChange={handleFileSelect} />
        </div>

        {uploading && <p className="text-blue-600">Uploading image...</p>}

        {/* Preview */}
        {thumbnail && (
          <img
            src={thumbnail}
            className="w-40 h-40 object-cover rounded-md border mb-4"
          />
        )}

        {/* Content */}
        <div>
          <Label>Content</Label>
          <Textarea rows={10} {...register("content")} />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full py-3"
          disabled={mutation.isPending || uploading}
        >
          {mutation.isPending
            ? "Saving..."
            : mode === "add"
            ? "Publish Blog"
            : "Update Blog"}
        </Button>
      </form>
    </div>
  );
}
