// src/db.js

export const database = {
  teachers: [
    { email: "teacher@dhaka.edu", password: "password123", name: "Mr. Ahmed" },
    { email: "01712345678", password: "securepass", name: "Ms. Rahman" }
  ],
  students: [
    { 
      studentClass: "10", 
      roll: "1", 
      password: "studentpass", 
      name: "Sajidul", 
      result: "GPA 5.0" 
    },
    { 
      studentClass: "9", 
      roll: "15", 
      password: "pass", 
      name: "Karim", 
      result: "GPA 4.8" 
    }
  ]
};