import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

type Category = "business" | "home" | "personal";


export default function AddEditTestimonial() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();               // ✅ used for edit mode
  const location = useLocation();
  const isEditMode = location.pathname.includes("edit");

  const [loading, setLoading] = useState(false);
  const [imageKey, setImageKey] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "",
    location: "",
    rating: 5,
    savedAmount: "",
    savedType: "",
    testimonial: "",
    category: "" as Category,
  });

  // ---------------------------
  // FETCH DATA FOR EDIT MODE
  // ---------------------------
  useEffect(() => {
    if (isEditMode && id) {
      fetchTestimonial();
    }
  }, [id]);

  const fetchTestimonial = async () => {
    try {
      setLoading(true);
      const res = await testimonialApi.getById(id!);
      const data = res.data;

      setForm({
        name: data.name,
        role: data.role,
        location: data.location,
        rating: data.rating,
        savedAmount: String(data.savedAmount),
        savedType: data.savedType,
        testimonial: data.testimonial,
        category: data.category,
      });

      setImageKey(data.image);
      setPreviewUrl(`https://infinz.s3.amazonaws.com/${data.image}`);

    } catch (err) {
      toast({
        title: "Failed to load testimonial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // IMAGE UPLOAD
  // ---------------------------
  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      toast({ title: "Uploading image..." });

      const payload = {
        files: [{ fileName: file.name, fileType: file.type }],
        uploadType: "testimonials",
      };

      const presignRes = await fetch(
        "https://backend.infinz.seabed2crest.com/api/v1/presigned-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await presignRes.json();
      const { url, key } = json.data[0];

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setImageKey(key);
      setPreviewUrl(`https://infinz.s3.amazonaws.com/${key}`);

      toast({
        title: "Image Uploaded",
        description: "Upload completed",
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // SUBMIT HANDLER
  // ---------------------------
  const handleSubmit = async () => {
    if (!form.name || !form.testimonial || !form.category) {
      return toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
    }

    if (!imageKey) {
      return toast({
        title: "Image Required",
        description: "Please upload an image",
        variant: "destructive",
      });
    }

    const payload = {
      ...form,
      rating: Number(form.rating),
      savedAmount: Number(form.savedAmount),
      image: imageKey,
    };

    try {
      setLoading(true);

      if (isEditMode && id) {
        await testimonialApi.update(id, payload);
        toast({ title: "Testimonial updated" });
      } else {
        await testimonialApi.create(payload);
        toast({ title: "Testimonial created" });
      }

      navigate("/admin/testimonials");
    } catch (err) {
      toast({
        title: "Save failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 border rounded-lg mt-6">

      <Button variant="outline" onClick={() => navigate("/admin/testimonials")}>
        ← Back
      </Button>

      <h2 className="text-2xl font-bold">
        {isEditMode ? "Edit Testimonial" : "Add Testimonial"}
      </h2>

      {/* NAME */}
      <Field label="Name">
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      {/* ROLE */}
      <Field label="Role">
        <Input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
      </Field>

      {/* LOCATION */}
      <Field label="Location">
        <Input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </Field>

      {/* RATING */}
      <Field label="Rating (1-5)">
        <Input
          type="number"
          min="1"
          max="5"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        />
      </Field>

      {/* SAVED AMOUNT */}
      <Field label="Saved Amount">
        <Input
          type="number"
          value={form.savedAmount}
          onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
        />
      </Field>

      {/* SAVED TYPE */}
      <Field label="Saved Type">
        <Input
          value={form.savedType}
          onChange={(e) => setForm({ ...form, savedType: e.target.value })}
        />
      </Field>

      {/* TESTIMONIAL */}
      <Field label="Testimonial">
        <Textarea
          value={form.testimonial}
          onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
        />
      </Field>

      {/* CATEGORY */}
      <Field label="Category">
        <Select
          value={form.category}
          onValueChange={(value: Category) =>
            setForm({ ...form, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* IMAGE */}
      <Field label="Image">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleFileSelect(e.target.files[0])
          }
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 rounded-full mt-3 object-cover"
          />
        )}
      </Field>

      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
      </Button>
    </div>
  );
}

// Small helper wrapper
const Field = ({ label, children }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);
