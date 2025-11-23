import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function BlogList() {
  const navigate = useNavigate();
  const client = useQueryClient();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const blogsQuery = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await blogApi.getAll();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => blogApi.delete(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["blogs"] });
      setDeleteId(null); // close modal
    },
  });

  if (blogsQuery.isLoading) {
    return <p className="text-center mt-10 text-lg">Loading blogs...</p>;
  }

  if (blogsQuery.isError) {
    return (
      <p className="text-center text-red-600 text-lg">Failed to load blogs.</p>
    );
  }

  const blogs = blogsQuery.data || [];

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Blogs</h1>
          <Button onClick={() => navigate("/admin/blogs/add")}>Add Blog</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.length === 0 && (
            <p className="text-center text-gray-600 col-span-2">
              No blogs found.
            </p>
          )}

          {blogs.map((b: any) => (
            <div
              key={b._id}
              className="border rounded-xl p-4 shadow bg-white hover:shadow-xl transition"
            >
              {b.thumbnail ? (
                <img
                  src={b.thumbnail}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md mb-3">
                  No Image
                </div>
              )}

              <h2 className="text-xl font-semibold line-clamp-1">{b.title}</h2>
              <p className="text-gray-600 text-sm">{b.category}</p>
              <p className="text-gray-600 text-sm">{b.slug}</p>

              <div className="flex gap-3 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/admin/blogs/edit/${b.slug}`)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setDeleteId(b._id)} // open modal
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteId!)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
