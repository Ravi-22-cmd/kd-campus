const express = require('express');
const router = express.Router();
const { Department, User, Course } = require('../models/models');

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('headFaculty', 'name email phone')
      .populate('faculty', 'name email role')
      .populate('courses', 'name code semester')
      .sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET department by ID with details
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headFaculty', 'name email phone')
      .populate('faculty', 'name email phone role')
      .populate('students', 'name email department')
      .populate('courses', 'name code semester');
    
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    
    res.json({ success: true, department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE new department
router.post('/', async (req, res) => {
  try {
    const { name, code, description, headFacultyId, email, phone, location, established, website } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required' });
    }

    // Check if department already exists
    const existingDept = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existingDept) {
      return res.status(400).json({ success: false, message: 'Department with this name or code already exists' });
    }

    // Verify head faculty exists if provided
    if (headFacultyId) {
      const headFaculty = await User.findById(headFacultyId);
      if (!headFaculty || headFaculty.role !== 'faculty') {
        return res.status(400).json({ success: false, message: 'Invalid head faculty ID' });
      }
    }

    const newDepartment = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headFaculty: headFacultyId,
      email,
      phone,
      location,
      established,
      website,
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Department created successfully', department: newDepartment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE department
router.put('/:id', async (req, res) => {
  try {
    const { name, code, description, headFacultyId, email, phone, location, established, website } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check for duplicate name/code (excluding current department)
    if (name || code) {
      const existing = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          { name: name || department.name },
          { code: code ? code.toUpperCase() : department.code }
        ]
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Department name or code already exists' });
      }
    }

    // Verify head faculty if being updated
    if (headFacultyId) {
      const headFaculty = await User.findById(headFacultyId);
      if (!headFaculty || headFaculty.role !== 'faculty') {
        return res.status(400).json({ success: false, message: 'Invalid head faculty ID' });
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name: name || department.name,
        code: code ? code.toUpperCase() : department.code,
        description: description !== undefined ? description : department.description,
        headFaculty: headFacultyId || department.headFaculty,
        email: email || department.email,
        phone: phone || department.phone,
        location: location || department.location,
        established: established || department.established,
        website: website || department.website
      },
      { new: true }
    ).populate('headFaculty', 'name email');

    res.json({ success: true, message: 'Department updated successfully', department: updatedDepartment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE (soft delete) department
router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add faculty to department
router.post('/:id/faculty/:facultyId', async (req, res) => {
  try {
    const { id, facultyId } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
    }

    if (department.faculty.includes(facultyId)) {
      return res.status(400).json({ success: false, message: 'Faculty already in this department' });
    }

    department.faculty.push(facultyId);
    await department.save();

    res.json({ success: true, message: 'Faculty added to department', department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Remove faculty from department
router.delete('/:id/faculty/:facultyId', async (req, res) => {
  try {
    const { id, facultyId } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department.faculty = department.faculty.filter(f => f.toString() !== facultyId);
    await department.save();

    res.json({ success: true, message: 'Faculty removed from department', department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add course to department
router.post('/:id/course/:courseId', async (req, res) => {
  try {
    const { id, courseId } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    if (department.courses.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'Course already in this department' });
    }

    department.courses.push(courseId);
    await department.save();

    res.json({ success: true, message: 'Course added to department', department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get department statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('faculty', '_id')
      .populate('students', '_id')
      .populate('courses', '_id');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const stats = {
      departmentName: department.name,
      totalFaculty: department.faculty.length,
      totalStudents: department.students.length,
      totalCourses: department.courses.length,
      headFaculty: department.headFaculty,
      established: department.established
    };

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
