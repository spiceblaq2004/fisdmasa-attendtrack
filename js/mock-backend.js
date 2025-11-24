// FISDMASA AttendTrack - Mock Backend
// Works entirely in browser - No server needed!

class MockBackend {
    constructor() {
        this.init();
    }

    init() {
        // Load data from localStorage or use defaults
        this.users = JSON.parse(localStorage.getItem('fisdmasa_users')) || this.getDefaultUsers();
        this.courses = JSON.parse(localStorage.getItem('fisdmasa_courses')) || this.getDefaultCourses();
        this.attendanceRecords = JSON.parse(localStorage.getItem('fisdmasa_records')) || this.getDefaultRecords();
        this.attendanceSessions = JSON.parse(localStorage.getItem('fisdmasa_sessions')) || [];
        
        this.sessionIdCounter = parseInt(localStorage.getItem('fisdmasa_session_counter')) || 100;
        this.recordIdCounter = parseInt(localStorage.getItem('fisdmasa_record_counter')) || 100;
    }

    getDefaultUsers() {
        return [
            {
                id: 1,
                name: "Kwame Student",
                email: "student@uenr.edu.gh",
                password: "password",
                role: "student",
                studentId: "FSDM2024001",
                department: "FSDM"
            },
            {
                id: 2,
                name: "Dr. Mensah",
                email: "lecturer@uenr.edu.gh", 
                password: "password",
                role: "lecturer",
                department: "FSDM"
            },
            {
                id: 3,
                name: "Admin User",
                email: "admin@uenr.edu.gh",
                password: "password",
                role: "admin",
                department: "FSDM"
            }
        ];
    }

    getDefaultCourses() {
        return [
            {
                id: 1,
                courseCode: "FSDM 301",
                courseName: "Fire Dynamics",
                lecturer: 2,
                students: [1],
                schedule: "Mon, Wed 8:00 AM",
                credits: 3
            },
            {
                id: 2, 
                courseCode: "FSDM 303",
                courseName: "Disaster Management",
                lecturer: 2,
                students: [1],
                schedule: "Tue, Thu 10:00 AM",
                credits: 3
            },
            {
                id: 3,
                courseCode: "FSDM 305", 
                courseName: "Safety Engineering",
                lecturer: 2,
                students: [1],
                schedule: "Fri 2:00 PM",
                credits: 2
            }
        ];
    }

    getDefaultRecords() {
        const records = [];
        const today = new Date();
        
        // Generate attendance records for the past 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Only weekdays
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                // FSDM 301 - Mon, Wed
                if (date.getDay() === 1 || date.getDay() === 3) {
                    records.push({
                        id: records.length + 1,
                        session: records.length + 1,
                        student: 1,
                        timestamp: new Date(date.setHours(8, 0, 0)),
                        status: Math.random() > 0.2 ? "present" : "absent",
                        courseId: 1
                    });
                }
                
                // FSDM 303 - Tue, Thu
                if (date.getDay() === 2 || date.getDay() === 4) {
                    records.push({
                        id: records.length + 1,
                        session: records.length + 1,
                        student: 1,
                        timestamp: new Date(date.setHours(10, 0, 0)),
                        status: Math.random() > 0.15 ? "present" : "absent",
                        courseId: 2
                    });
                }
                
                // FSDM 305 - Fri
                if (date.getDay() === 5) {
                    records.push({
                        id: records.length + 1,
                        session: records.length + 1,
                        student: 1,
                        timestamp: new Date(date.setHours(14, 0, 0)),
                        status: Math.random() > 0.1 ? "present" : "absent",
                        courseId: 3
                    });
                }
            }
        }
        
        return records;
    }

    saveData() {
        localStorage.setItem('fisdmasa_users', JSON.stringify(this.users));
        localStorage.setItem('fisdmasa_courses', JSON.stringify(this.courses));
        localStorage.setItem('fisdmasa_records', JSON.stringify(this.attendanceRecords));
        localStorage.setItem('fisdmasa_sessions', JSON.stringify(this.attendanceSessions));
        localStorage.setItem('fisdmasa_session_counter', this.sessionIdCounter.toString());
        localStorage.setItem('fisdmasa_record_counter', this.recordIdCounter.toString());
    }

    // Simulate API delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========== AUTHENTICATION ==========
    async login(email, password) {
        await this.delay(800);
        
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw { error: 'Invalid credentials. Use: student@uenr.edu.gh / password' };
        }

        // Create mock JWT token
        const token = btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            studentId: user.studentId,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        return {
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                department: user.department
            }
        };
    }

    validateToken(token) {
        try {
            const userData = JSON.parse(atob(token));
            if (userData.exp < Date.now()) {
                throw new Error('Token expired');
            }
            return userData;
        } catch (error) {
            throw { error: 'Invalid token' };
        }
    }

    // ========== STUDENT DASHBOARD ==========
    async getStudentDashboard(token) {
        await this.delay(600);
        
        const userData = this.validateToken(token);
        const studentId = userData.userId;

        const studentCourses = this.courses.filter(course => 
            course.students.includes(studentId)
        );

        const studentRecords = this.attendanceRecords.filter(record => 
            record.student === studentId
        );

        // Calculate statistics
        const totalClasses = studentRecords.length;
        const presentClasses = studentRecords.filter(record => record.status === 'present').length;
        const overallAttendance = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        // Course-specific stats
        const courseStats = studentCourses.map(course => {
            const courseRecords = studentRecords.filter(record => record.courseId === course.id);
            const courseTotal = courseRecords.length;
            const coursePresent = courseRecords.filter(record => record.status === 'present').length;
            const courseAttendance = courseTotal > 0 ? (coursePresent / courseTotal) * 100 : 0;

            const lecturer = this.users.find(u => u.id === course.lecturer);

            return {
                courseId: course.id,
                courseCode: course.courseCode,
                courseName: course.courseName,
                lecturer: lecturer ? lecturer.name : 'Unknown',
                schedule: course.schedule,
                credits: course.credits,
                attendance: Math.round(courseAttendance),
                attended: coursePresent,
                total: courseTotal,
                status: this.getAttendanceStatus(courseAttendance)
            };
        });

        // Recent attendance
        const recentAttendance = studentRecords
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .map(record => {
                const course = this.courses.find(c => c.id === record.courseId);
                return {
                    date: new Date(record.timestamp).toLocaleDateString(),
                    course: course ? course.courseCode : 'Unknown',
                    status: record.status,
                    time: new Date(record.timestamp).toLocaleTimeString()
                };
            });

        return {
            student: {
                name: userData.name,
                studentId: userData.studentId,
                department: userData.department
            },
            statistics: {
                overallAttendance: Math.round(overallAttendance),
                classesAttended: presentClasses,
                classesMissed: totalClasses - presentClasses,
                totalClasses: totalClasses,
                attendanceStatus: this.getAttendanceStatus(overallAttendance)
            },
            courses: courseStats,
            recentAttendance: recentAttendance
        };
    }

    getAttendanceStatus(percentage) {
        if (percentage >= 80) return { text: 'Excellent', class: 'good', icon: 'fas fa-check-circle' };
        if (percentage >= 70) return { text: 'Good', class: 'warning', icon: 'fas fa-exclamation-circle' };
        return { text: 'Needs Improvement', class: 'danger', icon: 'fas fa-exclamation-triangle' };
    }

    // ========== LECTURER FUNCTIONALITY ==========
    async getLecturerDashboard(token) {
        await this.delay(600);
        
        const userData = this.validateToken(token);
        if (userData.role !== 'lecturer') {
            throw { error: 'Access denied' };
        }

        const lecturerCourses = this.courses.filter(course => course.lecturer === userData.userId);
        
        const courseStats = lecturerCourses.map(course => {
            const courseRecords = this.attendanceRecords.filter(record => record.courseId === course.id);
            const totalStudents = course.students.length;
            const totalClasses = [...new Set(courseRecords.map(r => r.session))].length;
            
            const studentStats = course.students.map(studentId => {
                const studentRecords = courseRecords.filter(record => record.student === studentId);
                const presentCount = studentRecords.filter(record => record.status === 'present').length;
                const attendance = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
                
                const student = this.users.find(u => u.id === studentId);
                return {
                    studentId: student.studentId,
                    name: student.name,
                    attendance: Math.round(attendance),
                    present: presentCount,
                    total: totalClasses,
                    status: this.getAttendanceStatus(attendance)
                };
            });

            const overallAttendance = studentStats.reduce((sum, student) => sum + student.attendance, 0) / studentStats.length;

            return {
                ...course,
                totalStudents,
                totalClasses,
                overallAttendance: Math.round(overallAttendance),
                studentStats: studentStats.sort((a, b) => a.attendance - b.attendance)
            };
        });

        return {
            lecturer: {
                name: userData.name,
                department: userData.department
            },
            courses: courseStats,
            totalCourses: lecturerCourses.length,
            totalStudents: [...new Set(lecturerCourses.flatMap(c => c.students))].length
        };
    }

    async generateQRSession(token, courseId, duration = 15) {
        await this.delay(500);
        
        const userData = this.validateToken(token);
        if (userData.role !== 'lecturer') {
            throw { error: 'Only lecturers can create sessions' };
        }

        const session = {
            id: this.sessionIdCounter++,
            courseId: parseInt(courseId),
            lecturer: userData.userId,
            date: new Date(),
            qrCode: `FISDMA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            isActive: true,
            duration: duration,
            createdAt: new Date()
        };

        this.attendanceSessions.push(session);
        this.saveData();

        // Generate QR code data (in real app, this would be an image)
        const qrData = JSON.stringify({
            sessionId: session.id,
            qrCode: session.qrCode,
            courseId: courseId,
            timestamp: Date.now()
        });

        return {
            session: session,
            qrCode: qrData,
            qrImage: this.generateQRImage(session.qrCode),
            message: 'Attendance session created successfully'
        };
    }

    generateQRImage(qrCode) {
        // Simple ASCII QR code for demonstration
        return `
        ┌──────────────────┐
        │  FISDMASA QR     │
        │                  │
        │  ██████████████  │
        │  ██          ██  │
        │  ██  ██████  ██  │
        │  ██  ██████  ██  │
        │  ██          ██  │
        │  ██████████████  │
        │                  │
        │  ${qrCode.substr(0, 8)}  │
        └──────────────────┘
        `;
    }

    // ========== ATTENDANCE MARKING ==========
    async markAttendance(token, qrCode) {
        await this.delay(400);
        
        const userData = this.validateToken(token);
        const studentId = userData.userId;

        const session = this.attendanceSessions.find(s => s.qrCode === qrCode && s.isActive);
        if (!session) {
            throw { error: 'Invalid or expired QR code' };
        }

        // Check if session is still valid (within duration)
        const sessionAge = Date.now() - new Date(session.createdAt).getTime();
        if (sessionAge > session.duration * 60 * 1000) {
            session.isActive = false;
            this.saveData();
            throw { error: 'QR code has expired' };
        }

        const existingRecord = this.attendanceRecords.find(record => 
            record.session === session.id && record.student === studentId
        );

        if (existingRecord) {
            throw { error: 'Attendance already marked for this session' };
        }

        const record = {
            id: this.recordIdCounter++,
            session: session.id,
            student: studentId,
            courseId: session.courseId,
            timestamp: new Date(),
            status: 'present'
        };

        this.attendanceRecords.push(record);
        this.saveData();

        const course = this.courses.find(c => c.id === session.courseId);
        const lecturer = this.users.find(u => u.id === session.lecturer);

        return {
            message: 'Attendance marked successfully! 🎉',
            record: record,
            course: course,
            lecturer: lecturer,
            session: session
        };
    }

    // ========== ADMIN FUNCTIONALITY ==========
    async getAdminDashboard(token) {
        await this.delay(700);
        
        const userData = this.validateToken(token);
        if (userData.role !== 'admin') {
            throw { error: 'Access denied' };
        }

        const totalStudents = this.users.filter(u => u.role === 'student').length;
        const totalLecturers = this.users.filter(u => u.role === 'lecturer').length;
        const totalCourses = this.courses.length;
        
        const totalRecords = this.attendanceRecords.length;
        const presentRecords = this.attendanceRecords.filter(r => r.status === 'present').length;
        const overallAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

        // Recent activity
        const recentActivity = this.attendanceRecords
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10)
            .map(record => {
                const student = this.users.find(u => u.id === record.student);
                const course = this.courses.find(c => c.id === record.courseId);
                return {
                    student: student ? student.name : 'Unknown',
                    course: course ? course.courseCode : 'Unknown',
                    status: record.status,
                    time: new Date(record.timestamp).toLocaleString()
                };
            });

        return {
            stats: {
                totalStudents,
                totalLecturers,
                totalCourses,
                overallAttendance: Math.round(overallAttendance),
                totalSessions: this.attendanceSessions.length
            },
            recentActivity,
            systemHealth: {
                server: 'Online',
                database: 'Healthy', 
                qrService: 'Active',
                notifications: 'Enabled'
            }
        };
    }

    // ========== ATTENDANCE HISTORY ==========
    async getAttendanceHistory(token, filters = {}) {
        await this.delay(500);
        
        const userData = this.validateToken(token);
        const studentId = userData.userId;

        let records = this.attendanceRecords.filter(record => record.student === studentId);

        // Apply filters
        if (filters.courseId) {
            records = records.filter(record => record.courseId === parseInt(filters.courseId));
        }
        if (filters.month) {
            // Simple month filtering
        }
        if (filters.status) {
            records = records.filter(record => record.status === filters.status);
        }

        const history = records.map(record => {
            const course = this.courses.find(c => c.id === record.courseId);
            const lecturer = this.users.find(u => u.id === course?.lecturer);
            
            return {
                id: record.id,
                date: new Date(record.timestamp).toLocaleDateString(),
                time: new Date(record.timestamp).toLocaleTimeString(),
                courseCode: course ? course.courseCode : 'Unknown',
                courseName: course ? course.courseName : 'Unknown',
                lecturer: lecturer ? lecturer.name : 'Unknown',
                status: record.status,
                timestamp: record.timestamp
            };
        });

        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

// Create global instance
window.mockBackend = new MockBackend();
