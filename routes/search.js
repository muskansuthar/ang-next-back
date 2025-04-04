import express from 'express';
import { Category } from '../models/category.js';
import { Product } from '../models/product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = req.query.q; // Query for name or category
    if (!query) {
      return res.status(400).json({ msg: 'Query is required' });
    }

    const items = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Search by product name (case-insensitive)
        {
          category: { 
            $in: await getMatchingCategoryIds(query) // Search by matching category
          },
        },
      ],
    }).populate('category legfinish legmaterial topfinish topmaterial'); // Populate category if needed

    return res.status(200).json({products:items});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const query = req.query.q; // Query for name or category
    if (!query) {
      return res.status(400).json({ msg: 'Query is required' });
    }

    const items = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Search by product name (case-insensitive)
        {
          category: { 
            $in: await getMatchingCategoryIds(query) // Search by matching category
          },
        },
      ],
    }).populate('category'); // Populate category if needed

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to fetch matching category IDs by name
async function getMatchingCategoryIds(query) {
  const matchingCategories = await Category.find({
    name: { $regex: query, $options: 'i' }, // Search category by name
  }).select('_id');
  return matchingCategories.map((cat) => cat._id); // Return matching category IDs
}

export default router;
