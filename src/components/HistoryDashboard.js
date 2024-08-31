import React from 'react';

const HistoryDashboard = ({ products, onDeleteProduct }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Product History</h2>
      {products.length === 0 ? (
        <p className="text-center">No products found.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.productBuyId}
              className="flex flex-col sm:flex-row items-start bg-white border rounded-lg shadow-md p-4 space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <div className="flex-shrink-0 w-full sm:w-32 h-32 sm:h-32">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                <p className="mb-2">{product.description}</p>
                <p className="text-gray-500 mb-2">Price: ${product.price}</p>
                <p className="text-gray-500 mb-2">Quantity: {product.quantity}</p>
                {product.duration && (
                  <p className="text-gray-500 mb-2">
                    Duration: {new Date(product.duration).toLocaleDateString()}
                  </p>
                )}
                <button
                  onClick={() => onDeleteProduct(product.productBuyId)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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
