// Mock student database
// Real student database
export const studentsDatabase = [
    // Batch 7
    { rollNo: "701", name: "ABDUL MALEK", batch: "Batch 7" },
    { rollNo: "702", name: "ABU SAYEM SIFAT", batch: "Batch 7" },
    { rollNo: "703", name: "ALINOR SHADHIN", batch: "Batch 7" },
    { rollNo: "704", name: "ANAMUL HASAN", batch: "Batch 7" },
    { rollNo: "705", name: "ANISUR RAHMAN", batch: "Batch 7" },
    { rollNo: "706", name: "ANSAR AHMED", batch: "Batch 7" },
    { rollNo: "707", name: "ARIF BILLAH SHAFI", batch: "Batch 7" },
    { rollNo: "708", name: "HABIBUR RAHMAN", batch: "Batch 7" },
    { rollNo: "709", name: "MAHEDI HASAN AFRIDI", batch: "Batch 7" },
    { rollNo: "710", name: "MD AMINUR RAHMAN", batch: "Batch 7" },
    { rollNo: "711", name: "MD HASAN MAHMUD", batch: "Batch 7" },
    { rollNo: "712", name: "MUSTAFIZUR RAHMAN", batch: "Batch 7" },
    { rollNo: "713", name: "MD SAJIB", batch: "Batch 7" },
    { rollNo: "714", name: "MD SOHEL", batch: "Batch 7" },
    { rollNo: "715", name: "MD. ABDUR RAHIM", batch: "Batch 7" },
    { rollNo: "716", name: "MD.SAKIL ASLAM", batch: "Batch 7" },
    { rollNo: "717", name: "NURUN NOBI", batch: "Batch 7" },
    { rollNo: "718", name: "RAFIQUL ISLAM ABRAR", batch: "Batch 7" },
    { rollNo: "719", name: "RIJWANULLAH NOSIM", batch: "Batch 7" },
    { rollNo: "720", name: "IBRAHIM RAHAT", batch: "Batch 7" },
    { rollNo: "721", name: "SHARIFUL ISLAM", batch: "Batch 7" },
    { rollNo: "722", name: "TORIKUL ISLAM", batch: "Batch 7" },

    // Batch 8
    { rollNo: "801", name: "ABDUL AZIZ", batch: "Batch 8" },
    { rollNo: "802", name: "ABDUL KHALIK", batch: "Batch 8" },
    { rollNo: "803", name: "ABDUS SALAM", batch: "Batch 8" },
    { rollNo: "804", name: "ALIMUL ISLAM KAWSAR", batch: "Batch 8" },
    { rollNo: "805", name: "AMRAN HOSSEN", batch: "Batch 8" },
    { rollNo: "806", name: "ANWAR HOSSEN", batch: "Batch 8" },
    { rollNo: "807", name: "KAZI SHAWAD", batch: "Batch 8" },
    { rollNo: "808", name: "MAHAMUDUL HASAN", batch: "Batch 8" },
    { rollNo: "809", name: "MD ABDUR RAHMAN", batch: "Batch 8" },
    { rollNo: "810", name: "MD ARMAN KHAN DOLON", batch: "Batch 8" },
    { rollNo: "811", name: "MD AZIZUL HAQUE", batch: "Batch 8" },
    { rollNo: "812", name: "MD MAHMUDUL HASAN", batch: "Batch 8" },
    { rollNo: "813", name: "MD RAKIB HASAN", batch: "Batch 8" },
    { rollNo: "814", name: "MD SIFAT", batch: "Batch 8" },
    { rollNo: "815", name: "MD. ABDUR RAHMAN", batch: "Batch 8" },
    { rollNo: "816", name: "MD. NAZMUL ISLAM", batch: "Batch 8" },
    { rollNo: "817", name: "MD. REDOY MIA", batch: "Batch 8" },
    { rollNo: "818", name: "MD. SALIM REZA RONY", batch: "Batch 8" },
    { rollNo: "819", name: "MD. TAWHID ISLAM MASUM", batch: "Batch 8" },
    { rollNo: "820", name: "MD.MAHDI HASAN", batch: "Batch 8" },
    { rollNo: "821", name: "MD.ZIAUL HAQUE ADNAN", batch: "Batch 8" },
    { rollNo: "822", name: "MOHAMMAD ABDULLAH", batch: "Batch 8" },
    { rollNo: "823", name: "MOHAMMAD SAIFUL ALAM", batch: "Batch 8" },
    { rollNo: "824", name: "MOKTADA AS SADAR TOHA", batch: "Batch 8" },
    { rollNo: "825", name: "MOSADDIK HOSAIN SIRAT", batch: "Batch 8" },
    { rollNo: "826", name: "NAIMUR RAHMAN MAHDI", batch: "Batch 8" },
    { rollNo: "827", name: "RAIME ARFIAS", batch: "Batch 8" },
    { rollNo: "828", name: "RANA", batch: "Batch 8" },
    { rollNo: "829", name: "SAKIL PRODAN", batch: "Batch 8" },
    { rollNo: "830", name: "SHAIKH ASHARAFUR RAHAMAN", batch: "Batch 8" },
];

// Function to find student by roll number
export const findStudentByRoll = (rollNo) => {
    return studentsDatabase.find(
        (student) => student.rollNo.toLowerCase() === rollNo.toLowerCase().trim()
    );
};
