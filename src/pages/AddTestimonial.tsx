import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ⭐ ADD THIS
import { testimonialApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function AddTestimonial() {
  const { toast } = useToast();
  const navigate = useNavigate();   // ⭐ ADD THIS

  const [form, setForm] = useState({
    name: "",
    role: "",
    location: "",
    rating: 5,
    savedAmount: "",
    savedType: "",
    testimonial: "",
    category: "" as "" | "business" | "home" | "personal",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageKey, setImageKey] = useState("");
  const [loading, setLoading] = useState(false);

  // AUTO UPLOAD FILE
  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      toast({ title: "Uploading image..." });

      const payload = {
        files: [{ fileName: file.name, fileType: file.type }],
        uploadType: "testimonials",
      };

      const presignRes = await fetch("https://backend.infinz.seabed2crest.com/api/v1/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await presignRes.json();
      const { url, key } = json.data[0];

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setImageKey(key);

      toast({
        title: "Image Uploaded ✔",
        description: "Your image has been successfully uploaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload Failed",
        description: "Could not upload image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT FORM
  const handleSubmit = async () => {
    if (!imageKey)
      return toast({
        title: "Image Required",
        description: "Please upload an image.",
        variant: "destructive",
      });

    if (!form.category)
      return toast({
        title: "Select Category",
        description: "Please choose a category.",
        variant: "destructive",
      });

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        role: form.role,
        location: form.location,
        rating: Number(form.rating),
        savedAmount: Number(form.savedAmount),
        savedType: form.savedType,
        testimonial: form.testimonial,
        category: form.category,
        image: imageKey,
      };

      await testimonialApi.create(payload);

      toast({
        title: "Success",
        description: "Testimonial added successfully!",
      });

      // Reset form
      setForm({
        name: "",
        role: "",
        location: "",
        rating: 5,
        savedAmount: "",
        savedType: "",
        testimonial: "",
        category: "",
      });
      setImageKey("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add testimonial.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 border rounded-lg mt-6">

      {/* 🔙 BACK BUTTON */}
      <Button variant="outline" onClick={() => navigate("/admin/testimonials")}>
        ← Back
      </Button>

      <h2 className="text-2xl font-bold">Add Testimonial</h2>

      {/* NAME */}
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      {/* ROLE */}
      <div className="space-y-2">
        <Label>Role</Label>
        <Input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
      </div>

      {/* LOCATION */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>

      {/* RATING */}
      <div className="space-y-2">
        <Label>Rating (1–5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        />
      </div>

      {/* SAVED AMOUNT */}
      <div className="space-y-2">
        <Label>Saved Amount</Label>
        <Input
          type="number"
          value={form.savedAmount}
          onChange={(e) =>
            setForm({ ...form, savedAmount: e.target.value })
          }
        />
      </div>

      {/* SAVED TYPE */}
      <div className="space-y-2">
        <Label>Saved Type</Label>
        <Input
          placeholder="Saved on Business Loan"
          value={form.savedType}
          onChange={(e) =>
            setForm({ ...form, savedType: e.target.value })
          }
        />
      </div>

      {/* TESTIMONIAL */}
      <div className="space-y-2">
        <Label>Testimonial</Label>
        <Textarea
          rows={4}
          value={form.testimonial}
          onChange={(e) =>
            setForm({ ...form, testimonial: e.target.value })
          }
        />
      </div>

      {/* CATEGORY */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={form.category}
          onValueChange={(value) =>
            setForm({ ...form, category: value as "business" | "home" | "personal" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="space-y-2">
        <Label>Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              handleFileSelect(file);
            }
          }}
        />

        {imageKey && (
          <p className="text-sm text-green-600">Image uploaded ✔</p>
        )}
      </div>

      {/* SUBMIT */}
      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Add Testimonial"}
      </Button>
    </div>
  );
}
