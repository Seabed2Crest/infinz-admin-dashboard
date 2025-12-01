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
  const [metaImage, setMetaImage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, "-");

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
      setMetaImage(blogQuery.data.metaImage || "");
    }
  }, [blogQuery.data]);

  // Upload file to S3
  const uploadFile = async (selected: File, setter: (url: string) => void) => {
    setUploading(true);

    try {
      const presigned = await fileApi.getPresigned(selected);
      const uploadData = Array.isArray(presigned.data)
        ? presigned.data[0]
        : presigned.data;

      await fileApi.uploadToS3(uploadData.url, selected);
      const url = `https://infinz.s3.ap-south-1.amazonaws.com/${uploadData.key}`;
      setter(url);
    } catch {
      alert("Upload failed");
    }

    setUploading(false);
  };

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadFile(e.target.files[0], setThumbnail);
    }
  };

  const handleMetaImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadFile(e.target.files[0], setMetaImage);
    }
  };

  // Mutation
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
      metaImage,
    };

    mutation.mutate(payload);
  };

  if (mode === "edit" && blogQuery.isLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {mode === "add" ? "Add Blog" : "Edit Blog"}
        </h1>
        <Button variant="outline" onClick={() => navigate("/admin/blogs")}>
          ← Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* BASIC INFO */}
        <section>
          <h2 className="font-semibold text-lg mb-2">Basic Info</h2>

          <div>
            <Label>Title</Label>
            <Input {...register("title")} placeholder="Blog title..." />
          </div>

          <div>
            <Label>Category</Label>
            <Input {...register("category")} placeholder="Finance, Business..." />
          </div>

          <div>
            <Label>Thumbnail</Label>
            <Input type="file" accept="image/*" onChange={handleThumbnail} />
            {thumbnail && <img src={thumbnail} className="w-36 mt-2 rounded" />}
          </div>
        </section>

        {/* CONTENT */}
        <section>
          <h2 className="font-semibold text-lg mb-2">Content</h2>
          <Textarea rows={10} {...register("content")} />
        </section>

        {/* METADATA */}
        <section className="border-t pt-4">
          <h2 className="font-semibold text-lg mb-3">SEO Metadata</h2>

          <div>
            <Label>Meta Title</Label>
            <Input {...register("metaTitle")} placeholder="SEO title..." />
          </div>

          <div>
            <Label>Meta Description</Label>
            <Textarea
              {...register("metaDescription")}
              rows={3}
              placeholder="Short description for search results..."
            />
          </div>

          <div>
            <Label>Keywords</Label>
            <Input
              {...register("keywords")}
              placeholder="finance, business, money"
            />
          </div>

          <div>
            <Label>Canonical URL</Label>
            <Input
              {...register("canonicalUrl")}
              placeholder="https://yourdomain.com/blog/slug"
            />
          </div>

          <div>
            <Label>Open Graph Image</Label>
            <Input type="file" accept="image/*" onChange={handleMetaImage} />
            {metaImage && <img src={metaImage} className="w-36 mt-2 rounded" />}
          </div>

        </section>

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
