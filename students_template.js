// Real student database - Replace with your actual student data
export const studentsDatabase = [
    // ============================================
    // আপনার আসল শিক্ষার্থীদের ডেটা এখানে যোগ করুন
    // Format: { rollNo: "রোল_নম্বর", name: "শিক্ষার্থীর_নাম" },
    // ============================================

    // Example entries (এগুলো মুছে দিয়ে আপনার ডেটা যোগ করুন):
    { rollNo: "101", name: "Rahim Ahmed" },
    { rollNo: "102", name: "Karim Hassan" },
    { rollNo: "103", name: "Fatima Khan" },
    { rollNo: "104", name: "Ayesha Rahman" },
    { rollNo: "105", name: "Imran Ali" },
    { rollNo: "106", name: "Nadia Begum" },
    { rollNo: "107", name: "Tariq Mahmud" },
    { rollNo: "108", name: "Sadia Islam" },
    { rollNo: "109", name: "Farhan Chowdhury" },
    { rollNo: "110", name: "Zara Hossain" },
    { rollNo: "111", name: "Bilal Sheikh" },
    { rollNo: "112", name: "Maryam Siddiqui" },

    // ============================================
    // নিচে আপনার নতুন শিক্ষার্থী যোগ করুন:
    // ============================================

    // { rollNo: "2301", name: "আপনার শিক্ষার্থীর নাম" },
    // { rollNo: "2302", name: "আপনার শিক্ষার্থীর নাম" },
    // { rollNo: "2303", name: "আপনার শিক্ষার্থীর নাম" },
    // আরও যোগ করুন...
];

// Function to find student by roll number
// এই function টি পরিবর্তন করার প্রয়োজন নেই
export const findStudentByRoll = (rollNo) => {
    return studentsDatabase.find(
        (student) => student.rollNo.toLowerCase() === rollNo.toLowerCase().trim()
    );
};
