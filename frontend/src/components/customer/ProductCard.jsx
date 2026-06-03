import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product._id, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link to={`/product/${product._id}`}>
        <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">{product.description.substring(0, 60)}...</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
          <button onClick={handleAddToCart} className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;