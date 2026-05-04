const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Category = require('./Category');
const Course = require('./Course');
const CourseType = require('./CourseType');
const CourseSchedule = require('./CourseSchedule');
const Order = require('./Order');
const Teacher = require('./Teacher');
const Location = require('./Location');
const Banner = require('./Banner');
const Notice = require('./Notice');
const Message = require('./Message');

// ===== 关联关系 =====

// User <-> Student
User.hasMany(Student, { foreignKey: 'user_id', as: 'students' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category <-> Course
Category.hasMany(Course, { foreignKey: 'category_id', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Course <-> CourseType
Course.hasMany(CourseType, { foreignKey: 'course_id', as: 'courseTypes' });
CourseType.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// CourseType <-> CourseSchedule
CourseType.hasMany(CourseSchedule, { foreignKey: 'course_type_id', as: 'schedules' });
CourseSchedule.belongsTo(CourseType, { foreignKey: 'course_type_id', as: 'courseType' });

// Order 关联
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Order.belongsTo(CourseType, { foreignKey: 'course_type_id', as: 'courseType' });
Order.belongsTo(CourseSchedule, { foreignKey: 'schedule_id', as: 'schedule' });
Order.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Course.hasMany(Order, { foreignKey: 'course_id', as: 'orders' });
CourseSchedule.hasMany(Order, { foreignKey: 'schedule_id', as: 'orders' });

module.exports = {
  sequelize,
  User,
  Student,
  Category,
  Course,
  CourseType,
  CourseSchedule,
  Order,
  Teacher,
  Location,
  Banner,
  Notice,
  Message
};
