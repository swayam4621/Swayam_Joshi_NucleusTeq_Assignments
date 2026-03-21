//adding initial data

const students = [
    {
        name: "Lalit",
        marks: [
            { subject: "Math", score: 78 },
            { subject: "English", score: 82 },
            { subject: "Science", score: 74 },
            { subject: "History", score: 69 },
            { subject: "Computer", score: 88 }
        ],
        attendance: 82
    },
    {
        name: "Rahul",
        marks: [
            { subject: "Math", score: 90 },
            { subject: "English", score: 85 },
            { subject: "Science", score: 80 },
            { subject: "History", score: 76 },
            { subject: "Computer", score: 92 }
        ],
        attendance: 91
    },
    {
        name: "Aman",
        marks: [
            { subject: "Math", score: 35 },
            { subject: "English", score: 50 },
            { subject: "Science", score: 45 },
            { subject: "History", score: 40 },
            { subject: "Computer", score: 55 }
        ],
        attendance: 80
    }
];

//used a map to create a new array of students reduce() helps sum the marks
const resStudents = students.map(student => {
    const totalMarks = student.marks.reduce((sum, item) => sum + item.score, 0);
    const averageMarks = totalMarks / student.marks.length;
    
    return { ...student, totalMarks, averageMarks };
});


//this function checks for 75% attendance and no subject score below 40
function checkfailStudent(student) {
    if (student.attendance < 75) return "Fail (Low Attendance)";
    
    const failscoreSubject = student.marks.find(m => m.score <= 40);
    if (failscoreSubject) return `Fail (Failed in ${failscoreSubject.subject})`;
    
    return null; 
}
