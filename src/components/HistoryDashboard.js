import React from 'react';

const HistoryDashboard = ({ products, onDeleteProduct }) => {
  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Your Product History</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li
              key={product.productBuyId}
              className="mb-4 p-4 border rounded flex items-center"
            >
              <div className="flex-shrink-0 w-24 h-24 mr-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p>{product.description}</p>
                <p className="text-gray-500">Price: ${product.price}</p>
                <p className="text-gray-500">Quantity: {product.quantity}</p>
                {product.duration && (
                  <p className="text-gray-500">
                    Duration: {new Date(product.duration).toLocaleDateString()} 
                  </p>
                )}
                <button
                  onClick={() => onDeleteProduct(product.productBuyId)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete History
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryDashboard;
