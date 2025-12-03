
import React, { useState, useEffect } from 'react';
import { Star, User, ShieldCheck } from 'lucide-react';
import { Review } from '../types';
import { MockBackend } from '../services/mockBackend';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  currentUserId?: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, currentUserId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setReviews(MockBackend.getProductReviews(productId));
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return toast.error("Please login to review");
    
    try {
      MockBackend.submitReview(productId, currentUserId, newRating, comment);
      setReviews(MockBackend.getProductReviews(productId));
      setComment('');
      toast.success("Review submitted!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        Student Reviews ({reviews.length})
      </h3>

      {/* Review List */}
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No reviews yet. Be the first!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{review.userName}</p>
                    {review.verifiedPurchase && (
                      <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                        <ShieldCheck size={10} /> Verified Student
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} className={i >= review.rating ? "text-gray-300" : ""} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(review.date).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      {/* Submission Form */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-4 rounded-xl">
          <h4 className="font-bold text-sm mb-3">Write a Review</h4>
          <div className="flex gap-2 mb-3">
             {[1, 2, 3, 4, 5].map(star => (
               <button 
                 key={star}
                 type="button"
                 onClick={() => setNewRating(star)}
                 className={`transition-colors ${newRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
               >
                 <Star size={20} fill={newRating >= star ? "currentColor" : "none"} />
               </button>
             ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the product?"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ui-blue mb-3"
            rows={3}
            required
          />
          <button 
            type="submit"
            className="bg-ui-blue text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
};
