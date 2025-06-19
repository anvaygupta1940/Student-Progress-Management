import axios from 'axios';
import Student from '../models/Student.js';
import ContestHistory from '../models/ContestHistory.js';
import ProblemStats from '../models/ProblemStats.js';

const CF_API_BASE = process.env.CODEFORCES_API_BASE || 'https://codeforces.com/api';

// Retry mechanism for API calls on codeforces server 
const axiosWithRetry = async (url, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Sync individual student data from codeforces api
export const syncStudentData = async (studentId, handle) => {
    try {
        console.log(`🔄 Syncing data for ${handle}...`);

        // Fetching  user information from codeforces 
        const userResponse = await axiosWithRetry(`${CF_API_BASE}/user.info?handles=${handle}`);
        // console.log(`1) Fetched user info for ${handle}>>>`, userResponse);

        if (userResponse.data.status !== 'OK') {
            throw new Error(`Codeforces API error: ${userResponse.data.comment}`);
        }

        const userInfo = userResponse.data.result[0];
        // console.log(`2) User info for ${handle}:`, userInfo);

        // Updating student rating and lasyt synced information
        await Student.findByIdAndUpdate(studentId, {
            currentRating: userInfo.rating || 0,
            maxRating: userInfo.maxRating || 0,
            lastSynced: new Date()
        });

        // Fetching and syncing contest history
        // console.log("3) reached syncContestHistory");
        await syncContestHistory(studentId, handle);

        // Fetching and syncing problem submissions
        // console.log("6) reached syncProblemSubmissions");
        await syncProblemSubmissions(studentId, handle);

        console.log(`✅ Sync completed for ${handle}`);

        return {
            handle,
            currentRating: userInfo.rating || 0,
            maxRating: userInfo.maxRating || 0,
            synced: true
        };
    } catch (error) {
        console.error(`❌ Sync failed for ${handle}:`, error.message);

        // Update last sync time even if failed
        await Student.findByIdAndUpdate(studentId, {
            lastSynced: new Date()
        });

        throw error;
    }
};

// Sync contest history
const syncContestHistory = async (studentId, handle) => {
    try {

        // fetching contest history from codeforces api of a student
        const response = await axiosWithRetry(`${CF_API_BASE}/user.rating?handle=${handle}`);
        // console.log(`4) Fetched contest history for ${handle}>>>`, response);

        if (response.data.status !== 'OK') {
            console.warn(`No contest history found for ${handle}`);
            return;
        }

        const contests = response.data.result;
        // console.log(`5) Contest history for ${handle}:`, contests);

        // lopping through each contest and updating the contest history
        for (const contest of contests) {
            await ContestHistory.findOneAndUpdate(
                {
                    studentId,
                    contestId: contest.contestId.toString()
                },
                {
                    contestName: contest.contestName,
                    rank: contest.rank,
                    ratingChange: contest.newRating - contest.oldRating,
                    newRating: contest.newRating,
                    date: new Date(contest.ratingUpdateTimeSeconds * 1000),
                    contestType: 'CF'
                },
                { upsert: true }   // upsert creates a new document if it doesn't exist
            );
        }

        console.log(`📊 Synced ${contests.length} contests for ${handle}`);
    } catch (error) {
        console.error(`Error syncing contest history for ${handle}:`, error.message);
    }
};

// Sync problem submissions
const syncProblemSubmissions = async (studentId, handle) => {
    try {

        // fetching upto 10,000 submissions of a student from codeforces api
        const response = await axiosWithRetry(`${CF_API_BASE}/user.status?handle=${handle}&from=1&count=10000`);
        // console.log(`7) Fetched problem submissions for ${handle}>>>`, response);

        if (response.data.status !== 'OK') {
            console.warn(`No submissions found for ${handle}`);
            return;
        }

        const submissions = response.data.result;
        // console.log(`8) submissions for ${handle}:`, submissions);
        // filtering out only the solved submissions which are accepted (verdict 'OK')
        const solvedSubmissions = submissions.filter(sub => sub.verdict === 'OK');


        // for each problem , store the first accepted submission and its date
        const uniqueProblems = new Map();
        // store the last submission date for the student
        let lastSubmissionDate = null;


        // looping through each solved submission
        for (const submission of solvedSubmissions) {


            // generating a unique problem ID for each problem.
            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
            // submission date for this problem
            const submissionDate = new Date(submission.creationTimeSeconds * 1000);



            // is the last submission date is null or is the current submission date is greater than the last submission date
            // update the last submission date
            if (!lastSubmissionDate || submissionDate > lastSubmissionDate) {
                lastSubmissionDate = submissionDate;
            }


            // Only keep the first Accepted submission for each problem and if it already exists, then update
            // when the current one is earlier than the existing one
            if (!uniqueProblems.has(problemId) || submissionDate < uniqueProblems.get(problemId).date) {
                uniqueProblems.set(problemId, {
                    submission,
                    date: submissionDate
                });
            }
        }

        // Update student's last submission date
        await Student.findByIdAndUpdate(studentId, {
            lastSubmissionDate
        });

        // console.log("uniqueProblems", uniqueProblems);
        // Save each unique solved problem
        for (const [problemId, data] of uniqueProblems) {
            const { submission, date } = data;

            await ProblemStats.findOneAndUpdate(
                {
                    studentId,
                    submissionId: submission.id.toString()
                },
                {
                    date,
                    rating: submission.problem.rating || 800,
                    solved: true,
                    problemName: submission.problem.name,
                    problemId,
                    tags: submission.problem.tags || [],
                    contestId: submission.problem.contestId?.toString(),
                    index: submission.problem.index,
                    language: submission.programmingLanguage,
                    verdict: submission.verdict
                },
                { upsert: true }  // if exist update, else create new
            );
        }

        console.log(`🧩 Synced ${uniqueProblems.size} solved problems for ${handle}`);
    } catch (error) {
        console.error(`Error syncing problem submissions for ${handle}:`, error.message);
    }
};

// Sync all students
export const syncAllStudentsData = async () => {
    try {
        const students = await Student.find({ isActive: true });
        console.log(`🔄 Starting sync for ${students.length} students...`);

        const results = [];

        for (const student of students) {
            try {
                const result = await syncStudentData(student._id, student.codeforcesHandle);
                results.push({ ...result, success: true });

                // Add delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Failed to sync ${student.codeforcesHandle}:`, error.message);
                results.push({
                    handle: student.codeforcesHandle,
                    success: false,
                    error: error.message
                });
            }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`✅ Sync completed: ${successful} successful, ${failed} failed`);

        return {
            total: students.length,
            successful,
            failed,
            results
        };
    } catch (error) {
        console.error('Error syncing all students:', error);
        throw error;
    }
};