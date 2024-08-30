// src/components/CourseList.js
import React from 'react';

const CourseList = ({ courses, onSelectCourse }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {courses.map(course => (
        <div key={course.id} className="p-4 border rounded shadow-sm" onClick={() => onSelectCourse(course.id)}>
          <h2 className="text-xl font-bold">{course.name}</h2>
          <p>Instructor: {course.instructor}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
