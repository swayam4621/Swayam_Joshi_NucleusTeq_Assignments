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

//apply the 85/70/50 grading 
resStudents.forEach(student => {
    const failReason = checkfailStudent(student);
    // fail status checked before checking grades
    if (failReason) {
        student.grade = failReason;
    } else if (student.averageMarks >= 85) {
        student.grade = "A";
    } else if (student.averageMarks >= 70) {
        student.grade = "B";
    } else if (student.averageMarks >= 50) {
        student.grade = "C";
    } else {
        student.grade = "Fail";
    }
});

//iterating through subjects to find which student scored highest
const allSubjects = ["Math", "English", "Science", "History", "Computer"];

console.log("--- Subject-wise Highest Scores ---");
allSubjects.forEach(sub => {
    let highest = { name: "", score: -1 };
    students.forEach(s => {
        const subjectData = s.marks.find(m => m.subject === sub);
        if (subjectData.score > highest.score) {
            highest = { name: s.name, score: subjectData.score };
        }
    });
    console.log(`Highest in ${sub}: ${highest.name} (${highest.score})`);
});

//calculationg the average for each subject to find out the toughest subject
console.log("\n--- Subject-wise Average Scores ---");
allSubjects.forEach(sub => {
    let subTotal = 0;
    students.forEach(s => {
        subTotal += s.marks.find(m => m.subject === sub).score;
    });
    console.log(`Average ${sub} Score: ${subTotal / students.length}`);
});

//finding topper by comparing totalMarks 
const topper = resStudents.reduce((prev, current) => 
    (prev.totalMarks > current.totalMarks) ? prev : current
);

console.log(`\nClass Topper: ${topper.name} with ${topper.totalMarks} marks`);

// design for the report format
console.log("\n--- Individual Student Analysis ---");
resStudents.forEach(s => {
    console.log(`${s.name} Total Marks: ${s.totalMarks}`);
    console.log(`${s.name} Average: ${s.averageMarks.toFixed(1)}`); //toFixed(1) for clean decimal
    console.log(`${s.name} Grade: ${s.grade}`);
    console.log('-----------------------------');
});
