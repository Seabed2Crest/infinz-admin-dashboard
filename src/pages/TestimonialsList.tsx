import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ ADD THIS

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { testimonialApi } from "@/lib/api";

interface Testimonial {
  _id?: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  savedAmount: number;
  savedType: string;
  testimonial: string;
  category: string;
  image: string;
}

export default function TestimonialsList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // ⭐ USE NAVIGATE

  const S3_BASE_URL = "https://infinz.s3.amazonaws.com";

  // FETCH ALL TESTIMONIALS
  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      const res = await testimonialApi.getAll();
      setTestimonials(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  // DELETE TESTIMONIAL
  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure want to delete?")) return;

    try {
      await testimonialApi.delete(id);
      fetchTestimonials();
    } catch (error) {
      console.error(error);
      alert("Delete failed!");
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* 🔥 Add Testimonial Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Testimonials</h2>

        <Button onClick={() => navigate("/admin/testimonials/add")}>
          Add Testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <p>No testimonials found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item) => (
            <Card key={item._id} className="shadow-md">
              <CardContent className="p-4 space-y-3">

                <img
                  src={`${S3_BASE_URL}/${item.image}`}
                  alt={item.name}
                  className="w-20 h-20 rounded-full object-cover"
                />

                <div>
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.role}</p>
                </div>

                <p className="text-sm text-gray-500">{item.location}</p>

                <p className="text-sm">⭐ {item.rating} / 5</p>

                <p className="font-medium">
                  ₹{item.savedAmount} — {item.savedType}
                </p>

                <p className="text-xs bg-blue-100 text-blue-700 inline-block px-2 py-1 rounded">
                  {item.category}
                </p>

                <p className="text-sm text-gray-700">
                  {item.testimonial.substring(0, 120)}...
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/testimonials/edit/${item._id}`)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => deleteTestimonial(item._id!)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
