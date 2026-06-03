import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../components/customer/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      const url = category ? `/api/products?category=${category}` : '/api/products';
      const { data } = await axios.get(url);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['electronics', 'clothing', 'home', 'beauty', 'toys', 'books', 'other'];

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      
      {/* Category Filter */}
      <div className="mb-8 flex gap-2 flex-wrap">
        <button onClick={() => setCategory('')} className={`px-4 py-2 rounded ${!category ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {products.length === 0 && <p className="text-center text-gray-500">No products found.</p>}
    </div>
  );
};

export default ProductsPage;