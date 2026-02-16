// Mock student database
// Real student database
export const studentsDatabase = [
    { rollNo: "701", name: "ABDUL MALEK" },
    { rollNo: "702", name: "ABU SAYEM SIFAT" },
    { rollNo: "703", name: "ALINOR SHADHIN" },
    { rollNo: "704", name: "H.M.ANAMUL HASAN" },
    { rollNo: "705", name: "ANISUR RAHMAN" },
    { rollNo: "706", name: "ANSAR AHMED" },
    { rollNo: "707", name: "ARIF BILLAH SHAFI" },
    { rollNo: "708", name: "KHANDOKAR HABIBUR RAHMAN" },
    { rollNo: "709", name: "MAHEDI HASAN AFRIDI" },
    { rollNo: "711", name: "MD HASAN MAHMUD" },
    { rollNo: "712", name: "MD MUSTAFIZUR RAHMAN" },
    { rollNo: "713", name: "MD SAJIB" },
    { rollNo: "714", name: "MOHAMMAD SOHEL" },
    { rollNo: "715", name: "MD. ABDUR RAHIM" },
    { rollNo: "716", name: "MD SAKIL ASLAM" },
    { rollNo: "717", name: "NURUN NOBI" },
    { rollNo: "718", name: "ABRAR" },
    { rollNo: "719", name: "NASIM MUHAMMAD RIDWAN" },
    { rollNo: "720", name: "SHAIKH MD IBRAHIM RAHAT" },
    { rollNo: "721", name: "MD SHARIFUL ISLAM" },
    { rollNo: "722", name: "TORIKUL ISLAM ROHAN" },
];

// Function to find student by roll number
export const findStudentByRoll = (rollNo) => {
    return studentsDatabase.find(
        (student) => student.rollNo.toLowerCase() === rollNo.toLowerCase().trim()
    );
};
