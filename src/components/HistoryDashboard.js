import React from 'react';

const HistoryDashboard = ({ products, onDeleteProduct }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Product History</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product, index) => (
            <li
              key={`${product.id}-${index}-${product.timestamp}`}
              className="mb-4 p-4 border rounded"
            >
              <h3 className="text-lg font-semibold">{product.title}</h3>
              <p>{product.description}</p>
              <button
                onClick={() => onDeleteProduct(product.id, index, product.timestamp)}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete History
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryDashboard;
